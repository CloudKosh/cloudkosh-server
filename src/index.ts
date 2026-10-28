/* eslint-disable no-console */

import ClusterInstance from "@entity-access/server-pages/dist/ClusterInstance.js";
import { globalEnv } from "./globalEnv.js";
import { existsSync, unlinkSync } from "node:fs";
import AppServer from "./AppServer.js";


class AppCluster extends ClusterInstance<AppServer> {

    runPrimary(arg: AppServer) {

        const { port } = globalEnv;
        if(typeof port !== "number") {
            if(existsSync(port)) {
                unlinkSync(port);
            }
        }

        const { isTestMode, } = globalEnv;
        console.log(JSON.stringify({
            isTestMode,
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
