import { Bigsby } from "../../src/bigsby";
import { BigsbyPlugin, HandlerFunction } from "../../src/types";
import { testAwsData } from "../__data__/test-aws-data";
import { mockBigsbyPlugin } from "../__mocks__/mock-plugin";
import { SuccessHandler } from "../__utils__/handlers";

const {
  apiGw: { eventV1, contextV1 },
} = testAwsData;

describe("Plugins tests", () => {
  let bigsby: Bigsby;
  let mockOnInitExpect: jest.Mock;
  let mockContextExpect: jest.Mock;
  let pluginOne: BigsbyPlugin;
  let handler: HandlerFunction;

  beforeAll(() => {
    mockOnInitExpect = jest.fn();
    mockContextExpect = jest.fn();
    bigsby = new Bigsby({ logging: { enabled: false } });
    pluginOne = {
      name: "PluginOne",
      onRegister: async (instance, options) => {
        instance.registerApiHook("onInit", async () => {
          mockOnInitExpect(options?.expect);
        });
        instance.registerApiHook("preInvoke", async ({ context }) => {
          mockContextExpect(context.state.one);
          context.state.one = options?.expect;
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
        plugin: "mock-plugin",
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
    expect(mockBigsbyPlugin.mockOnInitExpect).toHaveBeenCalledWith("PluginTwo");

    expect(mockContextExpect).toHaveBeenCalledWith(undefined);
    expect(mockBigsbyPlugin.mockContextExpect).toHaveBeenCalledWith(
      "PluginOne"
    );
  });
});
