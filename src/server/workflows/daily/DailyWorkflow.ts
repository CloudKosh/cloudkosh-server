import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import TimeSpan from "@entity-access/entity-access/dist/types/TimeSpan.js";
import Workflow, { UniqueActivity } from "@entity-access/entity-access/dist/workflows/Workflow.js";
import ImportActionWorkflow from "../import-actions/ImportActionWorkflow.js";

export default class DailyWorkflow extends Workflow {

 async run() {

        // in case if we have reached beyond 1 day from start
        // we will skip

        this.preserveTime = TimeSpan.fromHours(30);
        this.failedPreserveTime = TimeSpan.fromHours(4);

        const now = DateTime.now;
        const diff = now.diff(this.currentTime);
        if (diff.totalDays > 1) {
            return;
        }

        const step = TimeSpan.fromMinutes(15);

        for (let index = 0; index < 24*15; index++) {
            await this.startSync(index);
            await this.delay(step);
        }
    }

    @UniqueActivity
    async startSync(
        index: number,
    ) {
        // start workflows....
        await ImportActionWorkflow.queue(this.context);
    }
}