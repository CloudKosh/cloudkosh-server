import Inject from "@entity-access/entity-access/dist/di/di.js";
import Workflow, { UniqueActivity } from "@entity-access/entity-access/dist/workflows/Workflow.js";
import WorkflowContext from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import StorageService from "../../services/namespace/StorageService.js";
import StorageClientService from "../../services/storage-client/StorageClientService.js";
import Range from "../../../common/Range.js";

export default class CleanPartialContentWorkflow extends Workflow {

    static taskGroup = "clean";

    static queue(wc: WorkflowContext) {
        return wc.queue(CleanPartialContentWorkflow, 0, { id: `clean-partial-content`})
    }

    async run() {

        let start = 0;
        for(;;) {
            start = await this.clean(start);
            if(!BigInt(start)) {
                break;
            }
        }

    }

    @UniqueActivity
    async clean(start,
        @Inject db?: KoshDbContext,
        @Inject scs?: StorageClientService
    ) {

        for(const _r of Range.range(0, 100)) {

            const items = await db.namespaceContents.where({ start },
                (x, p) =>
                    x.contentID > p.start
                    && x.ready === false
                    && x.dateCreated < Sql.date.addDays(Sql.date.now(), -1)
                )
                .orderBy((x) => x.contentID)
                .include((x) => x.storageContents.forEach((s) => s.storage))
                .limit(10)
                .toArray();

            if(!items.length) {
                return 0;
            }

            for(const { contentID, storageContents } of items) {
                start = contentID;
                // we might need to delete storageContents..

                if(storageContents) {
                    // for every storage...
                    for(const { content, storage, storageID, contentID } of storageContents) {
                        const sc = scs.create(storage);
                        await sc.delete(content.keyPath);
                        await db.storageContents.withKeys({ storageID, contentID }).delete();
                    }
                }
                await db.namespaceContents.withKeys({ contentID }).delete();
            }

            db.changeSet.clear();
        }

        return start;
    }

}