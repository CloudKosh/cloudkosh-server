import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";

@Table("Volumes")
export default class Volume {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    volumeID: number;

    @Column({ dataType: "Char", length: 200})
    name: string;

    @Column({ dataType: "Char", nullable: true})
    description: string;

    /** primary storage type, default is a disk */
    @Column( {dataType: "Char", length: 20})
    primary: string;

}