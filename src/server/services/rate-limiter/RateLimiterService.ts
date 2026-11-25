import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import sleep from "../../../common/sleep.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";

@RegisterScoped
export default class RateLimiterService {

    @Inject
    db: KoshDbContext;

    @Inject
    sessionUser: SessionUser;

    async acquireForIPBlock(group: string, maxPerSecond = 1/15 ) {
        const ip = (this.sessionUser.ipAddress ?? "local.1").split(/[\.\:]+/).slice(0, -1).join(".");
        return this.acquire(ip, group, maxPerSecond);
    }

    async acquire(ip: string, group: string, maxPerSecond = 1/15 ) {
        const { db } = this;
        let now = DateTime.now;

        group = `${ip}-${group}`;

        const inOneSecond = Math.max(Math.min(3, 1/maxPerSecond), 10);

        for (let index = 0; index < inOneSecond; index++) {


            // we will count total tokens existing...
            const total = await db.rateLimitTokens.where({ group, now }, (x, p) => x.groupName === p.group
                && (x.lockTokenTTL === null || x.lockTokenTTL > p.now))
                .count();


            if (total > maxPerSecond) {
                await sleep(1000);
                now = now.addSeconds(1);
                continue;
            }

            const lockTokenTTL = now.addSeconds(inOneSecond);
            // we are safe to insert one token...
            const token = await db.rateLimitTokens.statements.insert({
                groupName: group,
                lockTokenTTL
            });

            return token.tokenID;
        }

        throw new EntityAccessError(`Rate Limited`, 429);
    }

    async acquireDisposable(
        ip: string,
        group: string,
        maxPerSecond = 1/15
    ) {
        const { db } = this;
        let now = DateTime.now;

        group = `${ip}-${group}`;

        const inOneSecond = 1/maxPerSecond;

        for (;;) {


            // we will count total tokens existing...
            const total = await db.rateLimitTokens.where({ group, now }, (x, p) => x.groupName === p.group
                && (x.lockTokenTTL === null || x.lockTokenTTL > p.now))
                .count();


            if (total > maxPerSecond) {
                await sleep(1000);
                now = now.addSeconds(1);
                continue;
            }

            const lockTokenTTL = now.addSeconds(inOneSecond);
            // we are safe to insert one token...
            const token = await db.rateLimitTokens.statements.insert({
                groupName: group,
                lockTokenTTL
            });

            return {
                async [Symbol.asyncDispose]() {
                    await db.rateLimitTokens.statements.delete({
                        tokenID: token.tokenID
                    });
                }
            };
        }

    }

}