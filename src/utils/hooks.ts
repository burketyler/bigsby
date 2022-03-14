import { ResponseBuilder } from "../response";

export async function invokeHookChain<
  HookType extends ((inputs: HookInputs) => Promise<HookResult | void>)[],
  HookInputs extends Record<string, unknown> & {
    prevResponse?: ResponseBuilder;
  },
  HookResult
>(
  hookChain: (HookType | undefined)[],
  inputs: HookInputs
): Promise<HookResult> {
  return resolveHookChain(
    hookChain,
    undefined as unknown as HookResult,
    inputs
  );
}

export async function resolveHookChain<
  HookType extends ((inputs: HookInputs) => Promise<HookResult | void>)[],
  HookInputs extends Record<string, unknown> & {
    prevResponse?: ResponseBuilder;
  },
  HookResult
>(
  hookChainArray: (HookType | undefined)[],
  defaultResult: HookResult,
  inputs: HookInputs
): Promise<HookResult> {
  let prevResponse: HookResult | void | undefined;

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const chain of hookChainArray) {
    if (chain) {
      for (const hook of chain) {
        const response = await hook({
          ...inputs,
          prevResponse: new ResponseBuilder(prevResponse),
        });

        if (response) {
          prevResponse = response;
        }
      }
    }
  }
  /* eslint-enable no-restricted-syntax, no-await-in-loop */

  return prevResponse ?? defaultResult;
}
