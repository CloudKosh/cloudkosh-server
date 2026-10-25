import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import User from "./entities/User.js";
import UserEvents from "./events/UserEvents.js";
import AccessToken from "./entities/AccessToken.js";
import AccessTokenEvents from "./events/AccessTokenEvents.js";
import Bucket from "./entities/Bucket.js";
import BucketEvents from "./events/BucketEvents.js";
import BucketFile from "./entities/BucketFile.js";
import BucketFileEvents from "./events/BucketFileEvents.js";
import FileBlock from "./entities/FileBlock.js";
import FileBlockEvents from "./events/FileBlockEvents.js";
import Namespace from "./entities/Namespace.js";
import NamespaceEvents from "./events/NamespaceEvents.js";
import NamespaceContent from "./entities/NamespaceContent.js";
import NamespaceContentEvents from "./events/NamespaceContentEvents.js";
import NamespaceStorage from "./entities/NamespaceStorage.js";
import NamespaceStorageEvents from "./events/NamespaceStorageEvents.js";
import StorageContent from "./entities/StorageContent.js";
import StorageContentEvents from "./events/StorageContentEvents.js";
import LoginSession from "./entities/LoginSession.js";
import LoginSessionEvents from "./events/LoginSessionEvents.js";

export default class KoshDbContextEvents extends ContextEvents {

    constructor() {
        super();

        this.register(AccessToken, AccessTokenEvents);
        this.register(Bucket, BucketEvents);
        this.register(BucketFile, BucketFileEvents);
        this.register(FileBlock, FileBlockEvents);
        this.register(LoginSession, LoginSessionEvents);
        this.register(Namespace, NamespaceEvents);
        this.register(NamespaceContent, NamespaceContentEvents);
        this.register(NamespaceStorage, NamespaceStorageEvents);
        this.register(StorageContent, StorageContentEvents);
        this.register(User, UserEvents);
    }

}