/* eslint-disable no-console */
import { BaseDriver } from "@entity-access/entity-access/dist/drivers/base/BaseDriver.js";
import SqlServerDriver from "@entity-access/entity-access/dist/drivers/sql-server/SqlServerDriver.js";

import ServerPages from "@entity-access/server-pages/dist/ServerPages.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { globalServices } from "./globalServices.js";
import seed from "./server/seed/seed.js";
import { globalEnv } from "./globalEnv.js";
import SessionSecurity from "@entity-access/server-pages/dist/services/SessionSecurity.js";
import AppWorkflowContext from "./server/workflows/AppWorkflowContext.js";

export default abstract class WebServer {

    abstract register();

    async init(seedDb = true) {
        const encrypt = true;
        const trustServerCertificate = !!(JSON.parse(globalEnv.db.ssl) ?? false);

        // register driver...
        const driver = new P({
            host: globalEnv.db.host,
            port: globalEnv.db.port,
            options: {
                encrypt,
                trustServerCertificate
            },
            database: globalEnv.db.database,
            user: globalEnv.db.user,
            password: globalEnv.db.password,
            requestTimeout: 30000,
            /** Since we are going to use cluster, a single worker should not hold more than 10 connections */
            poolSize: 10
        });

        globalServices.add(BaseDriver, driver);

        this.register();

        // register services...
        await seed(seedDb);
    }

    async start() {

        await this.init(false);

        const server = ServerPages.create(globalServices);

        // ServerPages.log = console.log;

        // // @ts-expect-error readonly
        // const old = server.process;
        // // @ts-expect-error readonly
        // server.process = (rin, rout, trust) => {
        //     console.log(`${rin.method} ${rin.url}`);
        //    return old.call(server, rin, rout, trust);
        // };

        // ServerPages.enableResponseCompression = false;

        server.caseInsensitiveRoutes = true;

        server.logRoutes = console.log;

        server.registerEntityRoutes("/v2025/");

        server.registerRoutes(
            join(dirname(fileURLToPath(import.meta.url)), "./wwwroot/old-routes"));

        server.registerRoutes(
            join(dirname(fileURLToPath(import.meta.url)), "./wwwroot/routes"));

        // Set public key
        SessionSecurity.prototype.publicKey = globalEnv.publicKey;

        const { port } = globalEnv;

        await server.build({
            createSocketService: false,
            host: process.env.HOST,
            port,
            protocol: "http",
            trustProxy: true,
            acmeOptions: null,
            allowHTTP1: true,
            http1Port: 8888
        });

        // run workflows...
        this.runWorkflows();


    }

    public runWorkflows() {

        if (globalEnv.isDevTestMode) {
            if(!globalEnv.workflows.enableInDevMode) {
                return;
            }
        }

        if (globalEnv.disableWorkflows) {
            return;
        }

        globalServices.resolve(AppWorkflowContext).start({
            taskGroups: [ "default", "sync", "sync-queue", "notify", "background", "daily", "batch"]
        }).catch((error) => console.error(error));
    }


}