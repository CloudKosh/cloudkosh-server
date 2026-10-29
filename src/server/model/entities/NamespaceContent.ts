import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import type FileBlock from "./FileBlock.js";
import type BucketFile from "./BucketFile.js";
import type FileVersionBlock from "./FileVersionBlock.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Namespace from "./Namespace.js";
import type StorageContent from "./StorageContent.js";

@Table("NamespaceContents")
export default class NamespaceContent {

    @Column({dataType: "BigInt", key: true, generated: "identity"})
    contentID: number;

    @Column({ dataType: "BigInt"})
    @RelateTo(Namespace, {
        property: (x) => x.namespace,
        inverseProperty: (x) => x.contents
    })
    namespaceID: number;

    @Column({ dataType: "ByteArray"})
    sha256: Buffer;

    @Column({ dataType: "BigInt" })
    size: number;

    @Column({ dataType: "Boolean", default: () => false})
    stale: boolean;

    /** 
     * This is important, if we have to change the path,
     * by including version or any other information.
     */
    @Column({ dataType:"Char", length: 1024 })
    keyPath: string;

    fileBlocks: FileBlock[];

    files: BucketFile[];
    fileVersionBlocks: FileVersionBlock[];

    namespace: Namespace;
    storageContents: StorageContent[];
    
}