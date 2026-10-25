import { randomBytes } from "crypto";

export const newID = () => Date.now().toString(36) + "." + randomBytes(8).readBigUInt64BE().toString(36);