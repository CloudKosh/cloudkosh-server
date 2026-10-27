import Page from "@entity-access/server-pages/dist/Page.js";
import parseNodePath from "../../../../common/utils/parseNodePath.js";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { FileResult } from "@entity-access/server-pages/dist/Content.js";
import { parse } from "node:path";
import mime from "mime-types";

export default class extends Page {

    async run() {

        if (!this.childPath.length) {
            return this.notFound();
        }

        const { packageName, path } = parseNodePath(this.childPath);

        const filePath = fileURLToPath(import.meta.resolve(packageName + "/" + path));

        if(!existsSync(filePath)) {
            return this.notFound();
        }

        const { base: fileName } = parse(filePath);

        let contentType = mime.lookup(fileName) || "application/octet-stream";

        /** For safety we should not send text/html type */
        if(contentType === "text/html") {
            contentType = "text/plain";
        }

        return new FileResult(filePath, {
            contentDisposition: "attachment",
            fileName,
            contentType,
        });
    }
}