import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import AccessToken from "../entities/AccessToken.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import { newID } from "../../../common/newID.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import EncryptionService from "../../services/encryption/EncryptionService.js";
import KoshDbContext from "../KoshDbContext.js";

export default class AccessTokenEvents extends AuthenticatedEvents<AccessToken> {

    @Inject
    es: EncryptionService;

    @Inject
    db: KoshDbContext;

    async afterInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        entity.displaySecret = `ck-${entity.tokenID}-${newID()}`;
        await this.db.accessTokens
            .withKeys({ tokenID: entity.tokenID})
            .update({
                encryptedSecret: this.es.general.encrypt(entity.displaySecret)
            });
    }

    beforeInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        entity.encryptedSecret = "";
    }

}