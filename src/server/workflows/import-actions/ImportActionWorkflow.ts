import Inject from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Workflow, { UniqueActivity } from "@entity-access/entity-access/dist/workflows/Workflow.js";
import WorkflowContext from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import StorageClientService from "../../services/storage-client/StorageClientService.js";
import BucketFileService from "../../services/files/BucketFileService.js";
import DiskCacheService from "../../services/cache/DiskCacheService.js";
import { basename } from "node:path";
import { LocalFile } from "@entity-access/server-pages/dist/core/LocalFile.js";
import { createWriteStream } from "node:fs";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import TaskManager from "@entity-access/entity-access/dist/common/TaskManager.js";

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
            const total = await this.importTask(i);
            if(!total) {
                break;
            }
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
            .include((x) => [x.destBucket, x.destNamespace])
            .first();

        const { taskID } = task;

        let total = 0;

        try {

            let { nextToken, destBucket: koshBucket, destNamespace: namespace, destNamespaceID: namespaceID, objectsImported, sizeImported } = task;

            objectsImported ??= 0;
            sizeImported ??= 0;

            const c = sc.create(task);

            for await(const { objects, next } of c.list(nextToken)) {

                const tm = new TaskManager();
                const tasks = [] as Promise<any>[];

                // save all files...
                for(const { path, size } of objects ) {

                    // @ts-expect-error protected
                    tasks.push(tm.queueRun(async () => {

                        let filePath = path;
                        if(namespace) {
                            // pending...
                            const [bucketName, ... all] = path.split("/");
                            filePath = all.join("/");
                            // auto create bucket...
                            koshBucket = await db.buckets.withKeys({ name: bucketName, namespaceID }).selectOrInsert();
                        } else if(!koshBucket) {
                            throw new EntityAccessError("namespace must or bucket must be specified");
                        }

                        // if exists.. skip...
                        const exists = await db.bucketFiles.withKeys({ bucketID: koshBucket.bucketID, path: filePath })
                            .select();

                        if(exists) {
                            return
                        }

                        total = Number(total) + 1;
                        objectsImported = Number(objectsImported) + 1;
                        sizeImported = Number(sizeImported) + Number(size);
                        const file = tf.createTempFile(basename(path));
                        await c.download(path, file);
                        const files = await this.split(tf, file);
                        await bfs.saveFile({
                            bucket: koshBucket,
                            files,
                            path: filePath,
                            contentType: file.contentType
                        });
                    }));

                }

                await Promise.all(tasks);

                await db.importTasks.withKeys({ taskID }).update({
                    status: "started",
                    sizeImported,
                    objectsImported,
                    nextToken: next,
                    dateUpdated: DateTime.now
                });
                nextToken = next;
                if(total > 10000) {
                    break;
                }
            }
        } catch (error) {
            await db.importTasks.withKeys({ taskID }).update({
                status: "failed",
                dateUpdated: DateTime.now
            });
            console.error(error);
            return total;
        }

        await db.importTasks.withKeys({ taskID }).update({
            status: "completed",
            nextToken: null,
            dateUpdated: DateTime.now
        });

        return total;
        
    }

    @UniqueActivity
    async queueAllTasks(
        start,
        @Inject db?: KoshDbContext
    ) {
        for(let i=0;i<100;i++) {
            const tasks = await db.importTasks.where({ start }, (x, p) => x.taskID > p.start
                    && x.status !== "completed"
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

    async split(tf: DiskCacheService, file: LocalFile) {
        const files = [];
        const total = file.contentSize;
        let start = 0;
        const max = 256*1024*1024;

        if(total < max) {
            return [file];
        }

        const tasks = [];

        while(start < total) {
            const size = start + max > total ? total - start : max;
            const t = tf.createTempFile(file.fileName + "." + Date.now().toString(36));
            tasks.push(file.writeTo(createWriteStream(t.path), { start, end: start + size }));
        }

        await Promise.all(tasks);

        return files;    
    }

}