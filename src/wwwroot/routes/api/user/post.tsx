import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../server/model/KoshDbContext.js";
import LoginSessionService from "../../../../server/services/auth/LoginSessionService.js";

interface ILoginParams {
    emailAddress: string;
    verificationID: any;
    code: any;
}

@Prepare.parseJsonBody
export default class extends Page {

    @Inject db: KoshDbContext;

    @Inject ls: LoginSessionService;

    async run() {

        const model = this.body as ILoginParams;

        if(model.verificationID) {
            if(model.code) {
                const sessions = await this.db.loginSessions.where(model, (x, p) => x.userName === p.emailAddress
                    && x.verificationToken === p.code)
                    .updateSelect((x) => ({ status: "created"}));

                const [session] = sessions;

                if(session) {
                    const { userID, sessionID } = session;
                    const { remoteIPAddress: ipAddress } = this.request;
                    await this.ls.create({ userID, sessionID, ipAddress });
                    return this.json({
                        userID
                    });
                }

            }
        }

    }
}