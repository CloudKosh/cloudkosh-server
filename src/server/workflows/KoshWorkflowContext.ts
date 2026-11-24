import { IWorkflowStartParams } from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";
import AppWorkflowContext from "./AppWorkflowContext.js";
import sleep from "../../common/sleep.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import DailyWorkflow from "./daily/DailyWorkflow.js";
import ImportActionWorkflow from "./import-actions/ImportActionWorkflow.js";

export default class KoshWorkflowContext extends AppWorkflowContext {

    constructor(s) {
        super(s);

        this.register(DailyWorkflow);
        this.register(ImportActionWorkflow);
    }


    start({ taskGroups,  signal }: IWorkflowStartParams ) {
        this.startDailyWorkflows(signal).catch(console.error);
        return super.start({ taskGroups, signal });
    }


    async startDailyWorkflows(signal: AbortSignal) {

        // we will wait for couple of seconds
        await sleep(5000);

        while(!signal?.aborted) {

            // start all daily workflows...
            const now = DateTime.now.date.msSinceEpoch;
            const id = `daily-${now}`;
            await this.queue(DailyWorkflow, 1, { id });

            await sleep(86400);
        }
    }    
}