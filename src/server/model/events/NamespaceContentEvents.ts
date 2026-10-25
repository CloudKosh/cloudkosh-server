import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import NamespaceContent from "../entities/NamespaceContent.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class NamespaceContentEvents extends AuthenticatedEvents<NamespaceContent> {

    filter(query: IEntityQuery<NamespaceContent>) {
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

    includeFilter(query: IEntityQuery<NamespaceContent>, type?: any, key?: string) {
        return query;
    }
}