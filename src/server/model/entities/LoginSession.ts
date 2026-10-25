import Column from "@entity-access/entity-access/dist/decorators/Column.js";
import Index from "@entity-access/entity-access/dist/decorators/Index.js";
import { RelateTo } from "@entity-access/entity-access/dist/decorators/Relate.js";
import Table from "@entity-access/entity-access/dist/decorators/Table.js";
import User from "./User.js";
import { IgnoreJsonProperty, JsonProperty } from "@entity-access/server-pages/dist/services/ModelService.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";

const loginSessionStatuses = ["created", "change-password", "totp"] as const;
export type loginStatusType = typeof loginSessionStatuses[number];

const devicePushTypes = ["WebPush", "fcm", "apn"] as const;
export type devicePushType = typeof devicePushTypes[number];

@Table("LoginSessions")
@Index({
    name: "IX_LoginSessions_ActiveSessions",
    columns: [ { name: (x) => x.expiry, descending: false }],
    filter: (x) => x.invalid === false
})
export default class LoginSession {

    @Column({ key: true, generated: "identity"})
    public sessionID: number;

    @Column({ dataType: "BigInt"})
    @RelateTo(User, {
        property: (ls) => ls.user,
        inverseProperty: (user) => user.sessions,
        foreignKeyConstraint: {
            name: "FC_LoginSession_UserID",
            onDelete: "cascade"
        }
    })
    public userID: number;

    @Column({})
    @IgnoreJsonProperty
    public start: DateTime;

    @Column({})
    @IgnoreJsonProperty
    public expiry: DateTime;

    @Column({})
    public invalid: boolean;

    @Column({ })
    public dateUpdated: DateTime;

    @Column({ dataType: "AsciiChar", length: 20, nullable: true})
    public status: loginStatusType;

    @Column({ dataType: "Char", length: 50, nullable: true })
    public ipAddress: string;

    @Column({ dataType: "AsciiChar", nullable: true})
    public deviceToken: string;

    @Column({ dataType: "AsciiChar", length: 50, nullable: true, enum: devicePushTypes})
    public deviceTokenType: devicePushType;

    @Column({ dataType: "Int", nullable: true })
    public verificationToken: number;

    /**
     * This will not be saved into database
     */
    @JsonProperty()
    public userName: string;

    /**
     * This will not be saved to database, but it might be
     * sent to us via network, we will investigate if user
     * exists or not
     */
    @JsonProperty()
    public checkPassword: string;

    @JsonProperty()
    public passwordIsAccessToken: boolean;

    /**
     * You need to supply new password if user's status
     * is set to change-password
     */
    @JsonProperty()
    public newPassword: string ;


    @JsonProperty({ help: "Multi Factor Auth Token"})
    public timeToken: string;

    @JsonProperty({ help: "One Time Password"})
    public oneTimePassword: string;

    public user: User;

    // [GraphService.appendToGraph]() {
    //     delete this.deviceToken;
    //     delete this.deviceTokenType;
    //     return {
    //         deviceToken: "",
    //         deviceTokenType: ""
    //     };
    // }

}
