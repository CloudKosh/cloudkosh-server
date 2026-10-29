import Page from "@entity-access/server-pages/dist/Page.js";
import AppLayout from "../../../../../common/html/AppLayout.js";
import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import { Query } from "@entity-access/server-pages/dist/core/Query.js";
import Inject from "@entity-access/entity-access/dist/di/di.js";
import KoshDbContext from "../../../../../server/model/KoshDbContext.js";
import Sql from "@entity-access/entity-access/dist/sql/Sql.js";
import FormPost from "../../../../../common/html/FormPost.js";

export default class extends Page {

    @Query.asNumber("start")
    start = 0;

    @Query.asNumber("size")
    size = 50;

    @Query
    search = "";

    @Inject
    db: KoshDbContext;

    async run() {

        let q = this.db.namespaces
            .filtered("read");

        const { start, size, search } = this;

        if(search) {
            q = q.where({ search: search + "%"},
                (x, p) =>
                    Sql.text.iLike(x.name, p.search)
                    || Sql.text.iLike(x.description, p.search)
                );
        }

        const results = await q.limit(size).toPage(start, size);

        return this.html(<AppLayout title="Namespaces">

            <details>
                <summary>Add New</summary>
                <FormPost>
                    <fieldset>
                        <legend>Name</legend>
                        <input name="name"/>
                    </fieldset>
                    <fieldset>
                        <legend>Description</legend>
                        <input name="description"/>
                    </fieldset>
                    <button type="submit">Save</button>
                </FormPost>
            </details>

            <table>
                <tr>
                    <th>ID</th>
                    <th>Namespace</th>
                    <th>Created</th>
                    <th>Size</th>
                </tr>
                { ... results.items.map((x) => <tr>
                    <th>{x.id}</th>
                    <th>{x.name}</th>
                    <th>{x.dateCreated}</th>
                </tr>)}
            </table>

            <footer>
                {start && <a href={`?${this.start}&${this.size}`}>Start</a>}
                {results.more && <a href={`?${this.start+this.size}&${this.size}`}>Next</a>}
            </footer>

        </AppLayout>)
    }
}