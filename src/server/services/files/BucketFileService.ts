import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import Bucket from "../../model/entities/Bucket.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import HashService from "../hash/HashService.js";
import NamespaceContentService from "../namespace/NamespaceContentService.js";
import BucketFile from "../../model/entities/BucketFile.js";
import DiskCacheService from "../cache/DiskCacheService.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import path from "path";
import { link, unlink } from "fs/promises";

@RegisterScoped
export default class BucketFileService {

    @Inject
    db: KoshDbContext;

    @Inject
    hashService: HashService;

    @Inject
    contentService: NamespaceContentService;

    @Inject
    diskCache: DiskCacheService;

    async getBucketFile({ bucketID }: Bucket, path: string, mode: "read" | "modify" = "read") {
        return await this.db.bucketFiles
            .filtered(mode)
            .where({ bucketID, path },
                (x, p) =>
                    x.bucketID === p.bucketID
                    && x.path === p.path
            ).first();
    }

    async downloadFile(file: BucketFile) {
        const updated = DateTime.from(file.dateUpdated);
        const localPath = `bucket-files/${file.bucketFileID}/${updated.msSinceEpoch.toString(36)}`
        const lf = await this.diskCache.getOrCreateAsync(localPath, async (f) => {

            // download all contents...
            const contents = await this.db.fileBlocks
                .where(file,
                    (x, p) => x.fileID === p.bucketFileID)
                .orderBy((x) => x.order)
                .include((x) => x.content)
                .toArray();

            const files = await Promise.all(contents.map((x) => this.contentService.download(x.content)));

            // for one to one file, we should just link...
            // to save space...
            if(contents.length === 1) {
                // this is long term link
                // not a temp file link
                const first = files[0];
                await unlink(lf.path);
                await link(first.path, lf.path);
                return;
            }

            for(const block of files) {
                for await(const buffer of block.readBuffers()) {
                    await f.append(buffer);
                }
            }

        });
        return await this.diskCache.link(lf, path.basename(localPath), file.contentType);
    }


    async saveFile({
        bucket: { bucketID, namespaceID },
        path,
        files,
        keys,
        urls
    }: {
        bucket: Bucket,
        keys?: string[],
        urls?: string[],
        files?: LocalFile[],
        path: string
    }) {

        let contentIDs: number[];

        if(keys) {
            contentIDs = [];
            for(const key of keys) {
                const blocks = await this.db.fileBlocks
                    .where({ bucketID, key },
                        (x, p) =>
                            x.file.bucketID === p.bucketID
                            && x.file.path === p.key
                    )
                    .orderBy((x) => x.order)
                    .toArray();
                for(const { contentID } of blocks) {
                    contentIDs.push(contentID);
                }
            }
        } else if (urls) {
            // download from all urls..
            contentIDs = await Promise.all(urls.map(
                async (x) =>
                    this.contentService.save(namespaceID,
                        await this.diskCache.download(x)
                    )
                )
            );
        }
        else {
            contentIDs = await Promise.all(files.map(
                (x) =>
                    this.contentService.save(namespaceID, x)
                )
            );
        }

        await using tx = await this.db.connection.createTransaction();

        const size = files.reduce((p, x) => x.contentSize + p,0);
        
        const { bucketFileID } = await this.db.bucketFiles.statements.insert({
            bucketID,
            path,
            contentType: "application/octet-stream",
            size
        });

        let order = 0;

        for(const c of contentIDs) {
            await this.db.fileBlocks.statements.insert({
                fileID: bucketFileID,
                contentID: c,
                order
            });
            order++;
        }

        await tx.commit();
    }

}