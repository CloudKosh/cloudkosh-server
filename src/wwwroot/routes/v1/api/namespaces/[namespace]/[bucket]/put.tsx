import Inject from "@entity-access/entity-access/dist/di/di.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../../../../server/model/KoshDbContext.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";

@Prepare.authorize
export default class extends Page {

    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Inject db: KoshDbContext;

    async run() {

        

        return this.notFound();
    }
}