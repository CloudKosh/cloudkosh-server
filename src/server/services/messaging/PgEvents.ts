/* eslint-disable no-console */
import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import pg from "pg";
import sleep from "../../../common/sleep.js";
import { nextTick } from "node:process";
import { globalEnv } from "../../../globalEnv.js";
import LockFile from "@entity-access/server-pages/dist/cache/LockFile.js";

export type messageTypes = string;

@RegisterSingleton
export default class PgEvents {


    private _client: Promise<pg.Client>;
    private _running: Promise<any>;

    private handlers: Map<string,{ original: messageTypes, listening: boolean, handler: (message: messageTypes, payload) => any}[]> = new Map();
    private added: string[] = [];
    private removed: string[] = [];

    private ac: AbortController;
    private currentSignal: AbortSignal;

    private get client() {
        return this._client ??= (async () => {
            try {
                const c = new pg.Client({
                    ... globalEnv.db,
                    keepAlive: true,
                    keepAliveInitialDelayMillis: 30*1000
                });
                c.on("error", () => {
                    try {
                        c.end().catch(console.error);
                    } catch (error) {
                        console.error(error);
                    }
                    this._client = null;
                });
                c.on("end", () => this._client = null);
                c.on("notification", async ({ channel, payload}) => {
                    try {
                        console.log(`Notification received ${channel}`);
                        payload = JSON.parse(payload);
                        const fx = this.handlers.get(channel);
                        if (fx) {
                            for (const { original, handler } of fx) {
                                try {
                                    const p = handler(original as any, payload);
                                    if (p?.then) {
                                        p.catch(console.error);
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });
                await c.connect();
                return c;
            } catch (error) {
                console.error(error);
            }
        })();
    }

    async emit(message: messageTypes, payload) {
        /**
         * Improve sending messages by queueing
         */
        try {
            let lastError = null;
            for(let i=0;i<10;i++) {

                // locking queue messages
                using _fx = await LockFile.lock(`pg-events-msg${message}`);

                const id = "social_" + message.replace(/[^a-zA-Z0-9]/g, "_");
                const c = new pg.Client(globalEnv.db);
                try {
                    await c.connect();
                    await c.query("select pg_notify($1,$2)", [ id, JSON.stringify(payload || null)]);
                    break;
                } catch (e) {
                    lastError = e;
                    continue;
                } finally {
                    await c.end();
                }
            }
            if (lastError) {
                console.error(lastError);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async listen(message: messageTypes, fx: (msg: messageTypes, payload: any) => any): Promise<AsyncDisposable> {

        const id = "social_" + message.replace(/[^a-zA-Z0-9]/g, "_");
        let handlers = this.handlers.get(id);
        if(!handlers) {
            handlers = [];
            this.handlers.set(id, handlers);
        }
        handlers.push({ original: message, listening: false, handler: fx });
        // client.query(`LISTEN ${id}`).catch(console.error);
        console.log(`Listening for ${message} as ${id} on pg`);
        this.added.push(id);
        nextTick(() => this.update().catch(console.error));
        return {
            [Symbol.asyncDispose]: async () => {
                try {
                    this.handlers.delete(id);
                    this.removed.push(id);
                    nextTick(() => this.update().catch(console.error));
                } catch (error) {
                    console.warn(error);
                }
            }
        };
    }

    private update() {
        const a = this.ac;
        this.currentSignal = (this.ac = new AbortController()).signal;
        a?.abort();
        return this._running ??= (async () => {
            while(this.handlers.size) {
               try {
                    const c = await this.client;
                    if (!c) {
                        await sleep(3000, this.currentSignal);
                        continue;
                    }
                    let select1 = true;
                    if (this.added.length) {
                        const added = [... this.added];
                        this.added.length = 0;
                        for (const iterator of added) {
                            await c.query(`LISTEN ${iterator};`);
                            select1 = false;
                        }
                    }
                    if (this.removed.length) {
                        const removed = [... this.removed];
                        this.removed.length = 0;
                        for (const iterator of removed) {
                            await c.query(`UNLISTEN ${iterator};`);
                            select1 = false;
                        }
                    }
                    if (select1) {
                        await c.query("select 1;");
                    }
                } catch (error) {
                    console.error(error);
                }
                // this is to keep connection alive...
                await sleep(15000, this.currentSignal);
            }
            this._running = null;
        })();
    }

}