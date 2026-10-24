import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";
import Page from "@entity-access/server-pages/dist/Page.js";

@Prepare.authorize
export default class extends Page {

    async run() {

        if(this.sessionUser.userID) {
            return this.json({
                userID: this.sessionUser.userID
            });
        }

        return this.json({});
        
    }
}