import Inject from "@entity-access/entity-access/dist/di/di.js";
import EntityEvents from "@entity-access/entity-access/dist/model/events/EntityEvents.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";

export default class BaseEvents<T> extends EntityEvents<T> {

    @Inject
    protected readonly sessionUser: SessionUser;

}