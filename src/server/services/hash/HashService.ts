import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { createHash, hash } from "node:crypto";

@RegisterSingleton
export default class HashService {

    hash(text: string, salt = "") {
        if(!text) {
            text = salt + text;
        }
        return hash("sha256", text, "buffer")
    }

    async hashFile(file: LocalFile) {
        let hash = createHash("sha256");
        for await(const data of file.readBuffers()) {
            hash = hash.update(data);
        }
        return hash.digest();
    }

}