import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";

import { Bigsby } from "../../src/bigsby";
import { testAwsData } from "../__data__/test-aws-data";
import { InjectionHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Injection tests", () => {
  let handler: HandlerFunction;
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let bigsby: Bigsby;

  beforeAll(() => {
    bigsby = new Bigsby({
      api: { request: { enableTypeCoercion: false } },
      logging: { enabled: false },
    });
    handler = bigsby.createApiHandler(InjectionHandler);
  });

  beforeEach(() => {
    mockEvent = { ...eventV1(), body: bigsby as any };
    mockContext = contextV1();
  });

  it("Should not resolve request context before handler invocation", () => {
    expect(() => bigsby.getCurrentRequestContext()).toThrow();
  });

  it("Should resolve request context for duration of request lifecycle", async () => {
    await expect(handler(mockEvent, mockContext, () => {})).resolves.toEqual(
      expect.objectContaining({
        statusCode: 200,
      })
    );
  });

  it("Should not resolve request context after handler invocation", () => {
    expect(() => bigsby.getCurrentRequestContext()).toThrow();
  });
});
