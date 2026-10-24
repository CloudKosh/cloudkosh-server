import Page from "@entity-access/server-pages/dist/Page.js";
import { requireAuthorization } from "../../../../../../../../common/requireAuthorization.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import BucketFileService from "../../../../../../../../server/services/files/BucketFileService.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { StatusResult } from "@entity-access/server-pages/dist/Content.js";
import BucketService from "../../../../../../../../server/services/bucket/BucketService.js";

@requireAuthorization
export default class extends Page {


    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Inject fileService: BucketFileService;

    @Inject bucketService: BucketService;

    async run() {
        const bucket = await this.bucketService.getBucket(this.namespace, this.bucket);
        const bucketFile = await this.fileService.getBucketFile(bucket, this.childPath.join("/"));
        return new StatusResult(200, {
            "content-type": bucketFile.contentType,
            "content-length": bucketFile.size,
            "last-modified": bucketFile.dateUpdated.toISOString()
        });
    }

}