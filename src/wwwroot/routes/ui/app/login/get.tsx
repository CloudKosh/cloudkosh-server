import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import AppLayout from "../../../../../common/html/AppLayout.js";
import FormPost from "../../../../../common/html/FormPost.js";

export default class extends Page {
    async run() {

        return this.html(<AppLayout title="Login">
            <FormPost>
                <fieldset>
                    <legend>Email Address</legend>
                    <input name="email" placeholder="Email Address"/>
                    </fieldset>
                <div>
                    <button type="submit">Request Code</button>
                </div>
            </FormPost>
        </AppLayout>);
    }
}