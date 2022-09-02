import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { Logger, LogLevel } from "ts-injection";

import { Bigsby } from "../../src/bigsby";
import { BigsbyLogger } from "../../src/types";
import { testAwsData } from "../__data__/test-aws-data";
import { SuccessHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const mockNativeInfo = jest.spyOn(Logger.prototype, "info");
const mockNativeDebug = jest.spyOn(Logger.prototype, "debug");

describe("Logging tests", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("When using default logger", () => {
    let bigsby: Bigsby;
    let mockContext: Context;
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;

    beforeAll(() => {
      bigsby = new Bigsby({
        logging: {
          level: LogLevel.DEBUG,
        },
      });
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    it("Should invoke native logger functions", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockNativeInfo).toHaveBeenCalled();
      expect(mockNativeDebug).toHaveBeenCalled();
    });
  });

  describe("When using a provided logger", () => {
    let bigsby: Bigsby;
    let mockContext: Context;
    let handler: HandlerFunction;
    let mockEvent: APIGatewayProxyEvent;
    let mockLogger: BigsbyLogger;

    beforeAll(() => {
      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
      bigsby = new Bigsby({
        logging: {
          level: LogLevel.DEBUG,
          logger: mockLogger,
        },
      });
      handler = bigsby.createApiHandler(SuccessHandler);
    });

    beforeEach(() => {
      mockEvent = eventV1();
      mockContext = contextV1();
    });

    it("Should invoke custom logger functions", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });
});
