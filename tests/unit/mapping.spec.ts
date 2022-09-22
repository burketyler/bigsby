import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";

import { Bigsby } from "../../src/bigsby";
import { testAwsData } from "../__data__/test-aws-data";
import { SuccessHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Mapping tests", () => {
  let bigsby: Bigsby;

  beforeAll(() => {
    bigsby = new Bigsby({ logging: { enabled: false } });
  });

  describe("@Body mapping tests", () => {
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;
    let mockContext: Context;

    beforeAll(() => {
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    describe("When body has inferred type of object", () => {
      it("Should pass the event body through to the specified parameter", async () => {
        const response = await handler(mockEvent, mockContext, () => {});

        expect(JSON.parse(response.body)).toEqual(
          expect.objectContaining({
            theBody: JSON.parse(mockEvent.body!),
          })
        );
      });
    });
  });

  describe("@Query mapping tests", () => {
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;
    let mockContext: Context;

    beforeAll(() => {
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    it("Should pass the event queryStrings through to the specified parameter", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          strQuery: mockEvent.queryStringParameters!.strQuery,
          boolQuery: mockEvent.queryStringParameters!.boolQuery! === "true",
          objQuery: JSON.parse(mockEvent.queryStringParameters!.objQuery!),
          arrQuery: JSON.parse(mockEvent.queryStringParameters!.arrQuery!),
        })
      );
    });

    it("Should search the event queryStrings based on the searchKey if provided, instead of the param name", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          numberQuery: +mockEvent.queryStringParameters!.numQuery!,
        })
      );
    });
  });

  describe("@Header mapping tests", () => {
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;
    let mockContext: Context;

    beforeAll(() => {
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    it("Should pass the request headers through to the specified parameter", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          numHeader: +mockEvent.headers!["Num-Header"]!,
          boolHeader: mockEvent.headers!["bOol-Header"] === "true",
          objHeader: JSON.parse(mockEvent.headers!["OBJ-HEADER"]!),
          arrHeader: JSON.parse(mockEvent.headers!["arr-header"]!),
        })
      );
    });

    it("Should search the event headers based on the searchKey if provided, instead of the param name", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          host: mockEvent.headers.Host,
        })
      );
    });

    it("Should resolve the header regardless of case", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          pragma: mockEvent.headers.pragma,
        })
      );
    });
  });

  describe("@Path mapping tests", () => {
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;
    let mockContext: Context;

    beforeAll(() => {
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    it("Should pass the request pathParameters through to the specified parameter", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          numPath: +mockEvent.pathParameters!.numPath!,
          boolPath: mockEvent.pathParameters!.boolPath === "true",
          objPath: JSON.parse(mockEvent.pathParameters!.objPath!),
          arrPath: JSON.parse(mockEvent.pathParameters!.arrPath!),
        })
      );
    });

    it("Should search the event pathParameters based on the searchKey if provided, instead of the param name", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(JSON.parse(response.body)).toEqual(
        expect.objectContaining({
          stringPath: mockEvent.pathParameters!.strPath,
        })
      );
    });
  });
});
