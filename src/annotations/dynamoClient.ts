import { injectIntoClass } from "ts-injection";
import { TsLambdaConfig } from "../domain/models/tsLambdaConfig";
import { DynamoDB } from "aws-sdk";
import { useConfig } from "../functions/useConfig";

export function DynamoClient(config?: DynamoDB.ClientConfiguration) {
  return (target: any, paramName: string) => {
    const isLocal = process.env.IS_LOCAL;
    const client = isLocal
      ? createLocalClient(useConfig())
      : createClient(config);
    injectIntoClass(target, paramName, client);
  };
}

function createLocalClient(config: TsLambdaConfig): DynamoDB {
  return new DynamoDB({
    region: "localhost",
    endpoint: `http://localhost:${config.ddb?.localPort ?? "8000"}`,
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  });
}

function createClient(config?: DynamoDB.ClientConfiguration): DynamoDB {
  return new DynamoDB(config);
}
