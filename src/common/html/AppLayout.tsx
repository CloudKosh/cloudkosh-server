import HtmlDocument from "@entity-access/server-pages/dist/html/HtmlDocument.js";
import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import StaticResource from "../../StaticResource.js";

export default function AppLayout({ title }, ... nodes: XNode[]) {

    return <HtmlDocument>
        <head>
            <title>{title}</title>
            <link rel="stylesheet" href={StaticResource.toCDN(import.meta.resolve("./AppLayout.global.css"))}></link>
            <script type="module" src={StaticResource.toCDN(import.meta.resolve("@social-mail/web-components/dist/main.js"))}></script>
        </head>
        <body>
            <header>
                <h4>Cloud Kosh</h4>
                <menu-bar>
                    <a href="/ui/app">Home</a>
                </menu-bar>
            </header>
            <main>
                { ... nodes }
            </main>
            <footer>
                <section></section>
            </footer>
        </body>
    </HtmlDocument>;
}