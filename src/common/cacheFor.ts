/* eslint-disable no-console */
import TimedCache from "@entity-access/entity-access/dist/common/cache/TimedCache.js";


export class ObjectCache<T> implements Disposable {

    private cache: Map<any, TimedCache> = new Map();

    constructor(private readonly ttl?) {

    }

    for(name: keyof T) {
        let tc = this.cache.get(name);
        if (!tc) {
            tc = new TimedCache(this.ttl);
            this.cache.set(name, tc);
        }
        return tc;
    }

    clear(name?: keyof T) {
        if (!name) {
            for (const element of this.cache.values()) {
                element.clear();
            }
            this.cache.clear();
            return;
        }
        this.cache.get(name)?.clear();
    }

    [Symbol.dispose]() {
        for (const element of this.cache.values()) {
            element[Symbol.dispose]();
        }
    }
};

export interface ICacheContainer<T> {
    cache: ObjectCache<T> | undefined;
}

export function cacheFor<T>() {
    return function(target:ICacheContainer<T>, key) {
        const oldMethod = target[key] as (... a: any[]) => any;
        function value(... a: any[]) {
            const cache = (this.cache ??= new ObjectCache()).for(key) as TimedCache;
            const cacheKey = a.join();
            return cache.getOrCreate(cacheKey, a, (k) => {
                const nv = oldMethod.apply(this, a);
                nv?.catch((error) => {
                    console.error(`${key}(${cacheKey}) failed with`);
                    console.error(error);
                    cache.delete(cacheKey);
                });
                return nv;
            });
        }
        const d = {
            value,
            enumerable: true,
            configurable: true
        };
        Object.defineProperty(target, key, d);
        return d;
    };
}
