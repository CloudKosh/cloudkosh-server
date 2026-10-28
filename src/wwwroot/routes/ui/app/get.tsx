import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import AppLayout from "../../../../common/html/AppLayout.js";

@Prepare.authorizeRedirect((x) => x.userID > 0, "/ui/app/login")
export default class extends Page {
    async run() {
        return this.html(<AppLayout title="Dashboard">
            <body>
                <section>
                    
                </section>
            </body>
        </AppLayout>);
    }
}