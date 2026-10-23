import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Namespace from "./Namespace.js";

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
export default class Bucket {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    bucketID: number;

    @Column({ dataType: "BigInt", length: 200})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.buckets
    })
    namespaceID: string;

    @Column({ dataType: "Char", length: 200 })
    name: string;

    namespace: Namespace;

}