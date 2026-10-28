import { fileURLToPath } from "node:url";
import { globalEnv } from "./globalEnv.js";

export default class StaticResource {

    static toCDN(rel: string) {
        const filePath = fileURLToPath(rel);
        return `/ui/packages/${globalEnv.version}${filePath}`;
    }
}