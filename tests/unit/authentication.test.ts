import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";

import { Bigsby } from "../../src/bigsby";
import { testAwsData } from "../__data__/test-aws-data";
import { AuthHandler, RegisteredAuthHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = constants;

describe("Auth tests", () => {
  let bigsby: Bigsby;
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let mockAuth: jest.Mock;

  beforeAll(() => {
    bigsby = new Bigsby({ logging: { enabled: false } });
    mockAuth = jest.fn();
    bigsby.registerAuthScheme({ name: "MOCK_AUTH", authenticator: mockAuth });
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  describe("When auth method is passed via annotation", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = bigsby.createApiHandler(AuthHandler);
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

  describe("When auth method is passed via handler config", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = bigsby.createApiHandler(AuthHandler, {
        request: {
          auth: async (context) => {
            if (context.event.body === "fail") {
              throw new Error();
            }
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

  describe("When auth method is registered as named method", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = bigsby.createApiHandler(RegisteredAuthHandler);
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
      mockAuth.mockImplementationOnce(() => {
        throw new Error("Test");
      });

      const response = await handler(mockEvent, mockContext, () => {});

      expect(response).toEqual(
        expect.objectContaining({
          statusCode: HTTP_STATUS_UNAUTHORIZED,
        })
      );
    });
  });
});
