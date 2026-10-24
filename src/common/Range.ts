import sleep from "./sleep.js";

export default class Range {

    static * range(start = 0, end = 10) {
        for(let i=start;i<end;i++) {
            yield i;
        }
    }

    static async * timeRange(time = 30000, step = 3000) {
        const now = Date.now();
        const end = now + time;
        for(;;) {
            await sleep(step);
            const i = Date.now();
            yield i;
            if(i > end) {
                break;
            }
        }
    }

}