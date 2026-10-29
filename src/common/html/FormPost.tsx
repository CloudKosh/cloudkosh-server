import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import URLHelper from "./URLHelper.js";

export default function FormPost({
        action = void 0,
        query = void 0,
        enctype = "application/x-www-form-urlencoded",
        method = "POST",
        ... a
    }, ... nodes: XNode[]) {
    return <form
                action={query ? URLHelper.relative(action ?? "", query) : action}
                enctype={enctype}
                method={method}
                {... a}>
        { ... nodes}
    </form>
}