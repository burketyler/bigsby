import { fail, success, Throwable } from "ts-injection";

import { ApiContext } from "../api";
import { useLogger } from "../logger";
import { AuthenticationError } from "../types";

const { logger } = useLogger();

export function authenticate(
  context: ApiContext
): Throwable<AuthenticationError, void> {
  logger.info("Auth method provided, authenticating request.");

  try {
    context.config.api.request.auth?.(context);

    return success(undefined);
  } catch (error) {
    logger.info(error, "Authentication failed.");

    return fail(new AuthenticationError(error));
  }
}
