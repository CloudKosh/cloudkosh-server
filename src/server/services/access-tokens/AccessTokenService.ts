
import { RegisterSingleton, ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import { cacheFor, ICacheContainer, ObjectCache } from "../../../common/cacheFor.js";

@RegisterSingleton
export default class AccessTokenService implements ICacheContainer<AccessTokenService> {

    cache: ObjectCache<AccessTokenService>;

    async login(tokenID, secret) {
        using scope = ServiceProvider.createScope(this);
        const db = scope.resolve(KoshDbContext);
        const tokens = await db.accessTokens
            .where({ tokenID, secret } , (x, p) =>
                x.tokenID === p.tokenID as any
                && x.secret === p.secret)
            .updateSelect((x) => ({
                lastUsed: Sql.date.now()
            }));
        const token = tokens[0];
        if (!token) {
            throw new EntityAccessError(`Invalid access token`);
        }
        await db.changeSet.getEntry(token).loadNavigationAsync((x) => x.user);
        return token.user;
    }

    @cacheFor()
    async verifyToken(authorization: string) {
        using scope = ServiceProvider.createScope(this);
        authorization = authorization.split(" ").pop();
        const db = scope.resolve(KoshDbContext);
        const [key, secret] = Buffer.from(authorization, "base64").toString("utf8").split(":").map((x) => decodeURIComponent(x)) as any[];
        return await db.accessTokens.where({ key, secret }, (x, p) => x.tokenID === p.key && x.secret === p.secret)
            .firstOrFail();
    }

    @cacheFor()
    async createLoginSession(authorization: string, ip: string) {
        using scope = ServiceProvider.createScope(this);
        authorization = authorization.split(" ").pop();

        let userID;

        const db = scope.resolve(KoshDbContext);

        if(!userID) {

            const [key, secret] = Buffer.from(authorization, "base64").toString("utf8").split(":").map((x) => decodeURIComponent(x)) as any[];
            const users = await db.accessTokens.where({ key, secret }, (x, p) => x.tokenID === p.key && x.secret === p.secret)
                .updateSelect((_x) => ({ lastUsed: Sql.date.now() }));

            const user = users[0];

            if (!user) {
                return null;
            }

            userID  = user.userID;
        }

        const now = DateTime.now;

        const session = await db.loginSessions.statements.insert({
            userID,
            status: "created",
            invalid: false,
            ipAddress: ip,
            expiry: now.addDays(30),
            dateUpdated: now,
            start: now
        });
        return session;
    }

}