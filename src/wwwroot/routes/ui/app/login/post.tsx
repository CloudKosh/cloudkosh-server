import Inject from "@entity-access/entity-access/dist/di/di.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import KoshDbContext from "../../../../../server/model/KoshDbContext.js";
import { globalEnv } from "../../../../../globalEnv.js";
import AppLayout from "../../../../../common/html/AppLayout.js";
import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import EncryptionService from "../../../../../server/services/encryption/EncryptionService.js";
import DateTime from "@entity-access/entity-access/dist/types/DateTime.js";
import HtmlDocument from "@entity-access/server-pages/dist/html/HtmlDocument.js";

@Prepare.parseForm
export default class extends Page {

    @Inject
    db: KoshDbContext;

    @Inject
    es: EncryptionService;

    async run() {
        const email = this.form.fields["email"];

        let encryptedCode = this.form.fields["encryptedCode"];

        let code = this.form.fields["code"];

        if( encryptedCode && this.es.general.decrypt(encryptedCode) === code) {
            // setup login...

            const user = await this.db.users
                .where({ email }, (x,p) => x.emailAddress === p.email)
                .first();

            if(!user) {
                return this.html(<AppLayout title="Verification Failed">
                    <div>
                        Email address provided is not registered.
                    </div>
                </AppLayout>)
            }

            const { userID } = user;

            const expiry = DateTime.now.addDays(1).asJSDate;
            const dateUpdated = DateTime.now;

            const { sessionID } = await this.db.loginSessions.statements.insert({
                expiry: DateTime.from(expiry),
                userID,
                status: "created",
                dateUpdated,
                ipAddress: this.request.remoteIPAddress,
            })

            this.sessionUser.setAuthCookie({
                expiry: DateTime.now.addDays(1).asJSDate,
                sessionID,
                userID
            });

            return this.html(<HtmlDocument>
                <head></head>
                <body>
                    <script>
                        location.href = "/app";
                    </script>
                </body>
            </HtmlDocument>);
        }

        code = Date.now().toString();
        code = code.substring(code.length-5);

        encryptedCode = this.es.general.encrypt(code);

        if(!globalEnv.smtp.host) {
            console.log(JSON.stringify({
                email,
                code
            }))
        } else {
            // send email...
        }

        return this.html(<AppLayout title="Verify Login">
            <form enctype="application/x-www-form-urlencoded" method="post">
                <input type="hidden" name="encryptedCode" value={encryptedCode} />
                <fieldset>
                    <legend>Verification Code</legend>
                    <input name="code" placeholder="Code"/>
                </fieldset>
                <div>
                    <button type="submit">Verify</button>
                </div>
            </form>
        </AppLayout>);
    }

}