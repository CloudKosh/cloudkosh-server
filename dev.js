import { globalEnv } from "./dist/globalEnv.js";
import AppServer from "./dist/AppServer.js";
import { existsSync, unlinkSync } from "node:fs";

const { port } = globalEnv;
if(typeof port !== "number") {
    if(existsSync(port)) {
        unlinkSync(port);
    }
}

const webServer = new AppServer();
await webServer.start();

