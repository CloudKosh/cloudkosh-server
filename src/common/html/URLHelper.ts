export default class URLHelper {
    public static relative(path: string, query) {
        const sp = new URLSearchParams();
        for(const [key, value] of Object.entries(query)) {
            sp.append(encodeURIComponent(key), encodeURIComponent(value as any));
        }
        if(path.includes("?")) {
            return `${path}&${sp.toString()}`
        }
        return `${path}?${sp.toString()}`
    }
}