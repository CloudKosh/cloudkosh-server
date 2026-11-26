import Inject from "@entity-access/entity-access/dist/di/di.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { requireAuthorization } from "../../../../../../../common/requireAuthorization.js";
import BucketService from "../../../../../../../server/services/bucket/BucketService.js";
import BucketFileService from "../../../../../../../server/services/files/BucketFileService.js";
import DiskCacheService from "../../../../../../../server/services/cache/DiskCacheService.js";

@requireAuthorization
export default class extends Page<{
    urls: string[],
    keys: string[]
}> {

    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Inject fileService: BucketFileService;

    @Inject bucketService: BucketService;

    @Inject diskCache: DiskCacheService;

    async run() {

        const { keys, urls } = this.body;

        const bucket = await this.bucketService.getBucket(this.namespace, this.bucket);
        await this.fileService.saveFile({
            bucket,
            path: this.childPath.join("/"),
            urls,
            keys
        });
        return this.json({
            saved: this.childPath.join("/")
        })
    }

}