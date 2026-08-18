import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";

export const userStatuses = ["active", "blocked", "locked"] as const;
export type userStatusType = typeof userStatuses[number];

@Table("Users")
@Index({
    name: "IX_Users_UniqueEmail",
    unique: true,
    columns: [
        { name: (x) => x.emailAddress, descending: false }
    ]
})
export default class User {

    @Column({ dataType: "BigInt", key: true, generated: "identity" })
    public userID: number;

    @Column({ dataType: "Char", length: 20, enum: userStatuses })
    public status: userStatusType;

    @Column({ dataType: "Char", length: 200 })
    public displayName: string;

    // is unique...
    @Column({ dataType: "Char", length: 200 })
    public emailAddress: string;    

    @Column( {dataType: "DateTime"})
    public dateCreated: DateTime;
}