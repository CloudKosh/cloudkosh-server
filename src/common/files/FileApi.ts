import { existsSync, unlinkSync, mkdirSync } from "fs";

import { dirname } from "path";
import { AsyncFileStream } from "./AsyncStream.js";
import { stat } from "fs/promises";

export function ensureParentFolder(filePath: string) {
    ensureDir(dirname(filePath));
}

export default function ensureDir(folder: string) {

    if (existsSync(folder)) {
        return;
    }

    const parent = dirname(folder);
    if (parent !== "/") {
        ensureDir(parent);
    }

    try {
        mkdirSync(folder);
    } catch (error) {
        if (existsSync(folder)) {
            return;
        }
        console.error(error);
        throw error;
    }

}

export const fileInfo = async (filePath: string) => {
    try {
        return await stat(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }
        throw error;
    }
};


export const deleteIfExists = (path) => existsSync(path) ? unlinkSync(path) : void 0;

export const areFilesEqual = async (file1: string, file2: string) => {

    using f1 = new AsyncFileStream(file1);
    using f2 = new AsyncFileStream(file2);

    if(f1.size !== f2.size) {
        return false;
    }

    for(;;) {
        const [b1,b2] = await Promise.all([f1.read(), f2.read()]);
        if (b1 === null && b2 === null) {
            return f1.readPosition === f2.readPosition;
        }
        if (b1 === null) {
            return false;
        }
        if (b2 === null) {
            return false;
        }
        if (!b1.equals(b2)) {
            return false;
        }
    }

};