import { IEntityQuery } from "@entity-access/entity-access/dist/model/IFilterWithParameter.js";
import LoginSession from "../entities/LoginSession.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";

export default class LoginSessionEvents extends AuthenticatedEvents<LoginSession> {
    filter(query: IEntityQuery<LoginSession>) {
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
                    x.userID === p.userID);
    }
}