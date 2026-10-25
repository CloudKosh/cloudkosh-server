import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import User from "./entities/User.js";
import UserEvents from "./events/UserEvents.js";
import AccessToken from "./entities/AccessToken.js";
import AccessTokenEvents from "./events/AccessTokenEvents.js";
import Bucket from "./entities/Bucket.js";
import BucketEvents from "./events/BucketEvents.js";
import BucketFile from "./entities/BucketFile.js";
import BucketFileEvents from "./events/BucketFileEvents.js";

export default class KoshDbContextEvents extends ContextEvents {

    constructor() {
        super();

        this.register(AccessToken, AccessTokenEvents);
        this.register(Bucket, BucketEvents);
        this.register(BucketFile, BucketFileEvents);
        this.register(User, UserEvents);
    }

}