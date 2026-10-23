import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";

@Table("Buckets")
export default class Bucket {

    @Column({ dataType: "Char", length: 200, key: true, default: () => "root"})
    namespace: string;

    @Column({ dataType: "Char", length: 200, key: true })
    name: string;

}