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
        const r = await this.client.getBlobClient(path).downloadToFile(file.path);
        if(r.contentType) {
            // @ts-expect-error readonly
            file.contentType = r.contentType;
        }
    }

    async deleteObject(path: string) {
        await this.client.getBlobClient(path).deleteIfExists();
    }


    async listObjects(prefix, continuationToken: string): Promise<IObjectList> {

        console.log(`Listing ${prefix} from ${this.client.accountName}/${this.client.containerName}`)

        if(!prefix) {
            prefix = void 0;
        }

        if(!continuationToken) {
            continuationToken = void 0;
        }

        for await(const page of this.client.listBlobsFlat({
            prefix,
            includeMetadata: true,
            
        }).byPage({
            continuationToken
        })) {
            return {
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