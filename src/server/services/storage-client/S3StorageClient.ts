import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import StorageClient, { IObjectList } from "./StorageClient.js";
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export default class S3StorageClient extends StorageClient {

    constructor(
        private readonly client: S3Client,
        private readonly bucket: string,
        root: string = void 0
    ) {
        super(root);
    }

    async write(Key: string, file: LocalFile) {
        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key,
            Body: file.openReadStream()
        }));    
    }

    async read(Key: string, file: LocalFile) {        
        const r = await this.client.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key
        }));

        await file.writeAll(r.Body as Readable);
    }

    async *listObjects(Prefix, next): AsyncGenerator<IObjectList> {

        if(!Prefix) {
            Prefix = void 0;
        }

        for(;;) {
            const r = await this.client.send(new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix,
                ContinuationToken: next
            }));

            next = r.NextContinuationToken;

            yield {
                objects: r.Contents.map((x) => ({
                    path: x.Key,
                    size: x.Size
                })),
                next
            }

            if(!next) {
                break;
            }
        }

    }

}