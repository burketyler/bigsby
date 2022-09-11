import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";
import Joi from "joi";

import { Bigsby } from "../../src/bigsby";
import { testAwsData } from "../__data__/test-aws-data";
import { ValidationHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
} = constants;

describe("Validation tests", () => {
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let bigsby: Bigsby;

  beforeAll(() => {
    bigsby = new Bigsby({ logging: { enabled: false } });
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  describe("When schemas are passed via annotation", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = bigsby.createApiHandler(ValidationHandler);
    });

    describe("When RequestSchema annotated on handler class", () => {
      it("Should return handler response when request matches", async () => {
        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });

      it("Should return a badRequest response when request doesn't match schema", async () => {
        const response = await handler(
          { ...mockEvent, body: undefined },
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

    describe("When ResponseSchemaMap annotated on handler class", () => {
      it("Should return handler response when response matches", async () => {
        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });

      it("Should return an internalError response when request doesn't match schema", async () => {
        const response = await handler(
          { ...mockEvent, headers: { Pragma: "" } },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          })
        );
      });
    });

    describe("When ResponseSchema annotated on handler class", () => {
      it("Should return handler response when response matches schema", async () => {
        const response = await handler(
          { ...mockEvent, headers: { Pragma: "body" } },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });

      it("Should return an internalError response when response doesn't match schema", async () => {
        const response = await handler(
          { ...mockEvent, headers: { Pragma: undefined } },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          })
        );
      });
    });
  });

  describe("When schemas are passed via config", () => {
    let handler: HandlerFunction;

    beforeAll(() => {
      handler = bigsby.createApiHandler(ValidationHandler, {
        request: {
          schema: {
            body: Joi.string().required().options({ allowUnknown: true }),
          },
        },
        response: {
          schema: {
            [HTTP_STATUS_OK]: Joi.object({
              body: Joi.string().allow("configSchema").required(),
            }).options({ allowUnknown: true }),
            [HTTP_STATUS_BAD_REQUEST]: Joi.object({
              body: Joi.string().allow("badRequest").required(),
            }).options({ allowUnknown: true }),
          },
        },
      });
    });

    describe("When RequestSchema passed in via handler config", () => {
      it("Should return handler response when request matches", async () => {
        const response = await handler(
          {
            ...mockEvent,
            headers: { Pragma: "configSchema" },
          },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });

      it("Should return a badRequest response when request doesn't match schema", async () => {
        const response = await handler(
          {
            ...mockEvent,
            headers: { Pragma: "badRequest" },
            body: undefined,
          },
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

    describe("When ResponseSchema passed in via handler config", () => {
      it("Should return handler response when response matches schema", async () => {
        const response = await handler(
          { ...mockEvent, headers: { Pragma: "configSchema" } },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_OK,
          })
        );
      });

      it("Should return an internalError response when response doesn't match schema", async () => {
        const response = await handler(
          { ...mockEvent, headers: { Host: "bad", Pragma: "" } },
          mockContext,
          () => {}
        );

        expect(response).toEqual(
          expect.objectContaining({
            statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          })
        );
      });
    });
  });
});
