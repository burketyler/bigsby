import { injectable } from "ts-injection";

import { ApiConfig } from "../bigsby";
import {
  ApiHandlerConstructor,
  DeepPartial,
  InjectableMetadata,
  InjectableTag,
} from "../types";

export function Api<HandlerClass extends ApiHandlerConstructor>(
  config?: DeepPartial<ApiConfig>
) {
  return (HandlerClass: HandlerClass): void => {
    Reflect.defineMetadata(InjectableMetadata.API_CONFIG, config, HandlerClass);

    injectable(HandlerClass, {
      tags: [InjectableTag.HANDLER],
    });
  };
}
