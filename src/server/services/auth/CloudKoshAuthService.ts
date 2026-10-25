import Inject, { RegisterSingleton, ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import AuthorizationService, { ICookie } from "@entity-access/server-pages/dist/services/AuthorizationService.js";
import TimedCache from "@entity-access/entity-access/dist/common/cache/TimedCache.js";
import MessagingService from "../messaging/MessagingService.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";
import AccessTokenService from "../access-tokens/AccessTokenService.js";
import { IAuthorizationCookie } from "@entity-access/server-pages/dist/services/IAuthorizationCookie.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
interface IUserInfo {
    sessionID: number;
    userID?: number;
    roles?: string[];
    expiry?: Date;
    namespaces?: number[];
}

@RegisterSingleton
export default class CloudKoshAuthService extends AuthorizationService {


    cache = new TimedCache<any,IUserInfo>(60000,90000);
    userIDCache = new TimedCache(90000, 180000);

    @Inject
    ms: MessagingService;

    @Inject
    ats: AccessTokenService;

    constructor() {
        super();
        process.nextTick(() => {
            this.ms.removeUserLoginSessions.on(({ userID }) => this.clearLogin(userID));
        });
    }

    async authorizeRequest(user: SessionUser, p: {
        ip: string,
        cookies: Record<string, string>,
        authorization: string
    }) {
        const { authorization, ip } = p;
        if (authorization) {
            await this.authorizeAccessToken(authorization, ip, user);
        }
        return await super.authorizeRequest(user, p);
    }

    async authorizeAccessToken(authorization: string, ip: string, user: SessionUser) {
        const key = `${ip}:${authorization}`;
        const info = await this.cache.getOrCreateAsync(key, async () => {
            const session = await this.ats.createLoginSession(authorization, ip);
            if (!session) {
                return null;
            }
            return await this.loadSessionFromDb(session.sessionID);
        });
        if (!info) {
            return;
        }
        user.sessionID = info.sessionID;
        if (!info.userID) {
            // delete cache. cache is invalid...
            this.cache.delete(key);
            return;
        }
        user.userID = info.userID;
        user.roles = info.roles;
        user.expiry = info.expiry;
        user.keyPath = key;
        user.namespaces = info.namespaces;
        (user as any).isAuthorized = true;
        this.userIDCache.getOrCreate(user.userID.toString(36), key, (c) => c);
    }

    async loadUserSessionFromCookie(cookie: string, user: SessionUser) {
        const info = await this.cache.getOrCreateAsync(cookie, async () => {
            const sessionID = await this.decode(cookie);
            if (!sessionID) {
                return null;
            }
            return await this.loadSessionFromDb(sessionID);
        });
        if (!info) {
            return;
        }
        user.sessionID = info.sessionID;
        if (!info.userID) {
            // delete cache. cache is invalid...
            this.cache.delete(cookie);
            return;
        }
        user.userID = info.userID;
        user.roles = info.roles;
        user.expiry = info.expiry;
        user.keyPath = cookie;
        user.namespaces = info.namespaces;
        (user as any).isAuthorized = true;
        this.userIDCache.getOrCreate(user.userID.toString(36), cookie, (c) => c);
    }

    async setAuthCookie(user: SessionUser, authCookie: IAuthorizationCookie): Promise<ICookie> {
        if (authCookie === null) {
            const { userID } = user;
            if (userID) {
                this.ms.removeUserLoginSessions.notify({ userID });
            }
            // delete key path...
            if (user.keyPath) {
                this.cache.delete(user.keyPath);
                this.userIDCache.delete(user.userID.toString(36));
            }
        }
        return super.setAuthCookie(user, authCookie);
    }

    async loadSessionFromDb(sessionID: any) {

        /** The new scope will not interfere with existing DbContext for current request */

        using scope = ServiceProvider.createScope(this);
        const db = scope.resolve(KoshDbContext);

        const session = await db.loginSessions.where({ sessionID }, (x, p) => x.sessionID === p.sessionID
            && x.invalid === false)
            .include((x) => [
                x.user.namespaceUsers])
            .first();
        if (!session?.user) {
            return { sessionID };
        }

        // extend session...
        await db.loginSessions.where({ sessionID }, (x, p) => x.sessionID === p.sessionID)
            .update((x) => ({
                expiry: Sql.date.addDays(x.expiry, 7)
            }));

        return {
            sessionID,
            userID: session.userID,
            expiry: session.expiry.asJSDate,
            namespaces: session.user?.namespaceUsers?.map((x) => x.namespaceID) ?? [],
            roles:[] as string[],
            // roles: session.user.roles?.map((x) => x.roleName) ?? [],
            // fileAccessList: session.user.fileAccessList?.map(({ type, file: { path }}) => ({ type, path })) ?? [],
            // webSites: session.user.fileAccessList?.map((x) => x.file?.websiteFolder ? ({type: x.type, path: x.file.path, folderID: x.fileID}) : null)?.filter((x) => x) ?? [],
            invalid: false
        };
    }

    private async clearLogin(userID) {
        try {
            const userKey = userID.toString(36);
            const keyPath = await this.userIDCache.getOrCreate(userKey, null, (c) => c);
            if (keyPath) {
                this.cache.delete(keyPath);
            }
            this.userIDCache.delete(userKey);
        } catch (error) {
            // ignore this error...
            if (error?.message === "not found") {
                return;
            }
            console.warn(error);
        }
    }


}