/* eslint-disable no-console */
import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import { join } from "path";
import { link } from "node:fs/promises";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { randomUUID } from "crypto";
import BaseDiskCache from "@entity-access/server-pages/dist/cache/BaseDiskCache.js";
import FileSize from "../../../common/files/FileSize.js";
import { globalEnv } from "../../../globalEnv.js";

const cacheRoot = "/cache/kosh";

const tempSize = FileSize.parse(globalEnv.tmpSize);
const minSize = tempSize / 2;

@RegisterSingleton
export default class DiskCacheService extends BaseDiskCache {

    private tmp: BaseDiskCache;

    constructor() {
        super({
            root: join(cacheRoot, "fc"),
            keepTTLSeconds: 86400,
            minSize,
            maxAge:7
        });

        this.tmp = new BaseDiskCache({
            root: join(cacheRoot, "tmp"),
            keepTTLSeconds: 60*60,
            maxAge: 1
        });
    }

    async link(localFile: LocalFile, fileName: string, contentType: string) {
        const file = this.tmp.createTempFileDeleteOnExit([
            randomUUID(),
            fileName], fileName, contentType);
        await link(localFile.path, file.path);
        return file;
    }

}
