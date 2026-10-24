import Inject from "@entity-access/entity-access/dist/di/di.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { requireAuthorization } from "../../../../../../../common/requireAuthorization.js";
import BucketService from "../../../../../../../server/services/bucket/BucketService.js";
import BucketFileService from "../../../../../../../server/services/files/BucketFileService.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";

@requireAuthorization
export default class extends Page {


    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Inject fileService: BucketFileService;

    @Inject bucketService: BucketService;

    async run() {

        // based on content type we will prepare...
        if(this.request.headers["content-type"] === "multipart/form-data") {
            await Prepare.parseForm(this);
        } else {
            // not yet supported...
        }

        const bucket = await this.bucketService.getBucket(this.namespace, this.bucket);
        await this.fileService.saveFile({
            bucket,
            path: this.childPath.join("/"),
            files: this.request.form.files
        });
        return this.json({
            saved: this.childPath.join("/")
        })
    }

}