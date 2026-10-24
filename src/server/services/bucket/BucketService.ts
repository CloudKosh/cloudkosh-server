import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../model/KoshDbContext.js";

@RegisterScoped
export default class BucketService {

    @Inject db: KoshDbContext;

    async getBucket(namespace: string, bucket: string, mode: "read" | "modify" = "read") {
        const b = await this.db.buckets
            .filtered(mode)
            .where({ namespace, bucket },
                (x, p) =>
                    x.namespace.name === p.namespace
                    && x.name === p.bucket
            )
            .first();
        return b;
    }

}