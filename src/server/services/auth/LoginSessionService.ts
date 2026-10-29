import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";

@RegisterScoped
export default class LoginSessionService {

    @Inject db: KoshDbContext;

    @Inject sessionUser: SessionUser;

    async create({ userID, ipAddress }) {

        const expiry = DateTime.now.addDays(1).asJSDate;
        const dateUpdated = DateTime.now;

        const { sessionID } = await this.db.loginSessions.statements.insert({
            expiry: DateTime.from(expiry),
            userID,
            status: "created",
            start: dateUpdated,
            invalid: false,
            dateUpdated,
            ipAddress,
        })

        const cookie = await this.sessionUser.setAuthCookie({
            expiry: DateTime.now.addDays(1).asJSDate,
            sessionID,
            userID
        });

        return { authorization: Buffer.from(`${userID}:${cookie}`).toString("base64")}

    }

}