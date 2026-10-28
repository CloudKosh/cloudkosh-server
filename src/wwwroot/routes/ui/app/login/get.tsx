import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import AppLayout from "../../../../../common/html/AppLayout.js";

export default class extends Page {
    async run() {

        const doc = <AppLayout title="Login">
            <form method="post">
                <fieldset>
                    <legend>Email Address</legend>
                    <div>
                        <input name="email" placeholder="Email Address"/>
                    </div>
                    <div>
                        <button type="submit">Request Code</button>
                    </div>
                </fieldset>
            </form>
        </AppLayout>;

        console.log(JSON.stringify({
            doc: typeof doc,
            name: doc.name
        }))

        return this.html(doc);
    }
}