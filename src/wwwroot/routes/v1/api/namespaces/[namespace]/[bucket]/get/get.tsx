import Page from "@entity-access/server-pages/dist/Page.js";
import { requireAuthorization } from "../../../../../../../../common/requireAuthorization.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import BucketFileService from "../../../../../../../../server/services/files/BucketFileService.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { TempFileResult } from "@entity-access/server-pages/dist/Content.js";

@requireAuthorization
export default class extends Page {


    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;


    @Inject fileService: BucketFileService;

    async run() {
        const file = await this.fileService.getFile(this.namespace, this.bucket, this.childPath.join("/"));
        return new TempFileResult(file, {
            
        });
    }

}