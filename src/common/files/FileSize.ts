export default class FileSize {

    static parse(text: string) {
        const size = parseFloat(text);
        if (/gb$/i.test(text)) {
            return size * 1024*1024*1024;
        }
        if (/mb$/i.test(text)) {
            return size * 1024*1024;
        }
        if (/kb$/i.test(text)) {
            return size * 1024;
        }
        return size;
    }
}