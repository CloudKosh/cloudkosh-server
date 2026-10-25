import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import Namespace from "../entities/Namespace.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class NamespaceEvents extends AuthenticatedEvents<Namespace> {

    filter(query: IEntityQuery<Namespace>) {
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
                    x.namespaceUsers.some(
                        (u) =>
                            u.userID === p.userID));
    }

    includeFilter(query: IEntityQuery<Namespace>, type?: any, key?: string) {
        return query;
    }
}