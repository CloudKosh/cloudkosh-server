import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import AccessToken from "../entities/AccessToken.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import { newID } from "../../../common/newID.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../KoshDbContext.js";
import EncryptionService from "../../services/encryption/EncryptionService.js";

export default class AccessTokenEvents extends AuthenticatedEvents<AccessToken> {

    @Inject
    es: EncryptionService;

    @Inject
    db: KoshDbContext;

    async afterInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        entity.displaySecret = `ck-${entity.tokenID}-${newID()}`;
        const encryptedSecret = await this.es.general.encrypt(entity.displaySecret);
        await this.db.accessTokens
            .withKeys({ tokenID: entity.tokenID})
            .update({
                encryptedSecret
            });
    }

    beforeInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        if(!this.sessionUser.isAdmin) {
            entity.userID = entity.userID;
        } else {
            if(!entity.userID) {
                entity.userID = this.sessionUser.userID;
            }
        }
        entity.encryptedSecret = "";
    }

}