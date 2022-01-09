import { RestApiConfig } from "../../annotations/rest-api";
import { LoggerConfig } from "../../logger";

export interface BigsbyConfig {
  restApi: RestApiConfig;
  logger: LoggerConfig;
}
