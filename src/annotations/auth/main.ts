import { META_AUTH_METHOD } from "../../constants";
import { ApiHandlerConstructor, AuthMethod } from "../api-handler";

export function Auth<HandlerClass extends ApiHandlerConstructor>(
  authMethod: AuthMethod
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(META_AUTH_METHOD, authMethod, classCtor);
  };
}
