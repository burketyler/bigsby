import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";

import { Bigsby } from "../../src/bigsby";
import { VersioningMethod } from "../../src/types";
import { testAwsData } from "../__data__/test-aws-data";
import { Version1Handler, Version2Handler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const { HTTP_STATUS_OK, HTTP_STATUS_BAD_REQUEST } = constants;

describe("Versioning tests", () => {
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let bigsby: Bigsby;

  beforeAll(() => {
    bigsby = new Bigsby();
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
  });

  describe.each(Object.values(VersioningMethod))(
    "When %s versioning is chosen as method",
    (method) => {
      describe.each(["ANNOTATED", "MAPPED"])(
        "When versions are %s",
        (applicationType) => {
          let handler: HandlerFunction;
          let defaultVersion: string;

          beforeAll(() => {
            defaultVersion = "v1";
            const config = {
              versioning: {
                method,
                defaultVersion,
                key: "Version",
              },
            };
            if (applicationType === "ANNOTATED") {
              handler = bigsby.createApiHandler(
                [Version1Handler, Version2Handler],
                config
              );
            } else {
              handler = bigsby.createApiHandler(
                {
                  v1: Version1Handler,
                  v2: Version2Handler,
                },
                config
              );
            }
          });

          it.each(["v1", "v2"])(
            "Should return handler response for API version: %s",
            async (version) => {
              const response = await handler(
                {
                  ...mockEvent,
                  headers: { Version: version },
                  pathParameters: { version },
                },
                mockContext,
                () => {}
              );

              expect(response).toEqual(
                expect.objectContaining({
                  body: version,
                  statusCode: HTTP_STATUS_OK,
                })
              );
            }
          );

          it("Should return handler response for defaultVersion when no version provided", async () => {
            const response = await handler(mockEvent, mockContext, () => {});

            expect(response).toEqual(
              expect.objectContaining({
                body: defaultVersion,
                statusCode: HTTP_STATUS_OK,
              })
            );
          });

          it("Should return badRequest when version provided has no associated handler", async () => {
            const response = await handler(
              {
                ...mockEvent,
                headers: { Version: "v5" },
                pathParameters: { Version: "v5" },
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
        }
      );
    }
  );
});
