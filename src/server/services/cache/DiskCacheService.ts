/* eslint-disable no-console */
import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import { join } from "path";
import { link } from "node:fs/promises";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { randomUUID } from "crypto";
import BaseDiskCache from "@entity-access/server-pages/dist/cache/BaseDiskCache.js";
import FileSize from "../../../common/files/FileSize.js";
import { globalEnv } from "../../../globalEnv.js";
import path from "node:path";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import { Readable } from "node:stream";

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

    async download(url: string) {
        const u = new URL(url);
        const rs = await fetch(u);
        if(rs.status > 399) {
            throw new EntityAccessError(`Failed to download ${u}\n${await rs.text()}`);
        }
        const { base } = path.parse(u.pathname);
        const lf = this.createTempFile(base);
        await lf.writeAll(rs.body as any as Readable);
        return lf;
    }

}
