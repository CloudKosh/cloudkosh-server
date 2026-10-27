/**
 * Any path like `@a/b`, `@a/b@version/c` etc
 * @param path string
 */
export default function parseNodePath(path: string | string[]) {
    let tokens = Array.isArray(path) ? path : path.split("/");
    let packageName: string;
    let version: string;
    let trailer = [];
    if (tokens[0].startsWith("@")) {
        const [scope, name, ... all] = tokens;
        packageName = name;
        if (packageName.includes("@")) {
            tokens = packageName.split("@");
            packageName = tokens[0];
            version = tokens[1];
        }
        packageName = `${scope}/${packageName}`;
        trailer = all;
    } else {
        const [name, ... all] = tokens;
        packageName = name;
        if (name.includes("@")) {
            tokens = packageName.split("@");
            packageName = tokens[0];
            version = tokens[1];
        }
        trailer = all;
    }

    return {
        packageName,
        get packageAndVersion() {
            return `${this.packageName}@${this.version}`;
        },
        version,
        path :trailer
    };
}