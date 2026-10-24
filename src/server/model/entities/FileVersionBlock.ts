import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import BucketFile from "./BucketFile.js";
import NamespaceContent from "./NamespaceContent.js";

@Table("FileVersionBlocks")
export default class FileVersionBlock {

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(BucketFile, {
        property: (x) => x.file,
        inverseProperty: (x) => x.blocks
    })
    fileID: number;

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(NamespaceContent, {
        property: (x) => x.content,
        inverseProperty: (x) => x.fileVersionBlocks
    })
    contentID: number;

    @Column({ dataType: "BigInt", key: true })
    orderID: number;

    file: BucketFile;

    content: NamespaceContent;

}