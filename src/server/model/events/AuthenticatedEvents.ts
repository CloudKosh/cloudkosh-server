import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import BaseEvents from "./BaseEvents.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import { ForeignKeyFilter } from "@entity-access/entity-access/dist/model/events/EntityEvents.js";

const done = Promise.resolve();

/**
 * Everybody can read the entity.
 * But only Admin can modify.
 */
export default class AuthenticatedEvents<T> extends BaseEvents<T> {
    filter(query: IEntityQuery<T>): IEntityQuery<T> {
        if (this.sessionUser.isAdmin) {
            return query;
        }
        if (this.verify) {
            this.sessionUser.ensureLoggedIn(() => new EntityAccessError(`Login Required to get ${this.entityName}`));
        }
        // implementor should create the correct filter..
        return query.where((x) => false);
    }

    modify(query: IEntityQuery<T>): IEntityQuery<T> {
        if (this.sessionUser.isAdmin) {
            return query;
        }
        if (this.verify) {
            this.sessionUser.ensureIsAdmin(() => new EntityAccessError(`Admin access required to modify ${this.entityName}`));
        }
        return query.where((x) => false);
    }

    delete(query: IEntityQuery<T>): IEntityQuery<T> {
        if (this.sessionUser.isAdmin) {
            return query;
        }
        if (this.verify) {
            this.sessionUser.ensureIsAdmin(() => new EntityAccessError(`Admin access required to delete ${this.entityName}`));
        }
        return query.where((x) => false);
    }

    beforeInsert(entity: T, entry: ChangeEntry<T>): void | Promise<void> {
        if (this.verify) {
            this.sessionUser.ensureIsAdmin(() => new EntityAccessError(`Admin access required to insert ${this.entityName}`));
        }
        return done;
    }

    beforeUpdate(entity: T, entry: ChangeEntry<T>): void | Promise<void> {
        if (this.verify) {
            this.sessionUser.ensureIsAdmin(() => new EntityAccessError(`Admin access required to update ${this.entityName}`));
        }
        return done;
    }

    beforeDelete(entity: T, entry: ChangeEntry<T>): void | Promise<void> {
        if (this.verify) {
            this.sessionUser.ensureIsAdmin(() => new EntityAccessError(`Admin access required to delete ${this.entityName}`));
        }
        return done;
    }

    onForeignKeyFilter(filter: ForeignKeyFilter<T, any>): IEntityQuery<any> {
        if(this.verify) {
            if (this.sessionUser.isAdmin) {
                return null;
            }
        }
        // following is commented as it is not sure why it was added.
        // return filter.read().where({}, (x, p) => false);

        return super.onForeignKeyFilter(filter);
    }
}