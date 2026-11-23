import Inject, { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import EncryptionService from "../encryption/EncryptionService.js";
import { S3Client } from "@aws-sdk/client-s3";
import S3StorageClient from "./S3StorageClient.js";
import type StorageClient from "./StorageClient.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import AzureBlobStorageClient from "./AzureBlobStorageClient.js";

@RegisterSingleton
export default class StorageClientService {

    @Inject es: EncryptionService;

    create({
        sourceType = "s3",
        type = sourceType,
        accessKeyID,
        encryptedSecretAccessKey,
        encryptedConnectionString = void 0,
        container= void 0,
        region,
        endpoint,
        bucket
    }) {

        switch(type) {
        
            case "s3":

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
            
            case "azure-blob":
            case "azure-blobs":

                const connectionString = this.es.general.decrypt(encryptedConnectionString);
                return new AzureBlobStorageClient(connectionString, container);

        }

        throw new EntityAccessError("Invalid source type");
        

    }

}