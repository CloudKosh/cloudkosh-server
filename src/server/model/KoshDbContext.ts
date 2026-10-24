import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";
import User from "./entities/User.js";
import Namespace from "./entities/Namespace.js";
import Bucket from "./entities/Bucket.js";
import BucketFile from "./entities/BucketFile.js";
import BucketFileVersion from "./entities/BucketFileVersion.js";
import FileBlock from "./entities/FileBlock.js";
import FileVersionBlock from "./entities/FileVersionBlock.js";
import AccessToken from "./entities/AccessToken.js";

export default class KoshDbContext extends AppDbContext {

    public accessTokens = this.model.register(AccessToken);
    
    public buckets = this.model.register(Bucket);

    public bucketFiles = this.model.register(BucketFile);

    public bucketFileVersions = this.model.register(BucketFileVersion);

    public fileBlocks = this.model.register(FileBlock);

    public fileVersionBlocks = this.model.register(FileVersionBlock);

    public namespaces = this.model.register(Namespace);

    public users = this.model.register(User);

}