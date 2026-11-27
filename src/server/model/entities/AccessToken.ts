import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";
import User from "./User.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import Namespace from "./Namespace.js";
import Bucket from "./Bucket.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";

@Table("AccessTokens")
@Index({
    name: "UX_AccessTokens_Title",
    columns: [
        { name: (x) => x.userID, descending: false },
        { name: (x) => x.title, descending: false },
    ],
    filter: (x) => x.title !== null,
    unique: true
})
export default class AccessToken {

    @Column({ dataType: "BigInt", key: true, generated: "identity" })
    tokenID: number;

    @Column({ dataType: "BigInt" })
    @RelateTo(User, {
        property: (x) => x.user,
        inverseProperty: (x) => x.accessTokens
    })
    userID: number;

    @Column({ dataType: "BigInt", nullable: true})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.accessTokens
    })
    namespaceID: number;

    @Column({ dataType: "BigInt", nullable: true})
    @RelateTo(Bucket, {
        property: (x) => x.bucket,
        inverseProperty: (x) => x.accessTokens
    })
    bucketID: number;

    @Column({ dataType: "ByteArray" })
    secretHash: Buffer;

    @Column({ dataType: "Char", length: 400, nullable: true})
    title: string;

    @Column({ dataType: "Char", nullable: true})
    description: string;

    @Column({ dataType: "DateTime", default: () => Sql.date.now()})
    dateCreated: DateTime;

    @Column({ dataType: "DateTime", nullable: true})
    lastUsed: DateTime;

    @Column({ dataType: "Boolean", default: () => true})
    active: boolean;
    
    /**
     * Displayed first time when generated.
     */
    @JsonProperty()
    public displaySecret;

    user: User;

    namespace: Namespace;

    bucket: Bucket;
}