import Workflow from "@entity-access/entity-access/dist/workflows/Workflow.js";
import WorkflowContext from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";

export default class ImportActionWorkflow extends Workflow {

    public static taskGroup = "import-actions";

    public static queue(c: WorkflowContext) {
        
    }

    async run() {

    }

}