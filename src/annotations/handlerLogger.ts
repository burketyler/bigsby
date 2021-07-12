import {
  makeClassInjectable,
  META_TYPE,
  Newable,
  useInjectionContext,
} from "ts-injection";
import { InjectableType } from "../domain/enums/injectableType";

const { injectionCtx } = useInjectionContext();

export function HandlerLogger<T extends Newable>(classCtor: T): void {
  const token = makeClassInjectable(classCtor);
  if (!token) {
    throw new Error(
      "Unable to initialize Logger class, check Injectable logger."
    );
  }
  injectionCtx.addMetadataToItem(token, {
    [META_TYPE]: InjectableType.LOGGER,
  });
}
