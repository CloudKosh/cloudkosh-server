import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import StorageClient from "./StorageClient.js";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export default class S3StorageClient extends StorageClient {

    constructor(private readonly client: S3Client, private readonly bucket: string) {
        super();
    }

    async save(Key: string, file: LocalFile) {
        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key,
            Body: file.openReadStream()
        }));    
    }

    async download(Key: string, file: LocalFile) {        
        const r = await this.client.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key
        }));

        await file.writeAll(r.Body as Readable);
    }

    async *list(next) {
        
    }

}