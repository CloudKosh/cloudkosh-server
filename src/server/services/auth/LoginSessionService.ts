import Inject, { RegisterScoped } from "@entity-access/entity-access/dist/di/di.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import KoshDbContext from "../../model/KoshDbContext.js";
import { SessionUser } from "@entity-access/server-pages/dist/core/SessionUser.js";
import LoginSession from "../../model/entities/LoginSession.js";
import EntityAccessError from "@entity-access/entity-access/dist/common/EntityAccessError.js";

@RegisterScoped
export default class LoginSessionService {

    @Inject db: KoshDbContext;

    @Inject sessionUser: SessionUser;

    async create({ userID, ipAddress, sessionID = void 0 }) {

        const expiry = DateTime.now.addDays(1).asJSDate;
        const dateUpdated = DateTime.now;

        if(!sessionID) {
            const s = await this.db.loginSessions.statements.insert({
                expiry: DateTime.from(expiry),
                userID,
                status: "created",
                start: dateUpdated,
                invalid: false,
                dateUpdated,
                ipAddress,
            });
            sessionID = s.sessionID;
        }

        const cookie = await this.sessionUser.setAuthCookie({
            expiry: DateTime.now.addDays(30).asJSDate,
            sessionID,
            userID
        });

        return { authorization: Buffer.from(`${userID}:${cookie}`).toString("base64")}

    }

    async emailCode(sessionID) {
        const v = await this.db.loginSessions.withKeys({ sessionID }).select();
        await this.sendEmail(v);
    }

    async createVerification(emailAddress: string, ipAddress: string) {

        const user = await this.db.users.withKeys({ emailAddress }).select();
        if(!user) {
            throw new EntityAccessError("Email is not registered");
        }

        const { userID } = user;

        const expiry = DateTime.now.addDays(1).asJSDate;
        const dateUpdated = DateTime.now;

        const s = await this.db.loginSessions.statements.insert({
            expiry: DateTime.from(expiry),
            userID,
            status: "created",
            start: dateUpdated,
            invalid: false,
            dateUpdated,
            ipAddress,
        });
        return s.sessionID;
    }

    sendEmail(v: LoginSession) {
        throw new Error("Method not implemented.");
    }
}