import Inject from "@entity-access/entity-access/dist/di/di.js";
import Content from "@entity-access/server-pages/dist/Content.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import EncryptionService from "../../../../../../server/services/encryption/EncryptionService.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import { globalEnv } from "../../../../../../globalEnv.js";

export default class extends Page {

    @Inject es: EncryptionService;

    async run() {
        return Content.text(this.es.general.encrypt(globalEnv.publicKey + ":" + DateTime.now));
    }
}