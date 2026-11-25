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

    constructor(private root:string) {

    }

    delete(path: string) {
        if(this.root) {
            path = `${this.root}/${path}`;
        }
        return this.deleteObject(path);
    }

    public download(path: string, file: LocalFile) {
        if(this.root) {
            path = `${this.root}/${path}`;
        }
        return this.read(path, file);
    }

    public save(path: string, file: LocalFile) {
        if(this.root) {
            path = `${this.root}/${path}`;
        }
        return this.write(path, file);
    }

    public list(nextToken: string) {
        return this.listObjects(this.root, nextToken);
    }

    protected abstract write(path: string, file: LocalFile): Promise<void>;

    protected abstract read(path: string, file: LocalFile): Promise<void>;

    protected abstract deleteObject(path: string): Promise<void>;

    protected abstract listObjects(prefix: string, nextToken: string): Promise<IObjectList>
    
}