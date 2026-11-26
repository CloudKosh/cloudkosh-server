import Page from "@entity-access/server-pages/dist/Page.js";
import { requireAuthorization } from "../../../../../../../../common/requireAuthorization.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import BucketFileService from "../../../../../../../../server/services/files/BucketFileService.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { TempFileResult } from "@entity-access/server-pages/dist/Content.js";
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
        const file = await this.fileService.downloadFile(bucketFile);
        return new TempFileResult(file, {
            contentType: bucketFile.contentType,
        });
    }

}