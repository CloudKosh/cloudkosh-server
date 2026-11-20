import net, { Socket } from "net";
import EventSet from "@entity-access/entity-access/dist/common/EventSet.js";
import tls, { TLSSocket } from "tls";
import { AsyncSocketReader } from "./AsyncSocketReader.js";
import TimeoutError from "../../../../common/errors/TimeoutError.js";

export default class SocketClient {

    public static from(socket: Socket, logger = void 0) {
        return new SocketClient(socket,logger);
    }

    public static async connect({ port, host = void 0, servername = void 0, logger = void 0, ssl = void 0, connectTimeout = 15000}) {
        logger?.(`Opening connection to ${servername}:${host}:${port} with ssl as ${ssl}`);
        const client = await new Promise<SocketClient>((resolve, reject) => {
            const c = ssl
                ? tls.connect({ port, host, servername, rejectUnauthorized: false, timeout: connectTimeout })
                : host ? net.connect({ host, port, timeout: connectTimeout }) : net.connect({ port, timeout: connectTimeout });

            c.once("error", (error) => {
                logger?.(error);
                reject(error);
                try {
                    c.destroy(error);
                } catch {
                    // ignore
                }
            });
            c.once("close", () => {
                try {
                    c.destroy(new Error("Closed"));
                } catch {
                    // ignore
                }
            });
            const timeout = () => {
                const e1 = new TimeoutError(`Timeout for ${servername}(${host})`);
                logger?.(e1);
                reject(e1);
                try {
                    c.destroy(e1);
                } catch {
                    // ignore...
                }
            };
            c.once("timeout", timeout);
            c.once("connect", () => {
                // c.off("timeout", timeout);
                logger?.("Socket connected");
                resolve(new SocketClient(c, logger));
            });
        });
        logger?.(`Connection established`);
        return client;
    }

    eventError = new EventSet(this);

    eventClosed = new EventSet(this);

    remoteAddress: string;
    secure = false;

    // get remoteAddress() {
    //     return this.client.remoteAddress;
    // }

    /**
     * Default timeout is 30 seconds.
     */
    get timeout() {
        return this.client.timeout;
    }
    set timeout(v: number) {
        this.client.setTimeout(0);
        if (v > 0) {
            this.client.setTimeout(v);
        }
    }

    // get secure() {
    //     return this.isSecure;
    // }

    private _onTimeout;
    private _onError;
    private _onClose;
    // private isSecure = false;
    private socketReader: AsyncSocketReader;

    private timeouts = [] as ((e: Error) => void )[];

    private constructor(
        private client: net.Socket,
        private logger: (data) => void = () => void 0,
    ) {
        this.remoteAddress = client.remoteAddress;
        this.socketReader = new AsyncSocketReader(client);
        this._onError = (e) => {
            for(const fx of this.timeouts) {
                try {
                    fx(e);
                } catch (ex2) {
                }
            }
            try {
                this.client.destroy(e);
            } catch {
            }
            this.eventError.dispatcher(e);
        };
        this._onTimeout = () => {
            const e = new Error("Timedout");
            for(const fx of this.timeouts) {
                try {
                    fx(e);
                } catch (ex2) {
                }
            }
            try {
                this.client.destroy(e);
            } catch {
                this._onError(e);
            }
        };
        this._onClose = () => {
            const e = new Error("Closed");
            for(const fx of this.timeouts) {
                try {
                    fx(e);
                } catch (ex2) {
                }
            }
            this.eventClosed.dispatch(void 0);            
        };
        this.client.on("error", this._onError);
        this.client.setTimeout(30000);
        this.client.on("close", this._onClose);
        this.client.on("timeout", this._onTimeout);
        this.client.on("end", this._onTimeout);
    }

    onTimeout(fx) {
        this.timeouts.push(fx);
    }

    destroy() {
        try {
            this.client.destroy();
        } catch {
            // do nothing...
        }
    }

    [Symbol.dispose]() {
        this.destroy();
    }

    async writeLine(line: string, { encoding = "ascii" as BufferEncoding, log = true} = {}) {
        if (log) {
            this.logger(`>> ${line}`);
        }
        // following double callback will prevent
        // allocating extra buffer
        line += "\r\n";
        await new Promise<void>((resolve, reject) => {
            this.client.write(
                line,
                encoding,
                (error) => error
                    ? reject(error)
                    : resolve());
        });
    }

    /**
     * Returns a line that ends with `\r\n` but does not include `\r\n`
     * @param encoding "ascii"
     * @param signal AbortSignal
     * @returns string
     */
    async readLine(encoding: BufferEncoding = "ascii", signal?: AbortSignal) {
        const line = await this.socketReader.readLineTillCRLF(encoding, signal);
        this.logger?.(`<< ${line}`);
        return line;
    }

    // /**
    //  * Returns a line that ends with `\n` but does not include `\n`
    //  * @param encoding "ascii"
    //  * @param signal AbortSignal
    //  * @returns string
    //  */
    // async readLineTillLF(encoding: BufferEncoding = "ascii", signal?: AbortSignal) {
    //     const line = await this.socketReader.readLineTillLF(encoding, signal);
    //     this.logger?.(`<< ${line}`);
    //     return line;
    // }

    public readChars(length: number, signal?: AbortSignal) {
        return this.socketReader.readBytes(length, signal);
    }

    public async  upgradeTLS(options: tls.ConnectionOptions = {  }) {

        this.socketReader.close();

        const ts = await new Promise<TLSSocket>((resolve, reject) => {
            const socket = this.client;
            const c = tls.connect({
                port: socket.remotePort,
                socket,
                rejectUnauthorized: false,
                timeout: 30000,
                sessionTimeout: 30000,
                ... options,
            }, () => {
                this.socketReader = new AsyncSocketReader(c);
                resolve(c);
            });
            c.once("tlsError", this._onError);
            c.once("error", reject);
            c.once("timeout", this._onTimeout);
            c.on("error", this._onError);
            c.once("close", this._onClose);
        });
        this.client.off("close", this._onClose);
        this.client.off("timeout", this._onTimeout);
        this.client.off("error", this._onError);
        this.client.off("end", this._onTimeout);
        ts.setTimeout(this.client.timeout);
        this.client.setTimeout(0);
        this.client = ts;
        this.client.on("end", this._onTimeout);
        this.secure = true;
    }

    public async upgradeAsServerTLS(options: tls.TLSSocketOptions = {  }) {

        this.socketReader.close();

        const ts = await new Promise<TLSSocket>((resolve, reject) => {
            const socket = this.client;
            options.sessionTimeout ??= 30000;
            const c = new TLSSocket(socket, options);
            c.once("error", reject);
            this.socketReader = new AsyncSocketReader(c);
            c.once("timeout", this._onTimeout);
            c.on("error", this._onError);
            c.once("close", this._onClose);
            c.once("secure", () => {
                resolve(c);
            });
        });
        this.client.off("close", this._onClose);
        this.client.off("timeout", this._onTimeout);
        this.client.off("error", this._onError);
        this.client.off("end", this._onTimeout);
        ts.setTimeout(this.client.timeout);
        // this.client.setTimeout(0);
        this.client = ts;
        this.client.once("end", this._onClose);
        this.secure = true;
    }

}