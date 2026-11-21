import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import XNode from "@entity-access/server-pages/dist/html/XNode.js";
import { globalEnv } from "../../../globalEnv.js";
import ESmtpClient from "../smtp/ESmtpClient.js";

export interface IEmail {
    subject: string;
    body: XNode | string;
    to: string[];
}

@RegisterSingleton
export default class EmailService {

    async send({
        to,
        subject,
        body
    }: IEmail) {

        const {
            host,
            port,
            username,
            password,
            from
        } = globalEnv.smtp;
        if(!host) {
            console.log(`Cannot send email, SMTP host and credentials are missing`);
            return;
        }


        await using smtp = await ESmtpClient.connect({
            host,
            port,
            auth: {
                login: {
                    username,
                    password
                }
            }
        });

        const mail = new MailComposer({
            from,
            to,
            subject,
            html: typeof body === "string" ? body : body.render(""),
        });

        // Compile to a Buffer or ReadableStream
        const mimeBuffer = (await mail.compile().build()).toString("utf-8");

        await smtp.send(from, to, mimeBuffer);

    }

}