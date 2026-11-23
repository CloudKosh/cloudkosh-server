import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";

export interface IObject {
    path: string;
    md5?: Uint8Array;
    sha256?: string;
    size: number;
}

export interface IObjectList {
    objects: IObject[];
    next: any;
}

export default abstract class StorageClient {

    abstract save(path: string, file: LocalFile): Promise<void>;

    abstract download(path: string, file: LocalFile): Promise<void>;

    abstract list(nextToken: string): AsyncGenerator<IObjectList>
    
}