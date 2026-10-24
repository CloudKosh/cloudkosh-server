import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import crypto from "node:crypto";
import { globalEnv } from "../../../globalEnv.js";

const cache = new Map<string, { key, encryptionIV }>();

@RegisterSingleton
export default class EncryptionService {

    global = {
        encrypt: (text: string, publicKey, host: string) => this.encrypt(text, publicKey, "base64url", host),
        decrypt: (text: string, publicKey,  host: string) => this.decrypt(text, publicKey, "base64url", host)
    };

    general = {
        encrypt: (text: string, encoding: BufferEncoding = "base64url") => this.encrypt(text, globalEnv.publicKey, encoding),
        decrypt: (text: string, encoding: BufferEncoding = "base64url") => this.decrypt(text, globalEnv.publicKey, encoding)
    };

    private encrypt(text: string, secretKey , encoding: BufferEncoding = "hex", host = "") {
        const { key, encryptionIV}  = this.createKey(secretKey, host);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, encryptionIV);
        return (cipher.update(text, "utf-8", encoding)
                + cipher.final(encoding)).replaceAll("=", "*");
    }

    private decrypt(text: string, secretKey, encoding: BufferEncoding = "hex", host = "") {
        const { key, encryptionIV}  = this.createKey(secretKey, host);
        text = text.replaceAll("*" , "=");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, encryptionIV);
        return decipher.update(text, encoding, "utf-8") + decipher.final("utf-8");
    }

    private createKey(secretKey: string, host) {

        const cacheKey = `${host}:${secretKey}`;
        let result = cache.get(cacheKey);
        if(!result) {
            const key = crypto.createHash("sha512")
                .update(secretKey)
                .digest("hex")
                .substring(0, 32);

            const encryptionIV = crypto.createHash("sha512")
                .update(host)
                .digest("hex")
                .substring(0, 16);
            result = { key, encryptionIV };
            cache.set(cacheKey, result);
            setTimeout(() => cache.delete(cacheKey), 60000);
        }
        return result;
    }
}
