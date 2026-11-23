import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import ImportTask from "../entities/ImportTask.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import WorkflowContext from "@entity-access/entity-access/dist/workflows/WorkflowContext.js";
import ImportActionWorkflow from "../../workflows/import-actions/ImportActionWorkflow.js";

export default class ImportTaskEvents extends AuthenticatedEvents<ImportTask> {

    @Inject wc: WorkflowContext;

    filter(query: IEntityQuery<ImportTask>) {

        if(!this.verify) {
            return query;
        }
        this.sessionUser.ensureLoggedIn();
        if(this.sessionUser.isAdmin) {
            return query;
        }
        return query
            .where(this.sessionUser,
                (x, p) =>
                    x.namespace.namespaceUsers
                        .some((u) =>
                            u.userID === p.userID)
                    || x.bucket.namespace.namespaceUsers
                        .some((u) =>
                            u.userID === p.userID)
            );

    }

    async afterInsert(entity: ImportTask, entry: ChangeEntry<ImportTask>) {
        await ImportActionWorkflow.queue(this.wc, entity.taskID);
    }

}