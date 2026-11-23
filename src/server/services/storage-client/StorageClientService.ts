import Inject, { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import EncryptionService from "../encryption/EncryptionService.js";
import { S3Client } from "@aws-sdk/client-s3";
import S3StorageClient from "./S3StorageClient.js";
import type StorageClient from "./StorageClient.js";

@RegisterSingleton
export default class StorageClientService {

    @Inject es: EncryptionService;

    create({
        accessKeyID,
        encryptedSecretAccessKey,
        region,
        endpoint,
        bucket
    }) {
        const secretAccessKey = this.es.general.decrypt(encryptedSecretAccessKey);

        const client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKeyID,
                secretAccessKey
            }
        });
        return new S3StorageClient(client, bucket) as StorageClient;

    }

}