import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import type FileBlock from "./FileBlock.js";
import type BucketFile from "./BucketFile.js";

@Table("NamespaceContents")
export default class NamespaceContent {

    @Column({dataType: "BigInt", key: true, generated: "identity"})
    contentID: number;

    @Column({ dataType: "Char", length: 200})
    sha256Base24: string;

    @Column({ dataType: "BigInt" })
    size: number;

    @Column({ dataType: "Boolean", default: () => false})
    stale: boolean;

    fileBlocks: FileBlock[];

    files: BucketFile[];
}