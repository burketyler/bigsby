import { ApiHandlerConfig } from "../../annotations/api-handler";
import { LoggerConfig } from "../../logger";

export interface BigsbyConfig {
  apiHandler: ApiHandlerConfig;
  logger: LoggerConfig;
}
