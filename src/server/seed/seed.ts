import { globalEnv } from "../../globalEnv.js";
import { globalServices } from "../../globalServices.js";
import LockFile from "@entity-access/server-pages/dist/cache/LockFile.js";
import KoshDbContext from "../model/KoshDbContext.js";

export default async function seed() {
    using scope = globalServices.createScope();

    // making sure multiple workers don't interfere
    using _ = await LockFile.lock(`seed-lock-${globalEnv.serverID}.lock`);

    const db = scope.resolve(KoshDbContext);

    const { version } = globalEnv;

    await db.connection.ensureDatabase();
    const migrated = await db.connection.automaticMigrations(db).migrate({
        version,
        name: "main"
    });

    if (!migrated) {
        return;
    }    

}