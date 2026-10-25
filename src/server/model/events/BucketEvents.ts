import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import Bucket from "../entities/Bucket.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class BucketEvents extends AuthenticatedEvents<Bucket> {

    filter(query: IEntityQuery<Bucket>) {
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

    includeFilter(query: IEntityQuery<Bucket>, type?: any, key?: string) {
        return query;
    }
}