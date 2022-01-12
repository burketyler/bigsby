import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";

import { createHandler } from "../../src/api";
import { testAwsData } from "../__data__/test-aws-data";
import { AuthHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = constants;

describe("Auth tests", () => {
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  describe("When auth method is passed via annotation", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = createHandler(AuthHandler);
    });

    it("Should return the handler response when request auth succeeds", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_OK,
        })
      );
    });

    it("Should return an unauthorized response when request auth fails", async () => {
      const response = await handler(
        { ...mockEvent, body: undefined },
        mockContext,
        () => {}
      );

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_UNAUTHORIZED,
        })
      );
    });
  });

  describe("When auth method is passed via annotation", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = createHandler(AuthHandler, {
        api: {
          request: {
            auth: (context) => {
              if (context.event.body === "fail") {
                throw new Error();
              }
            },
          },
        },
      });
    });

    it("Should return the handler response when request auth succeeds", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_OK,
        })
      );
    });

    it("Should return an unauthorized response when request auth fails", async () => {
      const response = await handler(
        { ...mockEvent, body: "fail" },
        mockContext,
        () => {}
      );

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_UNAUTHORIZED,
        })
      );
    });
  });
});
