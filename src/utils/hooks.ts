import { ResponseBuilder } from "../response";
import { ApiResponse, HookInput, HookResult } from "../types";

export async function resolveHookChain<
  HookType extends ((inputs: HookInputs) => Promise<HookResult>)[],
  HookInputs extends HookInput<Record<string, unknown>>
>(
  hookChainArray: (HookType | undefined)[],
  inputs: HookInputs
): Promise<ApiResponse | undefined> {
  let prevHookResult: HookResult | undefined;

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const chain of hookChainArray) {
    if (chain) {
      for (const hook of chain) {
        const hookResult = await hook({
          ...inputs,
          prevResult: prevHookResult
            ? new ResponseBuilder(prevHookResult)
            : undefined,
        });

        if (hookResult?.takeover) {
          return hookResult.response.build();
        }

        prevHookResult = hookResult;
      }
    }
  }

  return prevHookResult?.response.build();
}

export async function resolveHookChainDefault<
  HookType extends ((inputs: HookInputs) => Promise<HookResult>)[],
  HookInputs extends HookInput<Record<string, unknown>>
>(
  hookChains: (HookType | undefined)[],
  defaultResponse: ApiResponse,
  inputs: HookInputs
): Promise<ApiResponse> {
  return (await resolveHookChain(hookChains, inputs)) ?? defaultResponse;
}
