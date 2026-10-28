import { fileURLToPath } from "node:url";
import { globalEnv } from "./globalEnv.js";

export default class StaticResource {

    static toCDN(rel: string) {
        const filePath = fileURLToPath(rel);
        const fullPath = `/ui/packages/${globalEnv.version}${filePath}`;
        // console.log(JSON.stringify({
        //     rel,
        //     fullPath
        // }));
        return fullPath;
    }
}