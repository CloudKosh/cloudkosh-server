import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import NamespaceStorage from "../entities/NamespaceStorage.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class NamespaceStorageEvents extends AuthenticatedEvents<NamespaceStorage> {

    filter(query: IEntityQuery<NamespaceStorage>) {
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
                    x.namespace.namespaceUsers.some(
                        (u) =>
                            u.userID === p.userID));
    }

    includeFilter(query: IEntityQuery<NamespaceStorage>, type?: any, key?: string) {
        return query;
    }
}