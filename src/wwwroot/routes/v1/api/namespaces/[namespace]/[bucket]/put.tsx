import Inject from "@entity-access/entity-access/dist/di/di.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../../../../server/model/KoshDbContext.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { Query } from "@entity-access/server-pages/dist/core/Query.js";
import { requireAuthorization } from "../../../../../../../common/requireAuthorization.js";

@requireAuthorization
export default class extends Page {

    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Query("sourceUrl")
    sourceUrl: string;

    @Inject db: KoshDbContext;

    async run() {

        const { namespace, bucket } = this;

        const bucketEntity = await this.db.buckets
            .filtered("modify")
            .where({ namespace, bucket }, (x, p) => x.namespace.name === p.namespace && x.name === p.bucket)
            .first();

        // create file...

        return this.notFound();
    }
}