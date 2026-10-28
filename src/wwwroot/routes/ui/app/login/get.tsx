import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import Page from "@entity-access/server-pages/dist/Page.js";
import AppLayout from "../../../../../common/html/AppLayout.js";

export default class extends Page {
    async run() {
        return <AppLayout title="Login">
            <form method="post">
                <fieldset>
                    <legend>Email Address</legend>
                    <div>
                        <input id="email" placeholder="Email Address"/>
                    </div>
                    <div>
                        
                    </div>
                </fieldset>
            </form>
        </AppLayout>;
    }
}