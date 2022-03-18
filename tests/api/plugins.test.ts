import { Bigsby } from "../../src/bigsby/main";
import { ResponseBuilder } from "../../src/response";
import { BigsbyPlugin, HandlerFunction } from "../../src/types";
import { testAwsData } from "../__data__/test-aws-data";
import { SuccessHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Plugins tests", () => {
  let bigsby: Bigsby;
  let mockOnInitExpect: jest.Mock;
  let mockContextExpect: jest.Mock;
  let pluginOne: BigsbyPlugin;
  let pluginTwo: BigsbyPlugin;
  let handler: HandlerFunction;

  beforeAll(() => {
    mockOnInitExpect = jest.fn();
    mockContextExpect = jest.fn();
    bigsby = new Bigsby();
    pluginOne = {
      name: "PluginOne",
      onRegister: async (instance, options) => {
        instance.registerApiHook("onInit", async () => {
          mockOnInitExpect(options?.expect);
        });
        instance.registerApiHook("preInvoke", async ({ context }) => {
          mockContextExpect(context.one);
          context.one = options?.expect;
        });
      },
    };
    pluginTwo = {
      name: "PluginTwo",
      onRegister: async (instance, options) => {
        instance.registerApiHook("onInit", async () => {
          mockOnInitExpect(options?.expect);
        });
        instance.registerApiHook("preInvoke", async ({ context }) => {
          mockContextExpect(context.one);
        });
        instance.registerApiHook("preResponse", async ({ response }) => {
          return {
            response: new ResponseBuilder(response)
              .body(options?.expect)
              .statusCode(404),
            action: "TAKEOVER"
          };
        });
      },
    };
  });

  beforeAll(() => {
    bigsby.registerPlugin([
      {
        plugin: pluginOne,
        options: { expect: "PluginOne" },
      },
      {
        plugin: pluginTwo,
        options: { expect: "PluginTwo" },
      },
    ]);
    handler = bigsby.createApiHandler(SuccessHandler);
  });

  it("Should register plugins and execute onRegister", async () => {
    const response = await handler(eventV1(), contextV1());

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual("PluginTwo");

    expect(mockOnInitExpect).toHaveBeenCalledWith("PluginOne");
    expect(mockContextExpect).toHaveBeenCalledWith(undefined);

    expect(mockOnInitExpect).toHaveBeenCalledWith("PluginTwo");
    expect(mockContextExpect).toHaveBeenCalledWith("PluginOne");
  });
});
