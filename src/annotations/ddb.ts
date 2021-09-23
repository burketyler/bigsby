import { injectIntoClass } from "ts-injection";
import { Bigsby } from "../classes/bigsby";
import { DdbConfig } from "../domain/models/bigsbyConfig";
import merge from "lodash.merge";
import { DynamoClient } from "../classes/dynamo-client";
import { BigsbyError } from "../domain/errors/bigsbyError";

export function Ddb(
  config: DdbConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (target: any, paramName: string) => void {
  return (target: Record<string, unknown>, paramName: string) => {
    const mergedConfig: DdbConfig = merge(Bigsby.getConfig().ddb, config);
    const client = createClient(mergedConfig);
    injectIntoClass(target, paramName, client);
  };
}

function createClient(config: DdbConfig): DynamoClient {
  if (!config.tableName) {
    throw new BigsbyError("You must provide a table name.");
  }

  if (!config.live) {
    throw new BigsbyError("You must provide either a live config.");
  }

  return new DynamoClient(
    config.tableName,
    shouldCreateLocalClient(config) ? config.local ?? {} : config.live
  );
}

function shouldCreateLocalClient(config: DdbConfig): boolean {
  return (
    (process.env.IS_OFFLINE === "true" || process.env.IS_LOCAL === "true") &&
    config.enableLocal === true
  );
}
