import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";
import { fail } from "ts-injection";

import { createHandler } from "../../src/api";
import * as Api from "../../src/api/utils";
import { defaultConfig } from "../../src/config";
import * as Response from "../../src/response";
import { testAwsData } from "../__data__/test-aws-data";
import { SuccessHandler } from "../__utils__/handlers";

const { HTTP_STATUS_OK } = constants;

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Lifecycle tests", () => {
  let handler: HandlerFunction;
  let mockAuth: jest.Mock;
  let mockEvent: APIGatewayProxyEvent;
  let mockContext: Context;
  let mockOnInit: jest.Mock;
  let mockPreInvoke: jest.Mock;
  let mockPreAuth: jest.Mock;
  let mockPreValidate: jest.Mock;
  let mockPreParse: jest.Mock;
  let mockPreExecute: jest.Mock;
  let mockPreResponse: jest.Mock;
  let mockOnError: jest.Mock;
  let mockOnAuthFail: jest.Mock;
  let mockOnRequestInvalid: jest.Mock;
  let mockOnResponseInvalid: jest.Mock;
  let mockValidateRequest: jest.Mock;
  let mockValidateResponse: jest.Mock;

  beforeAll(() => {
    mockOnInit = jest.fn();
    mockAuth = jest.fn();
    mockPreInvoke = jest.fn();
    mockPreAuth = jest.fn();
    mockPreValidate = jest.fn();
    mockPreParse = jest.fn();
    mockPreExecute = jest.fn();
    mockPreResponse = jest.fn();
    mockOnError = jest.fn();
    mockOnAuthFail = jest.fn();
    mockOnRequestInvalid = jest.fn();
    mockOnResponseInvalid = jest.fn();
    mockValidateRequest = jest.fn();
    mockValidateResponse = jest.fn();
    handler = createHandler(SuccessHandler, {
      api: {
        request: {
          auth: mockAuth,
          schema: { body: { validate: mockValidateRequest } } as any,
        },
        response: {
          schema: {
            [HTTP_STATUS_OK]: { validate: mockValidateResponse } as any,
          },
        },
        lifecycle: {
          onInit: mockOnInit,
          preInvoke: mockPreInvoke,
          preAuth: mockPreAuth,
          preValidate: mockPreValidate,
          preParse: mockPreParse,
          preExecute: mockPreExecute,
          preResponse: mockPreResponse,
          onError: mockOnError,
          onAuthFail: mockOnAuthFail,
          onRequestInvalid: mockOnRequestInvalid,
          onResponseInvalid: mockOnResponseInvalid,
        },
      },
    });
  });

  beforeEach(() => {
    mockEvent = eventV1();
    mockContext = contextV1();
    mockValidateRequest.mockReturnValue({ error: undefined });
    mockValidateResponse.mockReturnValue({ error: undefined });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("When first initialized", () => {
    beforeAll(async () => {
      await Promise.all([
        handler(mockEvent, mockContext, () => {}),
        handler(mockEvent, mockContext, () => {}),
      ]);
    });

    it("Should call onInit only in first invoke, and as the first hook and with the corret input", () => {
      expect(mockOnInit).toHaveBeenCalledWith();
      expect(mockOnInit.mock.invocationCallOrder[0]).toEqual(1);
      expect(mockOnInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("When handler invoked", () => {
    it("Should call each lifecycle stage in order", async () => {
      await handler(mockEvent, mockContext, () => {});

      const mockPreInvokeOrder = mockPreInvoke.mock.invocationCallOrder[0];
      const mockPreAuthOrder = mockPreAuth.mock.invocationCallOrder[0];
      const mockAuthOrder = mockAuth.mock.invocationCallOrder[0];
      const mockPreParseOrder = mockPreParse.mock.invocationCallOrder[0];
      const mockPreValidateOrder = mockPreValidate.mock.invocationCallOrder[0];
      const mockValReqOrder = mockValidateRequest.mock.invocationCallOrder[0];
      const mockPreExecuteOrder = mockPreExecute.mock.invocationCallOrder[0];
      const mockValResOrder = mockValidateResponse.mock.invocationCallOrder[0];
      const mockPreResponseOrder = mockPreResponse.mock.invocationCallOrder[0];

      expect(mockPreInvokeOrder).toBeLessThan(mockPreAuthOrder);
      expect(mockPreAuthOrder).toBeLessThan(mockAuthOrder);
      expect(mockAuthOrder).toBeLessThan(mockPreValidateOrder);
      expect(mockPreValidateOrder).toBeLessThan(mockValReqOrder);
      expect(mockValReqOrder).toBeLessThan(mockPreParseOrder);
      expect(mockPreParseOrder).toBeLessThan(mockPreExecuteOrder);
      expect(mockPreExecuteOrder).toBeLessThan(mockValResOrder);
      expect(mockValResOrder).toBeLessThan(mockPreResponseOrder);
      expect(mockPreResponseOrder).toBeGreaterThan(mockPreExecuteOrder);
    });

    it("Should call each lifecycle stage once", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockPreInvoke).toHaveBeenCalledTimes(1);
      expect(mockPreAuth).toHaveBeenCalledTimes(1);
      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockPreValidate).toHaveBeenCalledTimes(1);
      expect(mockValidateRequest).toHaveBeenCalledTimes(1);
      expect(mockPreParse).toHaveBeenCalledTimes(1);
      expect(mockPreExecute).toHaveBeenCalledTimes(1);
      expect(mockValidateResponse).toHaveBeenCalledTimes(1);
      expect(mockPreResponse).toHaveBeenCalledTimes(1);
    });

    it("Should call each lifecycle stage with correct inputs", async () => {
      await handler(mockEvent, mockContext, () => {});

      const mockRestContext = {
        event: Api.standardizeEvent(mockEvent),
        context: mockContext,
        config: defaultConfig,
      };

      expect(mockPreInvoke).toHaveBeenCalledWith(mockEvent, mockContext);
      expect(mockPreAuth).toHaveBeenCalledWith(mockRestContext);
      expect(mockAuth).toHaveBeenCalledWith(mockRestContext);
      expect(mockPreValidate).toHaveBeenCalledWith(mockRestContext);
      expect(mockValidateRequest).toHaveBeenCalledWith(mockEvent.body);
      expect(mockPreParse).toHaveBeenCalledWith(mockRestContext);
      expect(mockPreExecute).toHaveBeenCalledWith(mockRestContext);
      expect(mockValidateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(Object),
          statusCode: HTTP_STATUS_OK,
        })
      );
      expect(mockPreResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(Object),
          statusCode: HTTP_STATUS_OK,
        }),
        mockRestContext
      );
    });
  });

  describe("When a handled error of an unknown type is returned as part of the lifecycle", () => {
    let transformResponseSpy: jest.SpyInstance;
    let mockError: Error;

    beforeAll(() => {
      mockError = new Error("UnknownError");
      transformResponseSpy = jest.spyOn(Response, "transformResponse");
    });

    beforeEach(() => {
      transformResponseSpy.mockReturnValueOnce(fail(mockError));
    });

    it("Should call the onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("When an unhandled error occurs as part of the lifecycle", () => {
    let mockHookError: Error;

    beforeAll(() => {
      mockHookError = new Error("HookError");
    });

    beforeEach(() => {
      mockPreInvoke.mockImplementationOnce(() => {
        throw mockHookError;
      });
    });

    it("Should call the onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnError).toHaveBeenCalledWith(mockHookError);
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });

  describe("When auth method fails", () => {
    let mockAuthError: Error;

    beforeAll(() => {
      mockAuthError = new Error("AuthError");
    });

    beforeEach(() => {
      mockAuth.mockImplementationOnce(() => {
        throw mockAuthError;
      });
    });

    it("Should call the onAuthFail and onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnAuthFail).toHaveBeenCalledWith(mockAuthError);
      expect(mockOnError).toHaveBeenCalledWith(mockAuthError);
    });
  });

  describe("When request validation fails", () => {
    let mockValidateError: Error;

    beforeAll(() => {
      mockValidateError = new Error("ValidationError");
    });

    beforeEach(() => {
      mockValidateRequest.mockReturnValueOnce({
        error: mockValidateError,
      });
    });

    it("Should call the onRequestInvalid and onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnRequestInvalid).toHaveBeenCalledWith(mockValidateError);
      expect(mockOnRequestInvalid).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(mockValidateError);
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });

  describe("When response validation fails", () => {
    let mockValidateError: Error;

    beforeAll(() => {
      mockValidateError = new Error("ValidationError");
    });

    beforeEach(() => {
      mockValidateResponse.mockReturnValueOnce({
        error: mockValidateError,
      });
    });

    it("Should call the onResponseInvalid and onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnResponseInvalid).toHaveBeenCalledWith(mockValidateError);
      expect(mockOnResponseInvalid).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(mockValidateError);
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });
});
