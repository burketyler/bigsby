import { LambdaLogger } from "../domain/models/lambdaLogger";
import { useInjectionContext } from "ts-injection";
import { InjectableType } from "../domain/enums/injectableType";

export function getLogger(): LambdaLogger | undefined {
  const { injectionCtx } = useInjectionContext();
  return injectionCtx.queryByType(InjectableType.LOGGER)?.[0];
}
