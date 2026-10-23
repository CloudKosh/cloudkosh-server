import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Namespace from "./Namespace.js";

const storageTypes = [ "s3", "disk" ];
export type storageType = typeof storageTypes[number];


@Table("NamespaceStorages")
export default class NamespaceStorage {

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.storages
    })
    namespaceID: number;

    @Column({ dataType: "Char", length: 200, key: true})
    name: string;

    @Column({ dataType: "Int", default: () => 0 })
    readPriority: number;

    @Column({ dataType: "Int", default: () => 0 })
    writePriority: number;

    @Column({ dataType: "Char", length: 100 })
    type: storageType;

    @Column({ dataType: "Char", length: 200 })
    bucket: string;

    @Column({ dataType: "Char", length: 400 })
    encryptedAccessKeyID: string;

    @Column({ dataType: "Char", length: 400 })
    encryptedKeySecret: string;

    namespace: Namespace;

}