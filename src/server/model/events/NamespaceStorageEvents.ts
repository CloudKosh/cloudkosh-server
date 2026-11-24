import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import NamespaceStorage from "../entities/NamespaceStorage.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../KoshDbContext.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import EncryptionService from "../../services/encryption/EncryptionService.js";

export default class NamespaceStorageEvents extends AuthenticatedEvents<NamespaceStorage> {

    @Inject
    private db: KoshDbContext;

    @Inject
    private es: EncryptionService;

    filter(query: IEntityQuery<NamespaceStorage>) {
        if(this.sessionUser.isAdmin) {
            return query;
        }
        if(!this.verify) {
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

    beforeInsert(entity: NamespaceStorage, entry: ChangeEntry<NamespaceStorage>) {
        if(entity.secretAccessKey) {
            entity.encryptedSecretAccessKey = this.es.general.encrypt(entity.secretAccessKey);
        }
    }

    async afterInsert(entity: NamespaceStorage, entry: ChangeEntry<NamespaceStorage>) {
        // set ready only if one remote storage is added...
        await this.db.namespaces.where(entity, (x, p) => x.id === p.namespaceID && x.storages.some((s) => s.type === "s3"))
            .trace(console.log)
            .update((x) => ({ isReady: true }));
    }

    async beforeDelete(entity: NamespaceStorage, entry: ChangeEntry<NamespaceStorage>) {

        // allow delete if no storage content exists..
        const hasContent = await this.db.storageContents.where(entity, (x, p) => x.storageID === p.storageID).some();
        if(!hasContent) {
            return;
        }
        const existsRemote = await this.db.namespaceStorages.where(entity, (x, p) => x.namespaceID === p.namespaceID
            && x.storageID !== p.storageID
            && x.type !== "disk"
        ).some();
        if(!existsRemote) {
            throw new EntityAccessError(`Cannot delete remote`);
        }
    }
}