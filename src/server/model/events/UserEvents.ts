import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import User from "../entities/User.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class UserEvents extends AuthenticatedEvents<User> {

    filter(query: IEntityQuery<User>) {
        if(this.verify) {
            this.sessionUser.ensureLoggedIn(); 
        }
        if(this.sessionUser.isAdmin) {
            return query;
        }
        return query.where(this.sessionUser, (x, p) => x.userID === p.userID);
    }

}