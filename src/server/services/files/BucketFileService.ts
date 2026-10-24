import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import Bucket from "../../model/entities/Bucket.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import HashService from "../hash/HashService.js";
import NamespaceContentService from "../namespace/NamespaceContentService.js";

@RegisterScoped
export default class BucketFileService {

    @Inject
    db: KoshDbContext;

    @Inject
    hashService: HashService;

    @Inject
    contentService: NamespaceContentService;

    getFile(namespace: string, bucket: string, arg2: string) {
        throw new Error("Method not implemented.");
    }

    async saveFile({
        bucket: { bucketID, namespaceID },
        path,
        files
    }: { bucket: Bucket, files: LocalFile[], path: string }) {

        const contents = await Promise.all(files.map((x) => this.contentService.save(namespaceID, x)));

        await using tx = await this.db.connection.createTransaction();

        const size = files.reduce((p, x) => x.contentSize + p,0);
        
        const { bucketFileID } = await this.db.bucketFiles.statements.insert({
            bucketID,
            path,
            contentType: "application/octet-stream",
            size
        });

        let order = 0;

        for(const c of contents) {
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