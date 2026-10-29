import ChangeEntry from "@entity-access/entity-access/dist/model/changes/ChangeEntry.js";
import AccessToken from "../entities/AccessToken.js";
import AuthenticatedEvents from "./AuthenticatedEvents.js";
import { newID } from "../../../common/newID.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../KoshDbContext.js";
import HashService from "../../services/hash/HashService.js";

export default class AccessTokenEvents extends AuthenticatedEvents<AccessToken> {

    @Inject
    hs: HashService;

    @Inject
    db: KoshDbContext;

    async afterInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        entity.displaySecret = `ck-${entity.tokenID}-${newID()}`;
        const secretHash = await this.hs.hash(entity.displaySecret);
        await this.db.accessTokens
            .withKeys({ tokenID: entity.tokenID})
            .update({
                secretHash
            });
    }

    beforeInsert(entity: AccessToken, entry: ChangeEntry<AccessToken>) {
        entity.secretHash = Buffer.alloc(0);
    }

    preJson(entity: AccessToken): AccessToken {
        entity.secretHash = void 0;
        return entity;
    }

}