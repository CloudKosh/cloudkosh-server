/* eslint-disable no-console */
import Inject, { RegisterSingleton, ServiceObject } from "@entity-access/entity-access/dist/di/di.js";
import PgEvents from "./PgEvents.js";

export interface IMessageChannel<T = string> {
    on(fx: (data: T) => any);
    notify(data: T);
}

@RegisterSingleton
export default class MessagingService extends ServiceObject {

    removeUserLoginSessions: IMessageChannel<{ userID }>;

    @Inject
    private pgEvents: PgEvents;

    postInit() {
        this.removeUserLoginSessions = this.segment(`remove-user-login-sessions`);
    }

    notify(messageName: string, data: any): any {
        return this.pgEvents.emit(messageName, data);
    }

    listen(messageName: string, fx: (name: string, data: any) => any): any {
        return this.pgEvents.listen(messageName, (msg, data) => {
            return fx(msg, data);
        });
    }

    private segment(messageName: string): IMessageChannel<any> {
        return {
            on: (fx) => this.listen(messageName, (msg, data) => fx(data)?.catch?.(console.error)),
            notify: (data) => this.notify(messageName, data)?.catch?.(console.error),
        };
    }

}