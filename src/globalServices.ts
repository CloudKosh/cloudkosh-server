import Logger, { ConsoleLogger } from "@entity-access/entity-access/dist/common/Logger.js";
import { ServiceProvider } from "@entity-access/entity-access/dist/di/di.js";
import { globalEnv } from "./globalEnv.js";

export const globalServices = new ServiceProvider();

globalServices.add(Logger, new ConsoleLogger());

export const isTestMode = globalEnv.isTestMode;
