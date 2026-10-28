import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import type NamespaceUser from "./NamespaceUser.js";
import type AccessToken from "./AccessToken.js";
import type LoginSession from "./LoginSession.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";

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

    @Column({ dataType: "Char", length: 20, enum: userStatuses, default: () => "active" })
    public status: userStatusType;

    @Column({ dataType: "Char", length: 200, nullable: true })
    public displayName: string;

    // is unique...
    @Column({ dataType: "Char", length: 200 })
    public emailAddress: string;    

    @Column( {dataType: "DateTime", default: () => Sql.date.now()})
    public dateCreated: DateTime;

    @Column({ dataType: "Char", length: 400, default: () => "user"})
    public roles: string;

    namespaceUsers: NamespaceUser[];
    accessTokens: AccessToken[];
    sessions: LoginSession[];
}