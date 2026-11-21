import SocketClient from "../socket/client/SocketClient.js";
import os from "node:os";
import { domainToUnicode } from "node:url";

export interface ISmtpAuth {
    login: {
        username: string;
        password: string;
    }
};

class SmtpError extends Error {}

export default class ESmtpClient {

    public static async connect({
        port = 25,
        host = void 0 as string,
        hosts = void 0 as string[],
        servername = void 0 as string,
        startTLS = true,
        helo = void 0 as string,
        auth = void 0 as ISmtpAuth,
        logger = void 0 as ((data) => void)
    }): Promise<ESmtpClient> {

        if (hosts) {
            let error: Error;
            for (const iterator of hosts) {
                try {
                    return await this.connect({
                        port,
                        host: iterator,
                        servername,
                        startTLS,
                        helo,
                        auth,
                        logger
                    });
                } catch (e) {
                    error = e;
                    // try next...
                }
            }
            if (error) {
                throw error;
            }
        }

        const client = await SocketClient.connect({
            port,
            host,
            servername,
            ssl: false,
            logger
        });

        let greeting = "";
        logger?.(`Connected to ${host}`);
        let line = await client.readLine();
        logger?.(line);
        for(;;){
            if(/^220\-/.test(line)) {
                greeting += line + "\n";
                line = await client.readLine();
                continue;
            }
            if(/^220\s/.test(line)) {
                greeting += line;
                break;
            }
            throw new SmtpError(`Invalid server response ${greeting}${line}`);
        }

        const eSmtpClient = new ESmtpClient(client, logger);
        await eSmtpClient.init(helo, greeting.toLocaleLowerCase().includes("esmtp"), servername ?? host, startTLS);
        const login = auth?.login;
        if (login) {
            await eSmtpClient.sendCommand("AUTH LOGIN",334);
            await eSmtpClient.sendCommand(Buffer.from(login.username, "utf-8").toString("base64"),334);
            await eSmtpClient.sendCommand(Buffer.from(login.password, "utf-8").toString("base64"),235);
        }
        // increasing timeout only after reading first line
        // client.timeout = 15 * 1000;
        return eSmtpClient;
    }

    public get eventError() {
        return this.client.eventError;
    }

    public get eventClosed() {
        return this.client.eventClosed;
    }

    public get isSecure() {
        return this.sslSupported;
    }

    private sslSupported: boolean;

    private smtpUtf8Supported = false;

    private constructor(private client: SocketClient, private logger: (data) => void) {
    }

    public dispose() {
        this.client.destroy();
    }

    [Symbol.dispose]() {
        this.client.destroy();
    }

    public async sendRequest(from: string, to: string[], file: string) {
        let logs = "";
        if (this.logger) {
            const prev = this.logger;
            this.logger = (data) => {
                logs += `\n${data}`;
                prev.call(this, data);
            };
        } else {
            this.logger = (data) => {
                logs += `\n${data}`;
            };
        }
        await this.send(from, to, file);
        return {
            logs,
            status: "250"
        };
    }

    public async send(from: string, to: string[], body: string) {
        if(!this.smtpUtf8Supported) {
            const toUnicode = (x: string) => x.split("@").map((a) => domainToUnicode(a) || a).join("@");
            from = toUnicode(from) || from;
            to = to.map((x) => toUnicode(x) || x);
            await this.sendCommand(`MAIL FROM:<${from}>`);
            for (const iterator of to) {
                await this.sendCommand(`RCPT TO:<${iterator}>`);
            }
        } else {
            await this.sendCommand(`MAIL FROM:<${from}> SMTPUTF8`);
            for (const iterator of to) {
                await this.sendCommand(`RCPT TO:<${iterator}>`);
            }
        }

        // we will increase timeout
        const timeout = this.client.timeout;
        this.client.timeout = 60*1000; // one minute
        await this.sendCommand("DATA", 354);
        this.client.timeout = timeout;

        this.logger?.(`>> DATA`);
        for (const line of body.split("\r\n")) {
            // disable logging...
            if (line.startsWith(".")) {
                await this.client.writeLine(`.${line}`, { log: false });
            } else {
                await this.client.writeLine(line,{ log: false });
            }
        }
        await this.sendCommand(".");
    }

    private async init(name: string, eSmtp = false, servername?: string, startTLS?: boolean) {

        let startTLSSupported = false;

        if (eSmtp) {
            await this.sendCommand(`EHLO ${name ?? os.hostname() }`, 250, (t) => {
                startTLSSupported ||= /-STARTTLS/i.test(t);
                this.smtpUtf8Supported ||= /SMTPUTF8/i.test(t);
         });
        } else {
            await this.sendCommand(`HELO ${name ?? os.hostname() }`);
        }

        if (startTLSSupported && startTLS) {
            await this.sendCommand("STARTTLS", 220);
            await this.client.upgradeTLS( {
                servername,
                rejectUnauthorized: false,
                ciphers: 'DEFAULT@SECLEVEL=1',
            });
            await this.sendCommand(`EHLO ${name ?? os.hostname() }`, 250, (t) => {
                startTLSSupported ||= /-STARTTLS/i.test(t);
                this.smtpUtf8Supported ||= /SMTPUTF8/i.test(t);
            });

            this.sslSupported = true;
        }
    }

    private async sendCommand(
        command: string,
        ok: number = 250,
        parse?: (text: string) => void) {
        await this.client.writeLine(command);
        const lines = [];
        do {
            const response = await this.client.readLine();
            this.logger?.(response);
            if (/^\d+\-/.test(response)) {
                parse?.(response);
                lines.push(response);
                continue;
            }
            lines.push(response);
            const code = parseInt(response, 10);
            if (code === ok) {
                return lines;
            }
            throw new SmtpError(lines.join("\n"));
        } while (true);
    }

}
