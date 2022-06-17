import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";

import { Bigsby } from "../../src/bigsby";
import * as Response from "../../src/response";
import { testAwsData } from "../__data__/test-aws-data";
import { DirectValueHandler, SuccessHandler } from "../__utils__/handlers";

const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_BAD_REQUEST,
} = constants;

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Handler tests", () => {
  let handler: HandlerFunction;
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let unhandledSpy: jest.SpyInstance;
  let mockAuth: jest.Mock;
  let spyTransformResponse: jest.SpyInstance;
  let bigsby: Bigsby;

  beforeAll(() => {
    bigsby = new Bigsby();
    unhandledSpy = jest.spyOn(SuccessHandler.prototype, "spyOnMeUnhandled");
    mockAuth = jest.fn();
    handler = bigsby.createApiHandler(SuccessHandler, {
      request: {
        auth: mockAuth,
      },
    });
    spyTransformResponse = jest.spyOn(Response, "transformResponse");
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  it("Should instantiate", () => {
    expect(handler).toBeDefined();
  });

  describe("When handler invocation is successful", () => {
    describe("When handler returns an ApiResponse", () => {
      it("Should return the ApiResponse returned by the invoke method", async () => {
        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });
    });

    describe("When handler returns a response value", () => {
      it("Should return response value returned by the invoke method", async () => {
        const response = await bigsby.createApiHandler(DirectValueHandler)(
          mockEvent,
          mockContext
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
            body: "imNotAnApiResponse",
          })
        );
      });
    });
  });

  describe("When handler invocation is unsuccessful", () => {
    describe("When request body fails to parse", () => {
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

    describe("When response body fails to parse", () => {
      it("Should return the a internalError response", async () => {
        spyTransformResponse.mockImplementationOnce(() => {
          throw new Error();
        });

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          })
        );
      });
    });

    describe("When request auth fails", () => {
      it("Should return an unauthorized response", async () => {
        mockAuth.mockImplementationOnce(() => {
          throw new Error();
        });

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_UNAUTHORIZED,
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
