import Page from "@entity-access/server-pages/dist/Page.js";

export default class extends Page {

    async run() {
        return this.notFound();
    }
}