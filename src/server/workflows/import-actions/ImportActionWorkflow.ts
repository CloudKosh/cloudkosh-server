import Inject from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Workflow, { UniqueActivity } from "@entity-access/entity-access/dist/workflows/Workflow.js";
import WorkflowContext from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import StorageClientService from "../../services/storage-client/StorageClientService.js";
import BucketFileService from "../../services/files/BucketFileService.js";
import DiskCacheService from "../../services/cache/DiskCacheService.js";
import { basename } from "node:path";

export default class ImportActionWorkflow extends Workflow<number> {

    public static taskGroup = "import-actions";

    public static queue(c: WorkflowContext, taskID = 0) {
        return c.queue(ImportActionWorkflow, taskID, {
            id: `import-action-${taskID}-${DateTime.today.msSinceEpoch.toString(36)}`
        });
    }

    async run() {
    
        if(!this.input) {

            // queue all up...
            let start = 0;

            for(;;) {
                start = await this.queueAllTasks(start);
                if(!BigInt(start)) {
                    break;
                }
            }
            return;
        }

        // iterate 1000 times...
        for(let i=0;i<1000;i++) {
            await this.importTask(i);
        }

    }

    @UniqueActivity
    async importTask(
        i,
        @Inject db?: KoshDbContext,
        @Inject sc?: StorageClientService,
        @Inject bfs?: BucketFileService,
        @Inject tf?: DiskCacheService
    ) {
        const id = this.input;
        const task = await db.importTasks
            .where({ id }, (x, p) => x.taskID === p.id)
            .include((x) => [x.bucket, x.namespace])
            .first();

        let { nextToken, bucket, namespace } = task;

        const c = sc.create(task);

        for await(const { paths, next } of c.list(nextToken)) {
            // save all files...
            for(const path of paths) {
                if(bucket) {
                    const file = tf.createTempFile(basename(path));
                    await c.download(path, file);
                    await bfs.saveFile({ bucket, files: file.split() })
                }
            }
            nextToken = next;
        }
        
    }

    @UniqueActivity
    async queueAllTasks(
        start,
        @Inject db?: KoshDbContext
    ) {
        for(let i=0;i<100;i++) {
            const tasks = await db.importTasks.where({ start }, (x, p) => x.taskID > p.start
                    && x.status === "started"
                )
                .limit(100)
                .orderBy((x) => x.taskID)
                .toArray();
            if(!tasks.length) {
                return 0;
            }
            for (const { taskID } of tasks) {
                start = taskID;
                await ImportActionWorkflow.queue(this.context, taskID);
            }
        }
    }

}