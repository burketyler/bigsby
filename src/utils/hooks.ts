import { ApiResponse, HookInput, HookResult } from "../types";

export async function resolveHookChain<
  HookInputs extends HookInput<Record<string, unknown>>,
  HookType extends ((inputs: HookInputs) => Promise<HookResult>)[]
>(
  inputs: HookInputs,
  ...hookChainArray: (HookType | undefined)[]
): Promise<ApiResponse | undefined> {
  let currentHookResult: HookResult | undefined;

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const chain of hookChainArray) {
    if (chain) {
      for (const hook of chain) {
        const hookResult = await hook({
          ...inputs,
          response: currentHookResult?.response,
        });

        if (hookResult) {
          currentHookResult = hookResult;
        }

        if (hookResult?.immediate) {
          return hookResult.response.build();
        }
      }
    }
  }

  return currentHookResult?.response.build();
}

export async function resolveHookChainDefault<
  HookInputs extends HookInput<Record<string, unknown>>,
  HookType extends ((inputs: HookInputs) => Promise<HookResult>)[]
>(
  inputs: HookInputs,
  defaultResponse: ApiResponse,
  ...hookChains: (HookType | undefined)[]
): Promise<ApiResponse> {
  return (await resolveHookChain(inputs, ...hookChains)) ?? defaultResponse;
}
