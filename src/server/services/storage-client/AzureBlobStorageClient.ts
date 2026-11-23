import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import StorageClient, { IObjectList } from "./StorageClient.js";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

export default class AzureBlobStorageClient extends StorageClient {

    private client: ContainerClient;

    constructor(
        connectionString: string,
        container: string
    ) {
        super();
        const bsc = BlobServiceClient.fromConnectionString(connectionString);
        this.client = bsc.getContainerClient(container);
    }

    async save(path: string, file: LocalFile) {
        await this.client.uploadBlockBlob(path, file.openReadStream(), file.contentSize);
    }

    async download(path: string, file: LocalFile) {
        await this.client.getBlobClient(path).downloadToFile(file.path);
    }

    async * list(continuationToken: string): AsyncGenerator<IObjectList> {
        for await(const page of await this.client.listBlobsFlat({ includeMetadata: true, responseFormat: "Arrow"}).byPage({
            continuationToken
        })) {
            yield {
                objects: page.segment.blobItems.map((x) => ({
                    path: x.name,
                    md5: x.properties.contentMD5,
                    size: x.properties.contentLength
                })),
                next: page.continuationToken
            }
        }
        
    }

}