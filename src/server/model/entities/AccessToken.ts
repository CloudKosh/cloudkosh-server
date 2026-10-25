import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import { JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";

@Table("AccessTokens")
export default class AccessToken {

    @Column({ dataType: "BigInt", key: true, generated: "identity" })
    tokenID: number;

    @Column({ dataType: "Char", length: 400 })
    encryptedSecret: string;

    
    /**
     * Displayed first time when generated.
     */
    @JsonProperty()
    public displaySecret;
}