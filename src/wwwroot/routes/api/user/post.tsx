import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../server/model/KoshDbContext.js";
import LoginSessionService from "../../../../server/services/auth/LoginSessionService.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";

interface ILoginParams {
    userID: number;
    emailAddress: string;
    sessionID: any;
    code: any;
    resend: boolean;
}

@Prepare.parseJsonBody
export default class extends Page {

    @Inject db: KoshDbContext;

    @Inject ls: LoginSessionService;

    async run() {

        const model = this.body as ILoginParams;

        if(!model.emailAddress) {
            throw new EntityAccessError("Email address is required");
        }

        if(model.sessionID) {
            if(model.code) {
                const sessions = await this.db.loginSessions.where(model, (x, p) => x.user.emailAddress === p.emailAddress
                    && x.status === "verification-pending"
                    && x.verificationToken === p.code)
                    .updateSelect((x) => ({
                        status: "created",
                    }));

                const [session] = sessions;

                if(session) {
                    const { userID, sessionID } = session;
                    const { remoteIPAddress: ipAddress } = this.request;
                    await this.ls.create({ userID, sessionID, ipAddress });
                    model.userID = userID;
                    return this.json(model);
                }

                throw new EntityAccessError("Invalid code");
            }

        } else {
            model.sessionID = await this.ls.createVerification(model.emailAddress, this.request.remoteIPAddress);
        }

        await this.ls.emailCode(model.sessionID);

        return this.json(model);
    }
}