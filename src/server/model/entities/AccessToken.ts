import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";
import User from "./User.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";

@Table("AccessTokens")
export default class AccessToken {

    @Column({ dataType: "BigInt", key: true, generated: "identity" })
    tokenID: number;

    @Column({ dataType: "BigInt" })
    @RelateTo(User, {
        property: (x) => x.user,
        inverseProperty: (x) => x.accessTokens
    })
    userID: number;

    @Column({ dataType: "ByteArray" })
    secretHash: Buffer;

    @Column({ dataType: "Char", length: 400, nullable: true})
    title: string;

    @Column({ dataType: "Char", nullable: true})
    description: string;

    @Column({ dataType: "DateTime", default: () => Sql.date.now()})
    dateCreated: DateTime;

    @Column({ dataType: "DateTime", nullable: true})
    lastUsed: DateTime;

    @Column({ dataType: "Boolean", default: () => true})
    active: boolean;
    
    /**
     * Displayed first time when generated.
     */
    @JsonProperty()
    public displaySecret;

    user: User;
}