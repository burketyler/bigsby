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
    },
    multiValueHeaders: {},
    queryStringParameters: {
      strQuery: "strQuery",
      numQuery: "456",
      boolQuery: "false",
      objQuery: JSON.stringify({ value: "objQuery" }),
    },
    multiValueQueryStringParameters: null,
    pathParameters: {
      strPath: "strPath",
      numPath: "789",
      boolPath: "true",
      objPath: JSON.stringify({ value: "objPath" }),
    },
    stageVariables: null,
    body: JSON.stringify({
      value: "Greetings!",
    }),
    isBase64Encoded: false,
  };
}

function contextV1(): Context {
  return {} as Context;
}

export const testAwsData = {
  apiGw: {
    eventV1,
    contextV1,
  },
};
