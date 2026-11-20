import { RegisterSingleton } from "@entity-access/entity-access/dist/di/di.js";

@RegisterSingleton
export default class EmailService {

    async send(msg: { subject }) {

    }

}