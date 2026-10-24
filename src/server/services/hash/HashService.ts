import { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { createHash } from "node:crypto";

@RegisterScoped
export default class HashService {

    async hash(file: LocalFile) {
        let hash = createHash("sha256");
        for await(const data of file.readBuffers()) {
            hash = hash.update(data);
        }
        return hash.digest("base64url");
    }

}