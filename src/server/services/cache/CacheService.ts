import { RegisterSingleton, ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import { cacheFor, ICacheContainer, ObjectCache } from "../../../common/cacheFor.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import TimedCache from "@entity-access/entity-access/dist/common/cache/TimedCache.js";

@RegisterSingleton
export default class CacheService implements ICacheContainer<CacheService>
{

    declare cache: ObjectCache<CacheService>;

    appCache = new TimedCache();

    @cacheFor()
    async getBucket(ns: string, name: string) {
        const { id: nsID } = await this.getNamespace(ns);
        using scope = ServiceProvider.createScope(this);
        const db = scope.resolve(KoshDbContext);
        return await db.buckets.where({ nsID, name }, (x, p) =>
            x.name === p.name
            && x.namespaceID === p.nsID
        ).firstOrFail()
    }

    @cacheFor()
    async getNamespace(ns: string) {
        ns = ns.trim().toLowerCase();
        using scope = ServiceProvider.createScope(this);
        const db = scope.resolve(KoshDbContext);
        return await db.namespaces.where({ ns }, (x, p) =>
            x.name === p.ns
        ).firstOrFail();
    }
}