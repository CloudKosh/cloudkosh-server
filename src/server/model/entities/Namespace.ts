import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import type Bucket from "./Bucket.js";
import type NamespaceStorage from "./NamespaceStorage.js";
import CheckConstraint from "@entity-access/entity-access/dist/decorators/CheckConstraint.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";

/**
 * Id is a key because change of namespace display name
 * should not require changing all derived paths
 */
@Table("Namespaces")
@Index({
    name: "IX_Namespaces_Name",
    columns: [ { name: (x) => x.name , descending: false }],
    unique: true
})
@CheckConstraint({
    name: "CC_Namespace_Valid_Name",
    filter: (x) => Sql.regex.like(x.name, "^[a-z0-9\\-]+$", "i")
})
export default class Namespace {

    @Column({ dataType: "Char", key: true, generated: "identity"})
    id: number;

    @Column({ dataType: "Char", length: 200 })
    name: string;

    @Column({ dataType: "Char", nullable: true})
    description: string;
    buckets: Bucket[];
    storages: NamespaceStorage[];

}