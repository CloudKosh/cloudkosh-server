/* eslint-disable no-console */
import { RegisterSingleton, ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import { randomUUID } from "crypto";
import KoshDbContext from "../../model/KoshDbContext.js";
import DbLock from "../../model/entities/DbLock.js";
import sleep from "../../../common/sleep.js";

@RegisterSingleton
export default class DbLockService {

    async lock(key: string, max = DateTime.now.addMinutes(1)): Promise<AsyncDisposable> {
        const l = await this.createLock(key, max);
        const id = setInterval(() => this.renewLock(l).catch(console.error), 5000);
        return {
            [Symbol.asyncDispose]: async () => {
                clearInterval(id);
                const db = ServiceProvider.create(this, KoshDbContext);
                await db.locks.asQuery().delete(l, (x, p) => x.lockID === p.lockID && x.lockSecret === p.lockSecret);
            }
        };
    }

    async cleanup() {
        const db = ServiceProvider.create(this, KoshDbContext);
        await db.locks.asQuery()
            .delete((x) => x.lockTTL < Sql.date.now());
    }

    private async renewLock(l: DbLock) {
        const db = ServiceProvider.create(this, KoshDbContext);
        l.lockTTL = DateTime.now.addSeconds(15);
        await db.locks.where(l, (x, p) => x.lockID === p.lockID && x.lockSecret === p.lockSecret)
            .update(l, (x, p) => ({
                lockTTL: Sql.cast.asDateTime(p.lockTTL) as any
            }));
    }

    private async createLock(lockID: string, max: DateTime) {
        const lockSecret = randomUUID();
        const maxTime = max.msSinceEpoch;
        while(Date.now() < maxTime) {
            try {
                const lockTTL = DateTime.now.addSeconds(15);
                const db = ServiceProvider.create(this, KoshDbContext);
                let l = await db.locks.statements.selectOrInsert({ lockSecret, lockTTL, lockID }, { lockID });
                if(l.lockSecret === lockSecret) {
                    return l;
                }
                /** This statement is atomic */
                const locks = await db.locks.where({ lockID, lockTTL}, (x, p) => x.lockID === p.lockID && (x.lockTTL === null || x.lockTTL < Sql.date.now()))
                    .updateSelect({ lockSecret, lockTTL}, (x, p) => ({
                        lockSecret: p.lockSecret,
                        lockTTL: Sql.cast.asDateTime(p.lockTTL)
                    }));
                l = locks[0];
                if (l) {
                    return l;
                }
                await sleep(1500);
            } catch (error) {
            const msg: string = error.message ?? error.toString();
                if (msg.includes("duplicate key value violates unique constraint")) {
                    continue;
                }
                console.error(error.stack ?? error.toString());
                await sleep(1500);
            }
        }
        throw new Error(`Unable to acquire lock on ${lockID}`);
    }
}
