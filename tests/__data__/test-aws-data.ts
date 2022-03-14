import { APIGatewayProxyEvent, Context } from "aws-lambda";

function eventV1(): APIGatewayProxyEvent {
  return {
    resource: "/",
    path: "/",
    httpMethod: "GET",
    requestContext: {
      resourcePath: "/",
      httpMethod: "GET",
      path: "/Prod/",
    } as any,
    headers: {
      Host: "host",
      pragma: "pragma",
      "Num-Header": "123",
      "bOol-Header": "true",
      "OBJ-HEADER": JSON.stringify({ value: "objParam" }),
      "arr-header": JSON.stringify([1, 2]),
    },
    multiValueHeaders: {},
    queryStringParameters: {
      strQuery: "strQuery",
      numQuery: "456",
      boolQuery: "false",
      objQuery: JSON.stringify({ value: "objQuery" }),
      arrQuery: JSON.stringify([3, 4]),
    },
    multiValueQueryStringParameters: null,
    pathParameters: {
      strPath: "strPath",
      numPath: "789",
      boolPath: "true",
      objPath: JSON.stringify({ value: "objPath" }),
      arrPath: JSON.stringify([5, 6]),
    },
    stageVariables: null,
    body: JSON.stringify({
      value: "Greetings!",
    }),
    isBase64Encoded: false,
  };
}

function contextV1(): Context {
  return {
    awsRequestId: "765eb2c2-5cdb-4363-82b4-89b292b89ff6",
  } as Context;
}

export const testAwsData = {
  apiGw: {
    eventV1,
    contextV1,
  },
};
