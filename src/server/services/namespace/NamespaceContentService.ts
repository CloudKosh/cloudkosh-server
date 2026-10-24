import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import HashService from "../hash/HashService.js";
import DbLockService from "../db-lock/DbLockService.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import StorageService from "./StorageService.js";
import Range from "../../../common/Range.js";
import NamespaceContent from "../../model/entities/NamespaceContent.js";
import ServerLogger from "@entity-access/server-pages/dist/core/ServerLogger.js";
import { areFilesEqual } from "../../../common/files/FileApi.js";
import DiskCacheService from "../cache/DiskCacheService.js";

@RegisterScoped
export default class NamespaceContentService {

    @Inject
    private db: KoshDbContext;

    @Inject
    private hashService: HashService;

    @Inject
    private lockService: DbLockService;

    @Inject
    private storageService: StorageService;

    @Inject
    private diskCache: DiskCacheService;

    async download(content: NamespaceContent) {
        const { namespaceID, contentID, sha256Base24 } = content;

        const path = `local-content-cache/${contentID}`;

        return await this.diskCache.getOrCreateAsync(path, async (lf) =>{

            // we should wait if someone is still saving the file for same content id
            await using _lock = await this.lockService.lock(`save-content-${namespaceID}-${sha256Base24}`);

            const storageContent = await this.db.storageContents
                .where(content,
                    (x, p) => x.contentID === p.contentID && x.ready === true
                )
                .orderByDescending((x) => x.storage.readPriority)
                .include((x) => [x.storage])
                .first();

            await this.storageService.downloadTo(storageContent, lf);

        });

    }

    async save(namespaceID, file: LocalFile) {

        const sha256Base24 = await this.hashService.hash(file);

        // we are assuming that 256mb would be saved in 90 seconds...
        // however even blocks of 64mb can be saved..

        for await(const _r of Range.timeRange(90000,15000)) {

            await using _lock = await this.lockService.lock(`save-content-${namespaceID}-${sha256Base24}`);

            let c = await this.db.namespaceContents
                .withKeys({ namespaceID, sha256Base24 })
                .select();

            if(c) {
                if(await this.isContentSame(c, file)) {
                    return c.contentID;
                }
                // there may be collision or failed upload
            }

            // insert...
            c = await this.db.namespaceContents.statements.insert({
                namespaceID,
                sha256Base24
            });

            await this.storageService.save(c, file);
            return c.contentID;
        }
        throw new EntityAccessError(`Could not store content`);
    }

    async isContentSame(c: NamespaceContent, file: LocalFile) {
        try {
            const saved = await this.storageService.download(c);
            return await areFilesEqual(file.path, saved.path);
        } catch (error) {
            ServerLogger.error(error);
        }
        return false;
    }

}