import Inject, { RegisterSingleton, ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import EncryptionService from "../encryption/EncryptionService.js";
import StorageContent from "../../model/entities/StorageContent.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { Readable } from "node:stream";
import DiskCacheService from "../cache/DiskCacheService.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import NamespaceContent from "../../model/entities/NamespaceContent.js";
import DbLockService from "../db-lock/DbLockService.js";

@RegisterSingleton
export default class StorageService {

    @Inject
    es: EncryptionService;

    @Inject
    diskCache: DiskCacheService;

    @Inject
    dbLocks: DbLockService;

    async save(content: NamespaceContent, file: LocalFile) {

        using scope = ServiceProvider.createScope(this);
        const db = scope.resolve(KoshDbContext);

        const storage = await db.namespaceStorages
            .where(content,
                (x, p) => x.namespaceID === p.namespaceID )
            .orderByDescending((x) => x.writePriority)
            .first();

        const { storageID } = storage;
        const { contentID } = content;

        // this will prevent simultaneous writes...
        await using _lock = await this.dbLocks.lock(`save-${storageID}-${contentID}`);

        await using tx = await db.connection.createTransaction();

        const {
            endpoint,
            region,
            encryptedAccessKeyID,
            encryptedKeySecret,
            bucket: Bucket
        } = storage;

        const accessKeyId = this.es.general.decrypt(encryptedAccessKeyID);
        const secretAccessKey = this.es.general.decrypt(encryptedKeySecret);

        const client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });

        // why this?
        // in case if you accidentally used same storage
        // this would reduce overwriting same content
        const Key = `${content.contentID}/${content.sha256Base24}`;

        await client.send(new PutObjectCommand({
            Bucket,
            Key,
            Body: file.openReadStream()
        }));

        await db.storageContents
            .withKeys({ storageID, contentID })
            .update({ ready: true });

        await tx.commit();
    }

    async download({ namespaceID, contentID }) {
        const cached = await this.diskCache.getOrCreateAsync(`${namespaceID}/${contentID}`, async (lf) => {
            using scope = ServiceProvider.createScope(this);
            const db = scope.resolve(KoshDbContext);
                const sc = await db.storageContents
                    .where({ namespaceID, contentID},
                        (x, p) => x.contentID === p.contentID
                            && x.storage.namespaceID === p.namespaceID
                            && x.ready === true
                        )
                    .orderByDescending((x) => x.storage.readPriority)
                    .include((x) => x.storage)
                    .first();

                if(!sc) {
                    throw new EntityAccessError("no content stored");
                }

                await this.downloadTo(sc, lf);
            });

        return await this.diskCache.link(cached, "file.dat", "application/octet-stream");
    }

    async downloadTo( sc: StorageContent, lf: LocalFile ) {

        const { storage, content } = sc;

        const {
            endpoint,
            region,
            encryptedAccessKeyID,
            encryptedKeySecret,
            bucket: Bucket
        } = storage;

        const accessKeyId = this.es.general.decrypt(encryptedAccessKeyID);
        const secretAccessKey = this.es.general.decrypt(encryptedKeySecret);

        const client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });

        // why this?
        // in case if you accidentally used same storage
        // this would reduce overwriting same content
        const Key = `${content.contentID}/${content.sha256Base24}`;

        const r = await client.send(new GetObjectCommand({
            Bucket,
            Key
        }));

        await lf.writeAll(r.Body as Readable);

    }

}