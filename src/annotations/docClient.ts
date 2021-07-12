import { injectIntoClass } from "ts-injection";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Bigsby } from "../classes/bigsby";
import { DynamoConfig } from "../domain/models/bigsbyConfig";
import merge from "lodash.merge";

export function DocClient(
  config: DynamoConfig = {}
): (target: Record<string, unknown>, paramName: string) => void {
  return (target: Record<string, unknown>, paramName: string) => {
    const mergedConfig: DynamoConfig = merge(Bigsby.getConfig().ddb, config);
    const client = createClient(mergedConfig);
    injectIntoClass(target, paramName, client);
  };
}

function shouldCreateLocalClient(config: DynamoConfig): boolean {
  return (
    (process.env.IS_OFFLINE === "true" || process.env.IS_LOCAL === "true") &&
    config.enableLocal === true
  );
}

function createClient(config: DynamoConfig): DocumentClient {
  return new DocumentClient(
    shouldCreateLocalClient(config) ? config.local : config.live
  );
}
