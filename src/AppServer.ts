import { ServiceCollection } from "@entity-access/entity-access/dist/di/di.js";
import ContextEvents from "@entity-access/entity-access/dist/model/events/ContextEvents.js";
import AppDbContext from "@entity-access/server-pages/dist/core/AppDbContext.js";
import AuthorizationService from "@entity-access/server-pages/dist/services/AuthorizationService.js";
import KoshDbContext from "./server/model/KoshDbContext.js";
import KoshDbContextEvents from "./server/model/KoshDbContextEvents.js";
import CloudKoshAuthService from "./server/services/auth/CloudKoshAuthService.js";
import AppWorkflowContext from "./server/workflows/AppWorkflowContext.js";
import KoshWorkflowContext from "./server/workflows/KoshWorkflowContext.js";
import WebServer from "./WebServer.js";

export default class AppServer extends WebServer {

    register() {
        ServiceCollection.registerMultiple("Singleton", [AppWorkflowContext, KoshWorkflowContext], KoshWorkflowContext);
        ServiceCollection.registerMultiple("Scoped", [AppDbContext, KoshDbContext], KoshDbContext);
        ServiceCollection.registerMultiple("Singleton", [ContextEvents, KoshDbContextEvents], KoshDbContextEvents);

        // we will set differently when we go live
        ServiceCollection.registerMultiple("Singleton", [AuthorizationService], CloudKoshAuthService);

    }
}