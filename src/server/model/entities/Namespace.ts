import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";

@Table("Namespaces")
export default class Namespace {

    @Column({ dataType: "Char", length: 200, key: true })
    name: string;

    @Column({ dataType: "Char", nullable: true})
    description: string;

}