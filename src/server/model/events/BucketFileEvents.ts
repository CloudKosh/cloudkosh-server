import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import BucketFile from "../entities/BucketFile.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class BucketFileEvents extends AuthenticatedEvents<BucketFile> {
    filter(query: IEntityQuery<BucketFile>) {
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
                    x.bucket.namespace.namespaceUsers.some(
                        (u) =>
                            u.userID === p.userID));
    }

    override includeFilter(query: IEntityQuery<BucketFile>, type?: any, key?: string) {
        return query;
    }
}