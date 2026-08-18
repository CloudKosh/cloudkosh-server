import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import User from "./entities/User.js";
import UserEvents from "./events/UserEvents.js";

export default class CloudKoshDbContextEvents extends ContextEvents {

    constructor() {
        super();

        this.register(User, UserEvents);
    }

}