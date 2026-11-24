import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import StorageClient, { IObjectList } from "./StorageClient.js";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

export default class AzureBlobStorageClient extends StorageClient {

    private client: ContainerClient;

    constructor(
        connectionString: string,
        container: string,
        root: string
    ) {
        super(root);
        const bsc = BlobServiceClient.fromConnectionString(connectionString);
        this.client = bsc.getContainerClient(container);
    }

    async write(path: string, file: LocalFile) {
        await this.client.uploadBlockBlob(path, file.openReadStream(), file.contentSize);
    }

    async read(path: string, file: LocalFile) {
        await this.client.getBlobClient(path).downloadToFile(file.path);
    }

    async * listObjects(prefix, continuationToken: string): AsyncGenerator<IObjectList> {
        for await(const page of await this.client.listBlobsFlat({ prefix, includeMetadata: true, responseFormat: "Arrow"}).byPage({
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