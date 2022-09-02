import { fail, success, Throwable } from "ts-injection";

import {
  ApiHandlerConstructor,
  AuthenticationError,
  Authenticator,
  AuthMethod,
  BigsbyError,
  InjectableMetadata,
  RequestContext,
} from "../types";

export function Auth<HandlerClass extends ApiHandlerConstructor>(
  method: Authenticator | string
) {
  return Authentication<HandlerClass>(method);
}

export function Authentication<HandlerClass extends ApiHandlerConstructor>(
  method: Authenticator | string
) {
  return (classCtor: HandlerClass): void => {
    Reflect.defineMetadata(InjectableMetadata.AUTH_METHOD, method, classCtor);
  };
}

export async function authenticate(
  context: RequestContext
): Promise<Throwable<AuthenticationError | BigsbyError, void>> {
  const { logger } = context.bigsby;

  logger.debug("Auth method provided, authenticating request.");

  try {
    const authMethod = context.config.request.auth as AuthMethod;

    if (typeof authMethod === "string") {
      const authenticator = context.bigsby.getAuthMethod(authMethod);

      if (authenticator.isError()) {
        return fail(authenticator.value());
      }

      await authenticator.value()(context);
    } else {
      await authMethod?.(context);
    }

    return success(undefined);
  } catch (error) {
    logger.error(error, "Authentication failed.");

    return fail(new AuthenticationError(error));
  }
}
