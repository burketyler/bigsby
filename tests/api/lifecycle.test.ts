import {
  APIGatewayProxyEvent,
  Context,
  Handler as HandlerFunction,
} from "aws-lambda";
import { constants } from "http2";
import { fail } from "ts-injection";

import { BigsbyInstance } from "../../src/bigsby";
import { Bigsby } from "../../src/bigsby/main";
import * as Response from "../../src/response";
import { ResponseBuilder } from "../../src/response";
import { testAwsData } from "../__data__/test-aws-data";
import { SuccessHandler } from "../__utils__/handlers";

const { HTTP_STATUS_OK } = constants;

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

const mockOnInit = [jest.fn(), jest.fn()];
const mockPreInvoke = [jest.fn(), jest.fn()];
const mockPreAuth = [jest.fn(), jest.fn(), jest.fn()];
const mockPreVal = [jest.fn(), jest.fn()];
const mockPreParse = [jest.fn(), jest.fn()];
const mockPreExe = [jest.fn(), jest.fn()];
const mockPreRes = [jest.fn(), jest.fn()];
const mockOnError = [jest.fn(), jest.fn()];
const mockOnAuthFail = [jest.fn(), jest.fn()];
const mockOnRequestInvalid = [jest.fn(), jest.fn()];
const mockOnResponseInvalid = [jest.fn(), jest.fn()];

describe("Lifecycle tests", () => {
  let bigsby: Bigsby;
  let mockAuth: jest.Mock;
  let mockContext: Context;
  let handler: HandlerFunction;
  let mockValidateRequest: jest.Mock;
  let mockValidateResponse: jest.Mock;
  let mockEvent: APIGatewayProxyEvent;

  beforeAll(() => {
    bigsby = new Bigsby();
    mockAuth = jest.fn();
    mockValidateRequest = jest.fn();
    mockValidateResponse = jest.fn();
    handler = bigsby.createApiHandler(SuccessHandler, {
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
        preValidate: mockPreVal,
        preParse: mockPreParse,
        preExecute: mockPreExe,
        preResponse: mockPreRes,
        onError: mockOnError,
        onAuthFail: mockOnAuthFail,
        onRequestInvalid: mockOnRequestInvalid,
        onResponseInvalid: mockOnResponseInvalid,
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

  describe("When function first initialized", () => {
    it("Should call onInit only on first invoke, and as the first hook and with the correct input", async () => {
      await Promise.all([
        handler(mockEvent, mockContext, () => {}),
        handler(mockEvent, mockContext, () => {}),
      ]);

      expect(mockOnInit[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          bigsby: expect.any(BigsbyInstance),
        })
      );
      expect(mockOnInit[0]).toHaveBeenCalledTimes(2);
      expect(mockOnInit[0].mock.invocationCallOrder[0]).toEqual(1);
      expect(mockOnInit[0].mock.invocationCallOrder[1]).toEqual(2);

      expect(mockOnInit[1]).toHaveBeenCalledWith(
        expect.objectContaining({
          bigsby: expect.any(BigsbyInstance),
        })
      );
      expect(mockOnInit[1]).toHaveBeenCalledTimes(2);
      expect(mockOnInit[1].mock.invocationCallOrder[0]).toEqual(3);
      expect(mockOnInit[1].mock.invocationCallOrder[1]).toEqual(4);
    });
  });

  describe("When handler invoked", () => {
    it("Should call each lifecycle stage in order", async () => {
      await handler(mockEvent, mockContext, () => {});

      const mockPreAuth1Order = mockPreAuth[0].mock.invocationCallOrder[0];
      const mockPreAuth2Order = mockPreAuth[1].mock.invocationCallOrder[0];

      const mockAuthOrder = mockAuth.mock.invocationCallOrder[0];

      const mockPreVal1Order = mockPreVal[0].mock.invocationCallOrder[0];
      const mockPreVal2Order = mockPreVal[1].mock.invocationCallOrder[0];

      const mockValReqOrder = mockValidateRequest.mock.invocationCallOrder[0];

      const mockPreParse1Order = mockPreParse[0].mock.invocationCallOrder[0];
      const mockPreParse2Order = mockPreParse[1].mock.invocationCallOrder[0];

      const mockPreExecute1Order = mockPreExe[0].mock.invocationCallOrder[0];
      const mockPreExecute2Order = mockPreExe[1].mock.invocationCallOrder[0];

      const mockValResOrder = mockValidateResponse.mock.invocationCallOrder[0];

      const mockPreResponse1Order = mockPreRes[0].mock.invocationCallOrder[0];
      const mockPreResponse2Order = mockPreRes[1].mock.invocationCallOrder[0];

      expect(mockPreAuth1Order).toBeLessThan(mockPreAuth2Order);
      expect(mockPreAuth2Order).toBeLessThan(mockAuthOrder);

      expect(mockAuthOrder).toBeLessThan(mockPreVal1Order);

      expect(mockPreVal1Order).toBeLessThan(mockPreVal2Order);
      expect(mockPreVal2Order).toBeLessThan(mockValReqOrder);

      expect(mockValReqOrder).toBeLessThan(mockPreParse1Order);

      expect(mockPreParse1Order).toBeLessThan(mockPreParse2Order);
      expect(mockPreParse2Order).toBeLessThan(mockPreExecute1Order);

      expect(mockPreExecute1Order).toBeLessThan(mockPreExecute2Order);
      expect(mockPreExecute2Order).toBeLessThan(mockValResOrder);

      expect(mockValResOrder).toBeLessThan(mockPreResponse1Order);

      expect(mockPreResponse1Order).toBeLessThan(mockPreResponse2Order);
      expect(mockPreResponse2Order).toBeGreaterThan(mockValResOrder);
    });

    it("Should call each lifecycle stage once per hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockPreInvoke[0]).toHaveBeenCalledTimes(1);
      expect(mockPreInvoke[1]).toHaveBeenCalledTimes(1);
      expect(mockPreAuth[0]).toHaveBeenCalledTimes(1);
      expect(mockPreAuth[1]).toHaveBeenCalledTimes(1);
      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockPreVal[0]).toHaveBeenCalledTimes(1);
      expect(mockPreVal[1]).toHaveBeenCalledTimes(1);
      expect(mockValidateRequest).toHaveBeenCalledTimes(1);
      expect(mockPreParse[0]).toHaveBeenCalledTimes(1);
      expect(mockPreParse[1]).toHaveBeenCalledTimes(1);
      expect(mockPreExe[0]).toHaveBeenCalledTimes(1);
      expect(mockPreExe[1]).toHaveBeenCalledTimes(1);
      expect(mockValidateResponse).toHaveBeenCalledTimes(1);
      expect(mockPreRes[0]).toHaveBeenCalledTimes(1);
      expect(mockPreRes[1]).toHaveBeenCalledTimes(1);
    });

    it("Should call each lifecycle stage with correct inputs", async () => {
      await handler(mockEvent, mockContext, () => {});

      const expectedContext = expect.objectContaining({
        rawEvent: expect.any(Object),
        event: expect.any(Object),
        apiGwContext: expect.any(Object),
        config: expect.any(Object),
        bigsby: expect.any(BigsbyInstance),
      });

      expect(mockPreInvoke[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expectedContext,
        })
      );
      expect(mockPreAuth[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expectedContext,
        })
      );
      expect(mockAuth).toHaveBeenCalledWith(expectedContext);
      expect(mockPreVal[0]).toHaveBeenCalledWith(
        expect.objectContaining({ context: expectedContext })
      );
      expect(mockValidateRequest).toHaveBeenCalledWith(mockEvent.body);
      expect(mockPreParse[0]).toHaveBeenCalledWith(
        expect.objectContaining({ context: expectedContext })
      );
      expect(mockPreExe[0]).toHaveBeenCalledWith(
        expect.objectContaining({ context: expectedContext })
      );
      expect(mockValidateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.any(Object),
          statusCode: HTTP_STATUS_OK,
        })
      );
      expect(mockPreRes[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            body: expect.any(Object),
            statusCode: HTTP_STATUS_OK,
          }),
          context: expectedContext,
        })
      );
    });
  });

  describe("When a hook takes over the response", () => {
    it("Should pass prevResponse to each hook in a hook chain", async () => {
      const firstResult = {
        response: new ResponseBuilder("first").statusCode(500),
      };
      const thirdResult = {
        response: new ResponseBuilder("second").statusCode(404),
      };

      mockPreAuth[0].mockResolvedValueOnce(firstResult);
      mockPreAuth[1].mockResolvedValueOnce(undefined);
      mockPreAuth[2].mockResolvedValueOnce(thirdResult);

      const response = await handler(mockEvent, mockContext, () => {});

      expect(mockPreAuth[1]).toHaveBeenCalledWith(
        expect.objectContaining({
          prevResult: new ResponseBuilder(firstResult),
        })
      );
      expect(response).toEqual(
        expect.objectContaining(thirdResult.response.build())
      );
    });

    it("Should return immediately after receiving the immediate command", async () => {
      const firstResult = {
        response: new ResponseBuilder("first").statusCode(500),
        immediate: true,
      };

      mockPreAuth[0].mockResolvedValueOnce(firstResult);

      const response = await handler(mockEvent, mockContext, () => {});

      expect(mockPreAuth[1]).not.toHaveBeenCalled();
      expect(response).toEqual(
        expect.objectContaining(firstResult.response.build())
      );
    });

    it.each([
      ["preInvoke", mockPreInvoke],
      ["preAuth", mockPreAuth],
      ["preValidate", mockPreVal],
      ["preExecute", mockPreExe],
      ["preResponse", mockPreRes],
    ])(
      "Should return the takeover ApiResponse: %s",
      async (name: string, mockHook: jest.Mock[]) => {
        const hookResult = {
          response: new ResponseBuilder(name).statusCode(404),
          immediate: true,
        };

        mockHook[0].mockResolvedValueOnce(hookResult);

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining(hookResult.response.build())
        );
      }
    );
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

      expect(mockOnError[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockError,
          context: expect.objectContaining({
            config: expect.any(Object),
            bigsby: expect.any(BigsbyInstance),
          }),
        })
      );
    });
  });

  describe("When an unhandled error occurs as part of the lifecycle", () => {
    let mockHookError: Error;

    beforeAll(() => {
      mockHookError = new Error("HookError");
    });

    beforeEach(() => {
      mockPreInvoke[0].mockImplementationOnce(() => {
        throw mockHookError;
      });
    });

    it("Should call the onError lifecycle hook", async () => {
      await handler(mockEvent, mockContext, () => {});

      expect(mockOnError[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockHookError,
          context: expect.objectContaining({
            config: expect.any(Object),
            bigsby: expect.any(BigsbyInstance),
          }),
        })
      );
      expect(mockOnError[0]).toHaveBeenCalledTimes(1);
    });

    describe("When a onError hook takes over the response by returning an ApiResponse", () => {
      it("Should return the ApiResponse", async () => {
        const hookResult = {
          response: new ResponseBuilder("onError").statusCode(404),
          immediate: true,
        };

        mockOnError[0].mockResolvedValueOnce(hookResult);

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining(hookResult.response.build())
        );
      });
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

      expect(mockOnAuthFail[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockAuthError,
          context: expect.objectContaining({ config: expect.any(Object) }),
        })
      );
    });

    describe("When a onAuthFail hook takes over the response by returning an ApiResponse", () => {
      it("Should return the ApiResponse", async () => {
        const hookResult = {
          response: new ResponseBuilder("onAuthFail").statusCode(404),
          immediate: true,
        };

        mockOnAuthFail[0].mockResolvedValueOnce(hookResult);

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining(hookResult.response.build())
        );
      });
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

      expect(mockOnRequestInvalid[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockValidateError,
          context: expect.objectContaining({
            config: expect.any(Object),
            bigsby: expect.any(BigsbyInstance),
          }),
        })
      );
      expect(mockOnRequestInvalid[0]).toHaveBeenCalledTimes(1);
    });

    describe("When a onRequestInvalid hook takes over the response by returning an ApiResponse", () => {
      it("Should return the ApiResponse", async () => {
        const hookResult = {
          response: new ResponseBuilder("onRequestInvalid").statusCode(404),
          immediate: true,
        };

        mockOnRequestInvalid[0].mockResolvedValueOnce(hookResult);

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining(hookResult.response.build())
        );
      });
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

      expect(mockOnResponseInvalid[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          error: mockValidateError,
          context: expect.objectContaining({
            config: expect.any(Object),
            bigsby: expect.any(BigsbyInstance),
          }),
        })
      );
      expect(mockOnResponseInvalid[0]).toHaveBeenCalledTimes(1);
    });

    describe("When a onResponseInvalid hook takes over the response by returning an ApiResponse", () => {
      it("Should return the ApiResponse", async () => {
        const hookResult = {
          response: new ResponseBuilder("onResponseInvalid").statusCode(404),
          immediate: true,
        };

        mockOnResponseInvalid[0].mockResolvedValueOnce(hookResult);

        const response = await handler(mockEvent, mockContext, () => {});

        expect(response).toEqual(
          expect.objectContaining(hookResult.response.build())
        );
      });
    });
  });
});
