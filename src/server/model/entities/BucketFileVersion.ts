import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import BucketFile from "./BucketFile.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";

@Table("BucketFileVersions")
export default class BucketFileVersion {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    versionID: number;

    @Column({ dataType: "BigInt"})
    @RelateTo(BucketFile, {
        property: (x) => x.file,
        inverseProperty: (x) => x.versions
    })
    fileID: number;

    @Column({ dataType: "DateTime", default: () => Sql.date.now()})
    dateCreated: DateTime;

    file: BucketFile;
}