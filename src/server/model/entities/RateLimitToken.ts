import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";

@Table("RateLimitTokens")
@Index({
    name: "IX_RateLimits_Groups",
    columns: [
        { name: (x) => x.groupName , descending: false },
        { name: (x) => x.lockTokenTTL, descending: true}
    ]
})
export default class RateLimitToken {

    @Column({ dataType: "BigInt", key: true, generated: "identity"})
    public tokenID: number;

    @Column({ dataType: "Char", length: 50 })
    public groupName: string;

    @Column({ nullable: true })
    public lockTokenTTL: DateTime;

}