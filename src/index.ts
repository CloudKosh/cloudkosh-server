/* eslint-disable no-console */
import WebServer from "./WebServer.js";
import { ServiceCollection } from "@entity-access/entity-access/dist/di/di.js";
import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";

import ClusterInstance from "@entity-access/server-pages/dist/ClusterInstance.js";
import { globalEnv } from "./globalEnv.js";
import AuthorizationService from "@entity-access/server-pages/dist/services/AuthorizationService.js";
import { existsSync, unlinkSync } from "node:fs";
import KoshWorkflowContext from "./server/workflows/KoshWorkflowContext.js";
import KoshDbContext from "./server/model/KoshDbContext.js";
import KoshDbContextEvents from "./server/model/KoshDbContextEvents.js";
import AppWorkflowContext from "./server/workflows/AppWorkflowContext.js";
import CloudKoshAuthService from "./server/services/auth/CloudKoshAuthService.js";



class AppServer extends WebServer {

    register() {
        ServiceCollection.registerMultiple("Singleton", [AppWorkflowContext, KoshWorkflowContext], KoshWorkflowContext);
        ServiceCollection.registerMultiple("Scoped", [AppDbContext, KoshDbContext], KoshDbContext);
        ServiceCollection.registerMultiple("Singleton", [ContextEvents, KoshDbContextEvents], KoshDbContextEvents);

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

        const { isTestMode, isDevTestMode, isProductionServer } = globalEnv;
        console.log(JSON.stringify({
            isTestMode,
            isDevTestMode,
            isProductionServer
        }));
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
