import { ResponseBuilder } from "../../src/response";
import { BigsbyPlugin } from "../../src/types";

export const mockBigsbyPlugin = {
  mockOnInitExpect: jest.fn(),
  mockContextExpect: jest.fn(),
};

const plugin: BigsbyPlugin = {
  name: "PluginTwo",
  onRegister: async (instance, options) => {
    instance.registerApiHook("onInit", async () => {
      mockBigsbyPlugin.mockOnInitExpect(options?.expect);
    });
    instance.registerApiHook("preInvoke", async ({ context }) => {
      mockBigsbyPlugin.mockContextExpect(context.state.one);
    });
    instance.registerApiHook("preResponse", async ({ response }) => {
      return {
        response: new ResponseBuilder(response)
          .body(options?.expect)
          .statusCode(404),
        action: "TAKEOVER",
      };
    });
  },
};

export default plugin;
