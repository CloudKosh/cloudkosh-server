import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";

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
    bucketID: number;

    @Column({ dataType: "Char", length: 1024})
    path: string;

    @Column({
        dataType: "Int",
        computed: (x) =>
            Sql.text.length(
                Sql.text.replace(x.path, ' ', '*')
            ) - Sql.text.length(
                Sql.text.replace(x.path, '/', '')
            ),
        stored: true
    })
    depth: number;

}