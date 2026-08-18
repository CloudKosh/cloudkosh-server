import { readFileSync } from "node:fs";
import { tmpdir, hostname } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ensureDir from "./common/files/FileApi.js";

const packageJsonPath = join(fileURLToPath(import.meta.url), "../../package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath , "utf-8"));

const { version } = packageJson;

const isTestMode = /true/i.test(process.env.CASTING_SERVER_TEST_MODE || "false");
const isDevTestMode = /true/i.test(process.env.CASTING_SERVER_DEV_TEST_MODE || "false");
const isProductionServer = /true/i.test(process.env.CASTING_SERVER_IS_PRODUCTION || "false");

const serverID = process.env.CASTING_SERVER_SERVER_ID || hostname();

let database = process.env.CASTING_SERVER_DB_DATABASE ?? "Casting800Test";
const testDatabase = process.env.CASTING_SERVER_DB_TEST_MODE;
if (testDatabase) {
    database = `${database}_${Date.now()}`;
}

let siteGroup = process.env.CASTING_SERVER_SITE_GROUP ?? "";
if (!siteGroup) {
    siteGroup = null;
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
    isProductionServer,
    isDevTestMode,
    disableWorkflows: /yes|true/i.test(process.env.CASTING_SERVER_DISABLE_WORKFLOWS),
    workflows: {
        enableInDevMode: /true|yes/i.test(process.env.CASTING_SERVER_ENABLE_WORKFLOWS_IN_DEV_MODE),
    },
    fcs: {
        port: process.env.FILE_CONVERSION_SERVER_PORT,
        host: null,
    },
    publicKey: process.env.CASTING_SERVER_PUBLIC_KEY,
    secretKey: process.env.CASTING_SERVER_PUBLIC_KEY,
    app: {
        name: process.env.CASTING_SERVER_APP_NAME ?? "800casting",
        isCastyy: /true|yes/i.test(process.env.CASTING_SERVER_IS_CASTYY ?? "false"),
        siteGroup,
        npmVersionKey: process.env.CASTING_SERVER_GIT_PACKAGES_NAME ?? "GitPackages"
    },
    db: {
        server: process.env.CASTING_SERVER_DB_SERVER ?? "sql-server",
        database,
        host: process.env.CASTING_SERVER_DB_HOST ?? "localhost",
        port: Number(process.env.CASTING_SERVER_DB_PORT ?? 1433),
        ssl: process.env.CASTING_SERVER_DB_SSL ?? "null",
        user: process.env.CASTING_SERVER_DB_USER ?? "sa",
        password: process.env.CASTING_SERVER_DB_PASSWORD ?? "$Abcd123",
    },
    geoIP: {
        ipRegistry_co: {
            key: "08gfuqlm94crdob4"
        }
    },
    socialMail: {
        host: process.env.CASTING_SERVER_SOCIAL_MAIL_HOST,
        key: process.env.CASTING_SERVER_SOCIAL_MAIL_KEY,
        accessToken: process.env.CASTING_SERVER_SOCIAL_MAIL_ACCESS_TOKEN
    },
    nsMailer: {
        host: process.env.CASTING_SERVER_NS_MAILER_HOST,
        key: process.env.CASTING_SERVER_NS_MAILER_KEY,
        accessToken: process.env.CASTING_SERVER_NS_MAILER_ACCESS_TOKEN
    },
    puppeteer: {
        port: process.env.CASTING_SERVER_PUPPETEER_PORT ?? 8123,
        host: process.env.CASTING_SERVER_PUPPETEER_HOST ?? "puppeteer-800"
    },
    reverseProxy: {
        erpHost: process.env.CASTING_SERVER_REVERSE_ERP_PROXY,
        hybridJetHost: process.env.CASTING_SERVER_REVERSE_HYBRID_JET_PROXY,
        staticSiteHost: process.env.CASTING_SERVER_REVERSE_HYBRID_STATIC_SITE,
        cookieName: process.env.CASTING_SERVER_REVERSE_PROXY_COOKIE_NAME
    },
    s3: {
        endpoint: process.env.CASTING_SERVER_S3_END_POINT,
        region: process.env.CASTING_SERVER_S3_REGION ?? "us-east-1",
        accessKeyId: process.env.CASTING_SERVER_S3_ACCESS_KEY ?? "S3RVER",
        secretAccessKey: process.env.CASTING_SERVER_S3_SECRET ?? "S3RVER",
        bucket: process.env.CASTING_SERVER_S3_BUCKET ?? "test-bucket"
    },
    azureStorage: {
        connectionString: process.env.CASTING_SERVER_AZURE_BLOB_CONNECTION_STRING
    },
    tmpDir: join(process.env.CASTING_SERVER_TMP_PATH || tmpdir(), serverID),
    tmpSize: process.env.CASTING_SERVER_TMP_SIZE || "2gb",
    cacheDir: join(process.env.CASTING_SERVER_CACHE_PATH || "/cache", serverID),

    cookieName: process.env.CASTING_SERVER_COOKIE_NAME || ".C85Test",

    startTime: Date.now(),
};

ensureDir(globalEnv.tmpDir);

globalEnv.app.siteGroup = globalEnv.app.isCastyy
    ? "Castyy"
    : (/gush/i.test(globalEnv.app.name)
        ? "GushCRM"
        : null);
