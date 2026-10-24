import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";
import User from "./entities/User.js";
import Namespace from "./entities/Namespace.js";
import Bucket from "./entities/Bucket.js";
import BucketFile from "./entities/BucketFile.js";
import BucketFileVersion from "./entities/BucketFileVersion.js";
import FileBlock from "./entities/FileBlock.js";
import FileVersionBlock from "./entities/FileVersionBlock.js";
import AccessToken from "./entities/AccessToken.js";
import NamespaceContent from "./entities/NamespaceContent.js";
import NamespaceStorage from "./entities/NamespaceStorage.js";
import DbLock from "./entities/DbLock.js";
import StorageContent from "./entities/StorageContent.js";

export default class KoshDbContext extends AppDbContext {

    public accessTokens = this.model.register(AccessToken);

    public locks = this.model.register(DbLock);
    
    public buckets = this.model.register(Bucket);

    public bucketFiles = this.model.register(BucketFile);

    public bucketFileVersions = this.model.register(BucketFileVersion);

    public fileBlocks = this.model.register(FileBlock);

    public fileVersionBlocks = this.model.register(FileVersionBlock);

    public namespaces = this.model.register(Namespace);

    public namespaceContents = this.model.register(NamespaceContent);

    public namespaceStorages = this.model.register(NamespaceStorage);

    public storageContents = this.model.register(StorageContent);

    public users = this.model.register(User);

}