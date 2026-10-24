import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";

@Table("DbLocks")
export default class DbLock {

    @Column({ dataType: "Char", length: 400, key: true })
    public lockID: string;

    @Column({ dataType: "Char", length: 80, nullable: true })
    public lockSecret: string;

    @Column({ dataType: "DateTime", nullable: true })
    public lockTTL: DateTime;

}