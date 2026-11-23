import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import ImportTask from "../entities/ImportTask.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class ImportTaskEvents extends AuthenticatedEvents<ImportTask> {

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

}