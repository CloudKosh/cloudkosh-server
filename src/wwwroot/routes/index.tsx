import HtmlDocument from "@entity-access/server-pages/dist/html/HtmlDocument.js";
import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import WebAtomsLogo from "@entity-access/server-pages/dist/html/WebAtomsLogo.js";
import Content from "@entity-access/server-pages/dist/Content.js";
import UIResource from "../../UIResource.js";

export default class extends Page {

    async run() {
        return Content.html(<HtmlDocument>
            <head>
                <title>Cloud Kosh - Dashboard</title>
            </head>
            <body>
                <WebAtomsLogo/>

                <div id="webAtomsLoader" style="height: 100%;width: 100%; display: flex; align-items: center; justify-content: center;">
                    <div style="padding: 10px; border-radius: 10px; background-color: dodgerblue; color: white;">
                        Loading...
                    </div>
                </div>

                <script 
                    src={UIResource.cdnURL()}>
                </script>
            </body>
        </HtmlDocument>);
    }
}