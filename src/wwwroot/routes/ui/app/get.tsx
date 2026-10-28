import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import HtmlDocument from "@entity-access/server-pages/dist/html/HtmlDocument.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";

@Prepare.authorizeRedirect((x) => x.userID > 0, "/ui/app/login")
export default class extends Page {
    async run() {
        return <HtmlDocument>
            <body>
                <section>
                    
                </section>
            </body>
        </HtmlDocument>;
    }
}