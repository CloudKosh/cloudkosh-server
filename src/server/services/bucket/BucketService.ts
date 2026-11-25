import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";
import CacheService from "../cache/CacheService.js";

@RegisterScoped
export default class BucketService {

    @Inject db: KoshDbContext;

    @Inject sessionUser: SessionUser;

    @Inject cacheService: CacheService;

    getBucket(namespace: string, bucket: string, mode: "read" | "modify" = "read") {
        const key = `${mode}-${this.sessionUser.userID}-${namespace}-${bucket}`;
        return this.cacheService.appCache
            .getOrCreateAsync(key, async () => this.db.buckets
                .filtered(mode)
                .where({ namespace, bucket },
                    (x, p) =>
                        x.namespace.name === p.namespace
                        && x.name === p.bucket
                )
                .first()
            );
        
    }

}