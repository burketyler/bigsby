import { INVOKE_METHOD_NAME } from "../../constants";
import { internalError } from "../../response";

export const ERRORED_HANDLER_INSTANCE = {
  [INVOKE_METHOD_NAME]: async () => internalError(),
};
