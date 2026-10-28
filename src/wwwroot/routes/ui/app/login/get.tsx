import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import AppLayout from "../../../../../common/html/AppLayout.js";

export default class extends Page {
    async run() {

        return this.html(<AppLayout title="Login">
            <form enctype="application/x-www-form-urlencoded" method="post">
                <fieldset>
                    <legend>Email Address</legend>
                    <input name="email" placeholder="Email Address"/>
                    </fieldset>
                <div>
                    <button type="submit">Request Code</button>
                </div>
            </form>
        </AppLayout>);
    }
}