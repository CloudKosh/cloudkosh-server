import CheckConstraint from "@entity-access/entity-access/dist/decorators/CheckConstraint.js";
import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Namespace from "./Namespace.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import type BucketFile from "./BucketFile.js";

@Table("Buckets")
@Index({
    name: "IX_Buckets_UniqueName",
    columns: [
        { name: (x) => x.bucketID, descending: false },
        { name: (x) => x.name , descending: false }
    ],
    unique: true
})
@Index({
    name: "IX_Buckets_Name",
    columns: [
        { name: (x) => x.name , descending: false }
    ]
})
@Index({
    name: "IX_Bucket_Host",
    columns: [
        { name: (x) => x.host, descending: false }
    ],
    filter: (x) => x.host !== null
})
@CheckConstraint({
    name: "CC_Bucket_Valid_HostName",
    filter: (x) => x.host === null || Sql.regex.like(x.host, "^[a-z0-9\\-]+$", "i")
})
@CheckConstraint({
    name: "CC_Bucket_Valid_Name",
    filter: (x) => Sql.regex.like(x.name, "^[a-z0-9\\-]+$", "i")
})
export default class Bucket {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    bucketID: number;

    @Column({ dataType: "BigInt"})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.buckets
    })
    namespaceID: number;

    @Column({ dataType: "Char", length: 200 })
    name: string;

    /**
     * If specified, object can be read as public from this host,
     * useful for setting up CDN
     */
    @Column({ dataType: "Char", length: 200 })
    host: string;

    namespace: Namespace;
    bucketFiles: BucketFile[];

}