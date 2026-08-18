/* eslint-disable no-console */
import WebServer from "./WebServer.js";
import { ServiceCollection } from "@entity-access/entity-access/dist/di/di.js";
import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";

import ClusterInstance from "@entity-access/server-pages/dist/ClusterInstance.js";
import { globalEnv } from "./globalEnv.js";
import AuthorizationService from "@entity-access/server-pages/dist/services/AuthorizationService.js";
import { existsSync, unlinkSync } from "node:fs";
import CloudKoshWorkflowContext from "./server/workflows/CloudKoshWorkflowContext.js";
import CloudKoshDbContext from "./server/model/CloudKoshDbContext.js";
import CloudKoshDbContextEvents from "./server/model/CloudKoshDbContextEvents.js";
import AppWorkflowContext from "./server/workflows/AppWorkflowContext.js";
import CloudKoshAuthService from "./server/services/auth/CloudKoshAuthService.js";



class AppServer extends WebServer {

    register() {
        ServiceCollection.registerMultiple("Singleton", [AppWorkflowContext, CloudKoshWorkflowContext], CloudKoshWorkflowContext);
        ServiceCollection.registerMultiple("Scoped", [AppDbContext, CloudKoshDbContext], CloudKoshDbContext);
        ServiceCollection.registerMultiple("Singleton", [ContextEvents, CloudKoshDbContextEvents], CloudKoshDbContextEvents);

        // we will set differently when we go live
        ServiceCollection.registerMultiple("Singleton", [AuthorizationService], CloudKoshAuthService);

        if (globalEnv.isDevTestMode) {
            // register test storage services...
            import("./tests/registerTestStorage.js").catch(console.error);
        }
    }
}

class AppCluster extends ClusterInstance<AppServer> {

    get maxWorkerCount() {
        if (globalEnv.isProductionServer) {
            return super.maxWorkerCount;
        }
        return 2;
    }

    runPrimary(arg: AppServer) {

        const { port } = globalEnv;
        if(typeof port !== "number") {
            if(existsSync(port)) {
                unlinkSync(port);
            }
        }

        const { isTestMode, isDevTestMode, isProductionServer, reverseProxy: { cookieName, erpHost, hybridJetHost } } = globalEnv;
        console.log(JSON.stringify({ isTestMode, isDevTestMode, isProductionServer, reverseProxy: { cookieName, erpHost, hybridJetHost } }));
        return arg.init();
    }

    async runWorker(arg: AppServer) {
        return arg.start();
    }

}

// if (globalEnv.isDevTestMode) {
//     const ws = new AppServer();
//     ws.start().catch(console.error);
// } else {
    // const appInstance = new AppCluster();
    // appInstance.run(new AppServer());
// }


export const appInstance = new AppCluster();
appInstance.run(new AppServer());
