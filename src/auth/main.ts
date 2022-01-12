import { ApiHandlerConstructor, AuthMethod } from "../api";
import { InjectableMetaTag } from "../types";

export function Auth<HandlerClass extends ApiHandlerConstructor>(
  authMethod: AuthMethod
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(
      InjectableMetaTag.AUTH_METHOD,
      authMethod,
      classCtor
    );
  };
}
