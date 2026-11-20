import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../server/model/KoshDbContext.js";

interface ILoginParams {
    emailAddress: string;
    verificationID: any;
    code: any;
}

@Prepare.parseJsonBody
export default class extends Page {

    @Inject db: KoshDbContext;

    async run() {

        const model = this.body as ILoginParams;

        if(model.verificationID) {
            if(model.code) {
                const v = await this.db.loginSessions.where(model, (x, p) => x.userName === p.emailAddress
                    && x.verificationToken === p.code)
                    .updateSelect((x) => ({ status: "created"}));

            }
        }

    }
}