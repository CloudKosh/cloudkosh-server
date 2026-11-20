import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pkg = readFileSync( fileURLToPath(import.meta.resolve("@cloudkosh/cloudkosh-ui/package.json")), "utf-8");
const { version } = JSON.parse(pkg);

export default class UIResource {

    static cdnURL() {
        // const filePath = fileURLToPath(rel);
        const fullPath = `https://cdn.jsdelivr.net/npm/@cloudkosh/cloudkosh-ui@${version}/dist/App.loader.js`;
        // console.log(JSON.stringify({
        //     rel,
        //     fullPath
        // }));
        return fullPath;
    }
}