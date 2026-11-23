import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import NamespaceStorage from "../entities/NamespaceStorage.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../KoshDbContext.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";

export default class NamespaceStorageEvents extends AuthenticatedEvents<NamespaceStorage> {

    @Inject
    private db: KoshDbContext;

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

    afterInsert(entity: NamespaceStorage, entry: ChangeEntry<NamespaceStorage>) {
        // set ready only if one remote storage is added...
        this.db.namespaces.where(entity, (x, p) => x.id === p.namespaceID && x.storages.some((s) => s.type === "s3"))
            .update((x) => ({ isReady: true }));
    }

    async beforeDelete(entity: NamespaceStorage, entry: ChangeEntry<NamespaceStorage>) {
        const existsRemote = await this.db.namespaceStorages.where(entity, (x, p) => x.namespaceID === p.namespaceID
            && x.storageID !== p.storageID
            && x.type !== "disk"
        ).some();
        if(!existsRemote) {
            throw new EntityAccessError(`Cannot delete remote`);
        }
    }
}