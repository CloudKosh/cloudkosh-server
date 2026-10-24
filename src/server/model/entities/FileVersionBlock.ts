import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import NamespaceContent from "./NamespaceContent.js";
import BucketFileVersion from "./BucketFileVersion.js";

@Table("FileVersionBlocks")
export default class FileVersionBlock {

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(BucketFileVersion, {
        property: (x) => x.fileVersion,
        inverseProperty: (x) => x.versionBlocks
    })
    versionID: number;

    @Column({ dataType: "BigInt", key: true })
    @RelateTo(NamespaceContent, {
        property: (x) => x.content,
        inverseProperty: (x) => x.fileVersionBlocks
    })
    contentID: number;

    @Column({ dataType: "BigInt", key: true })
    orderID: number;

    fileVersion: BucketFileVersion;

    content: NamespaceContent;

}