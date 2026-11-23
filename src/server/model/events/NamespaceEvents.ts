import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import Namespace from "../entities/Namespace.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";

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

    beforeInsert(entity: Namespace, entry: ChangeEntry<Namespace>) {
        if(entity.isReady) {
            throw new EntityAccessError("Access denied");
        }
    }

    beforeUpdate(entity: Namespace, entry: ChangeEntry<Namespace>) {
        if(entry.isModified("isReady") && entity.isReady) {
            throw new EntityAccessError("Access denied");
        }
    }

}