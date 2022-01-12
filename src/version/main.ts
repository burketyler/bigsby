import { ApiHandlerConstructor } from "../api";
import { InjectableMetaTag } from "../types";

export function Version<HandlerClass extends ApiHandlerConstructor>(
  id: string
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(InjectableMetaTag.VERSION_ID, id, classCtor);
  };
}
