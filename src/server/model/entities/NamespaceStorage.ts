import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Namespace from "./Namespace.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import type StorageContent from "./StorageContent.js";

const storageTypes = [ "s3", "disk" ];
export type storageType = typeof storageTypes[number];


@Table("NamespaceStorages")
@Index({
    name: "IX_NamespaceStorage_Name",
    columns: [
        { name: (x) => x.namespaceID, descending: false },
        { name: (x) => x.name, descending: false }
    ],
    unique: true
})
export default class NamespaceStorage {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    storageID: number;

    @Column({ dataType: "BigInt" })
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.storages
    })
    namespaceID: number;

    @Column({ dataType: "Char", length: 200})
    name: string;

    @Column({ dataType: "Int", default: () => 0 })
    readPriority: number;

    @Column({ dataType: "Int", default: () => 0 })
    writePriority: number;

    @Column({ dataType: "Char", length: 100 })
    type: storageType;

    @Column({ dataType: "Char", length: 200 })
    bucket: string;

    @Column({dataType:"Char", length: 200, nullable: true })
    endpoint: string;

    @Column({dataType:"Char", length: 200, nullable: true })
    region: string;

    @Column({ dataType: "Char", length: 400 })
    encryptedAccessKeyID: string;

    @Column({ dataType: "Char", length: 400 })
    encryptedKeySecret: string;

    namespace: Namespace;
    storageContents: StorageContent[];

}