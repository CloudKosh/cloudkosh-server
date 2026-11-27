import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";
import KoshDbContext from "../../../../../../server/model/KoshDbContext.js";
import LoginSessionService from "../../../../../../server/services/auth/LoginSessionService.js";
import RateLimiterService from "../../../../../../server/services/rate-limiter/RateLimiterService.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import EncryptionService from "../../../../../../server/services/encryption/EncryptionService.js";
import { globalEnv } from "../../../../../../globalEnv.js";
import HashService from "../../../../../../server/services/hash/HashService.js";

@Prepare.authorize
@Prepare.parseJsonBody
export default class extends Page {

    @Inject db: KoshDbContext;

    @Inject ls: LoginSessionService;

    @Inject rls: RateLimiterService;

    @Inject es: EncryptionService;

    @Inject hash: HashService;

    async run () {
        
        await this.rls.acquire(this.request.remoteIPAddress, "api-login");

        const { key, nonce, sha256Base64 } = this.body;

        const decoded = this.es.general.decrypt(nonce);
        if(!decoded.startsWith(globalEnv.publicKey)) {
            throw new EntityAccessError(`Invalid nonce`);
        }

        const at = await this.db.accessTokens.withKeys({ tokenID: key }).select();
        if(!at) {
            throw new EntityAccessError(`Access Token ${key} not found`);
        }

        const decryptedSecret = this.es.general.decrypt(at.encryptedSecret);

        const h = this.hash.hash(decryptedSecret, nonce); 
        if(sha256Base64 !== h) {
            throw new EntityAccessError(`Invalid secret`);
        }

        await this.db.accessTokens.withKeys({ tokenID: key}).update({ lastUsed: DateTime.now });

        const { userID } = at[0] ;

        const result = await this.ls.create({ userID, ipAddress: this.request.remoteIPAddress });
        return this.json(result);
    }
}