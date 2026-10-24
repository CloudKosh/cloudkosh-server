import Page from "@entity-access/server-pages/dist/Page.js";
import { requireAuthorization } from "../../../../../../../../common/requireAuthorization.js";
import { Route } from "@entity-access/server-pages/dist/core/Route.js";
import { Query } from "@entity-access/server-pages/dist/core/Query.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import BucketService from "../../../../../../../../server/services/bucket/BucketService.js";
import KoshDbContext from "../../../../../../../../server/model/KoshDbContext.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import BucketFile from "../../../../../../../../server/model/entities/BucketFile.js";
import { IOrderedEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";

@requireAuthorization
export default class extends Page {

    @Route("namespace")
    namespace: string;

    @Route("bucket")
    bucket: string;

    @Query("start")
    start = 0;

    @Query("size")
    size = 1000;

    @Query("prefix")
    prefix = "";

    @Query("depth")
    depth = 0;


    @Query("sort")
    sort: "new" | "id" | "old" | "recent" = "new";

    
    @Inject bucketService: BucketService;

    @Inject db: KoshDbContext;
    
    async run() {

        const bucket = await this.bucketService.getBucket(this.namespace, this.bucket);

        const {
            prefix,
            depth,
            sort,
            start,
            size
        } = this;

        let q = this.db.bucketFiles
            .filtered("read")
            .where(bucket, (x, p)=> x.bucketID === p.bucketID);

        if(prefix) {
            q = q.where({ prefix: prefix + "%" }, (x, p) => Sql.text.like(x.path, p.prefix));
        }
 
        if(depth) {
            q = q.where({ depth}, (x, p) => x.depth === p.depth);
        }

        let sorted: IOrderedEntityQuery<BucketFile>;

        switch(sort) {
            case "new":
                sorted = q.orderByDescending((x) => x.dateCreated);
                break;
            case "old":
                sorted = q.orderBy((x) => x.dateCreated);
                break;
            case "recent":
                sorted = q.orderByDescending((x) => x.dateUpdated);
                break;
            case "id":
            default:
                sorted = q.orderBy((x) => x.bucketFileID);
                break;
        }

        const results = await q.toPage(
            start,
            size,
        );

        return this.json(results)

    }
}