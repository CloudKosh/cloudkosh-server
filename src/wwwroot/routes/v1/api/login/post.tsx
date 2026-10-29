import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../../server/model/KoshDbContext.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import LoginSessionService from "../../../../../server/services/auth/LoginSessionService.js";

@Prepare.authorize
@Prepare.parseJsonBody
export default class extends Page {

    @Inject db: KoshDbContext;

    @Inject ls: LoginSessionService;

    async run () {
        
        const { accessTokenSha256Base64Url } = this.body;

        const at = await this.db.accessTokens
            .where({ accessTokenSha256Base64Url },
                (x,p) =>
                    x.secretHash === p.accessTokenSha256Base64Url
                    && x.active === true
            )
            .updateSelect((x) => ({
                lastUsed: Sql.date.now()
            }));

        if(!at?.length) {
            throw new EntityAccessError(`No user found or access token expired`);
        }

        const { userID } = at[0] ;

        const result = await this.ls.create({ userID, ipAddress: this.request.remoteIPAddress });
        return this.json(result);
    }
}