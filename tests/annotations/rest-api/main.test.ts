import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";

import { createRestApiHandler } from "../../../src/annotations/rest-api";
import { testAwsData } from "../../__data__/test-aws-data";
import { HandlerRestApi } from "../../__utils__/handlers";

const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
} = constants;

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("RestApi tests", () => {
  let handler: HandlerFunction;
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let unhandledSpy: jest.SpyInstance;

  beforeAll(() => {
    handler = createRestApiHandler(HandlerRestApi);
    unhandledSpy = jest.spyOn(HandlerRestApi.prototype, "spyOnMeUnhandled");
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  it("Should instantiate successfully", () => {
    expect(handler).toBeDefined();
  });

  describe("When handler invocation is successful", () => {
    it("Should return the HttpResponse returned by the invoke method", async () => {
      const response = await handler(mockEvent, mockContext, () => {});

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_OK,
        })
      );
    });
  });

  describe("When handler invocation is unsuccessful", () => {
    describe("When event body fails to parse", () => {
      it("Should return the a badRequest response", async () => {
        const response = await handler(
          { ...mockEvent, body: "notJson" },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_BAD_REQUEST,
          })
        );
      });
    });

    describe("When an unhandled exception occurs during execution of invoke method", () => {
      it("Should return an internalError response", async () => {
        unhandledSpy.mockImplementationOnce(() => {
          throw new Error("testError");
        });

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          })
        );
      });
    });
  });
});
