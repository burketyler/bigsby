import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { executeAwsRequest } from "../../functions/execute-aws-request";
import { DynamoDB } from "aws-sdk";
import { DdbErrors } from "./types";
import { ConditionCheckFailError } from "../../domain/errors/condition-check-failed-error";

export default class DynamoClient {
  private readonly db: DocumentClient;

  constructor(
    private readonly tableName: string,
    config: DynamoDB.ClientConfiguration
  ) {
    this.db = new DocumentClient(config);
  }

  public async put(
    input: Omit<DocumentClient.PutItemInput, "TableName">
  ): Promise<DocumentClient.PutItemOutput> {
    return executeAwsRequest<DocumentClient.PutItemOutput>(
      this.db
        .put({
          TableName: this.tableName,
          ...input,
        })
        .promise()
    );
  }

  public async scan(): Promise<DocumentClient.ScanOutput> {
    return await executeAwsRequest<DocumentClient.ScanOutput>(
      this.db.scan({ TableName: this.tableName }).promise()
    );
  }

  public async get(
    params: Omit<DocumentClient.GetItemInput, "TableName">
  ): Promise<DocumentClient.GetItemOutput> {
    return await executeAwsRequest<DocumentClient.GetItemOutput>(
      this.db.get({ TableName: this.tableName, ...params }).promise()
    );
  }

  public async query(
    query: Omit<DocumentClient.QueryInput, "TableName">
  ): Promise<DocumentClient.QueryOutput> {
    return await executeAwsRequest<DocumentClient.QueryOutput>(
      this.db.query({ TableName: this.tableName, ...query }).promise()
    );
  }

  public async update(
    params: Omit<DocumentClient.UpdateItemInput, "TableName">
  ): Promise<DocumentClient.UpdateItemOutput> {
    try {
      return await executeAwsRequest<DocumentClient.UpdateItemOutput>(
        this.db.update({ TableName: this.tableName, ...params }).promise()
      );
    } catch (error) {
      if (error.name === DdbErrors.CONDITION_FAIL) {
        throw new ConditionCheckFailError();
      }

      throw error;
    }
  }
}
