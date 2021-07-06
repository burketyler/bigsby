import { injectIntoClass } from "ts-injection";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { BigsbyConfig } from "../domain/models/bigsbyConfig";
import { useConfig } from "../functions/useConfig";

export function DocClient(config?: DocumentClient.DocumentClientOptions) {
  return (target: any, paramName: string) => {
    const isLocal = process.env.IS_LOCAL;
    const client = isLocal
      ? createLocalClient(useConfig())
      : createClient(config);
    injectIntoClass(target, paramName, client);
  };
}

function createLocalClient(config: BigsbyConfig): DocumentClient {
  return new DocumentClient({
    region: "localhost",
    endpoint: `http://localhost:${config.ddb?.localPort ?? "8000"}`,
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  });
}

function createClient(
  config?: DocumentClient.DocumentClientOptions
): DocumentClient {
  return new DocumentClient(config);
}
