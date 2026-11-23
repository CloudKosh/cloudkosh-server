import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";

export default abstract class StorageClient {

    abstract save(path: string, file: LocalFile): Promise<void>;

    abstract download(path: string, file: LocalFile): Promise<void>;

}