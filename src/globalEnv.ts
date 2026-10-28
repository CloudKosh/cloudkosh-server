import { readFileSync } from "node:fs";
import { tmpdir, hostname } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ensureDir from "./common/files/FileApi.js";

const packageJsonPath = join(fileURLToPath(import.meta.url), "../../package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath , "utf-8"));

const { version } = packageJson;

const isTestMode = /true/i.test(process.env.CLOUD_KOSH_TEST_MODE || "false");

const serverID = process.env.CLOUD_KOSH_SERVER_ID || hostname();

let database = process.env.CLOUD_KOSH_DB_DATABASE ?? "CloudKosh";
const testDatabase = process.env.CLOUD_KOSH_DB_TEST_MODE;
if (testDatabase) {
    database = `${database}_${Date.now()}`;
}

let port = (process.env.PORT || "8080") as any;
if (/^\d+$/.test(port)) {
    port = Number(port) as any;
}

export const globalEnv = {
    host: process.env.APP_HOST,
    port,
    serverPackage: process.env.npm_package_name,
    serverPackageVersion: process.env.npm_package_version,
    serverID,
    version,
    isTestMode,
    workflows: {
        enableInDevMode: /true|yes/i.test(process.env.CLOUD_KOSH_ENABLE_WORKFLOWS_IN_DEV_MODE),
    },
    publicKey: process.env.CLOUD_KOSH_PUBLIC_KEY,
    app: {
        name: process.env.CLOUD_KOSH_APP_NAME ?? "Cloud Kosh",
    },
    smtp: {
        host: process.env.CLOUD_KOSH_SMTP_HOST,
        port: process.env.CLOUD_KOSH_SMTP_PORT,
        secure: /true|yes/i.test(process.env.CLOUD_KOSH_SMTP_SECURE),
        username: process.env.CLOUD_KOSH_SMTP_USERNAME,
        password: process.env.CLOUD_KOSH_SMTP_PASSWORD,
    },
    db: {
        server: process.env.CLOUD_KOSH_DB_SERVER ?? "postgres",
        database,
        host: process.env.CLOUD_KOSH_DB_HOST ?? "localhost",
        port: Number(process.env.CLOUD_KOSH_DB_PORT ?? 5432),
        ssl:  JSON.parse(process.env.CLOUD_KOSH_DB_SSL ?? "null"),
        user: process.env.CLOUD_KOSH_DB_USER ?? "postgres",
        password: process.env.CLOUD_KOSH_DB_PASSWORD ?? "abcd123",
    },
    tmpDir: join(process.env.CLOUD_KOSH_TMP_PATH || tmpdir(), serverID),
    tmpSize: process.env.CLOUD_KOSH_TMP_SIZE || "2gb",
    cacheDir: join(process.env.CLOUD_KOSH_CACHE_PATH || "/cache", serverID),

    cookieName: process.env.CLOUD_KOSH_COOKIE_NAME || ".ck1",

    startTime: Date.now(),
};

ensureDir(globalEnv.tmpDir);
