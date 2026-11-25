import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../../server/model/KoshDbContext.js";

@Prepare.authorize
export default class extends Page {

    @Inject db: KoshDbContext;

    async run() {

        if(this.sessionUser.userID) {
            const user = await this.db.users
                .where(this.sessionUser, (x, p) => x.userID === p.userID)
                .first(); 
            return this.json({
                userID: this.sessionUser.userID,
                roles: this.sessionUser.roles,
                displayName: user.displayName,
                emailAddress: user.emailAddress
            });
        }

        return this.json({});
        
    }
}