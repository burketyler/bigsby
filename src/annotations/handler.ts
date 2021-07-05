import "reflect-metadata";
import {
  makeClassInjectable,
  Newable,
  useInjectionContext,
} from "ts-injection";
import { LambdaHandler } from "../domain/models/lambdaHandler";
import { wrapWithErrorHandler } from "../functions/wrapWithErrorHandler";
import { enrichResponseHeaders } from "../functions/enrichResponseHeaders";
import { applyRequestParamMapping } from "../functions/applyRequestParamMapping";

const { injectionCtx } = useInjectionContext();

export function Handler<T extends Newable>(classCtor: T) {
  const handler = initializeHandler(classCtor);
  wrapWithErrorHandler(handler);
  applyRequestParamMapping(handler);
  enrichResponseHeaders(handler);
}

function initializeHandler(classCtor: Newable): LambdaHandler {
  const token = makeClassInjectable(classCtor);
  if (!token) {
    throw new Error(
      "Unable to initialize Handler class, check Injectable logger."
    );
  } else {
    return injectionCtx.findItemByToken(token)!.value;
  }
}
