import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";
import User from "./User.js";

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

    @Column({ dataType: "Char", length: 400 })
    encryptedSecret: string;

    
    /**
     * Displayed first time when generated.
     */
    @JsonProperty()
    public displaySecret;

    user: User;
}