import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import type FileBlock from "./FileBlock.js";
import type BucketFileVersion from "./BucketFileVersion.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Bucket from "./Bucket.js";

@Table("BucketFiles")
@Index({
    name: "IX_BucketFile_Path",
    columns: [
        { name: (x) => x.bucketID, descending: false },
        { name: (x) => x.path, descending: false }
    ],
    unique: true
})
export default class BucketFile {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    bucketFileID: number;

    @Column( {dataType: "BigInt"})
    @RelateTo(Bucket, {
        property: (x) => x.bucket,
        inverseProperty: (x) => x.bucketFiles
    })
    bucketID: number;

    @Column({ dataType: "Char", length: 1024})
    path: string;

    @Column({ dataType: "Char", length: 400, default: () => "application/octet-stream" })
    contentType: string;

    @Column({ dataType: "BigInt", default: () => 0})
    size: number;

    
    @Column({ dataType: "DateTime", default: () => Sql.date.now()})
    dateCreated: DateTime;

    @Column({ dataType: "DateTime", default: () => Sql.date.now()})
    dateUpdated: DateTime;

    /**
     * depth should be 1 at root, so zero can be used to search for all depths.
     */
    @Column({
        dataType: "Int",
        computed: (x) =>
            1 + Sql.text.length(
                Sql.text.replace(x.path, ' ', '*')
            ) - Sql.text.length(
                Sql.text.replace(x.path, '/', '')
            ),
        stored: true
    })
    depth: number;

    bucket: Bucket;
    blocks: FileBlock[];
    versions: BucketFileVersion[];

}