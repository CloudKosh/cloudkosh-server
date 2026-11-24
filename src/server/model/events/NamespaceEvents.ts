import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import Namespace from "../entities/Namespace.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../KoshDbContext.js";

export default class NamespaceEvents extends AuthenticatedEvents<Namespace> {

    @Inject db: KoshDbContext;

    filter(query: IEntityQuery<Namespace>) {
        if(this.sessionUser.isAdmin) {
            return query;
        }
        if(!this.verify) {
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

    async afterUpdate(entity: Namespace, entry: ChangeEntry<Namespace>) {
        // set ready only if one remote storage is added...
        await this.db.namespaces.where(entity, (x, p) => x.id === p.id && x.storages.some((s) => s.type === "s3"))
            .trace(console.log)
            .update((x) => ({ isReady: true }));
        
    }

}