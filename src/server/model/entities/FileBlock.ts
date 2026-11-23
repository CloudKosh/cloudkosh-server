import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import BucketFile from "./BucketFile.js";
import NamespaceContent from "./NamespaceContent.js";

@Table("FileBlocks")
export default class FileBlock {

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(BucketFile, {
        property: (x) => x.file,
        inverseProperty: (x) => x.blocks,
        foreignKeyConstraint: {
            name: "FC_FileBlocks_FileID",
            onDelete: "cascade"
        }
    })
    fileID: number;

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(NamespaceContent, {
        property: (x) => x.content,
        inverseProperty: (x) => x.fileBlocks,
        foreignKeyConstraint: {
            name: "FC_FileBlocks_FileID",
            onDelete: "restrict"
        }
    })
    contentID: number;

    @Column({ dataType: "BigInt", key: true })
    order: number;

    file: BucketFile;

    content: NamespaceContent;
}