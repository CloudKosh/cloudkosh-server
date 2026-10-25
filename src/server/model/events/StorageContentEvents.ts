import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import StorageContent from "../entities/StorageContent.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class StorageContentEvents extends AuthenticatedEvents<StorageContent> {

    filter(query: IEntityQuery<StorageContent>) {
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
                    x.storage.namespace.namespaceUsers.some(
                        (u) =>
                            u.userID === p.userID));
    }

    includeFilter(query: IEntityQuery<StorageContent>, type?: any, key?: string) {
        return query;
    }
}