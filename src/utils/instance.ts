import merge from "lodash.merge";

import { defaultConfig } from "../default-config";
import { BigsbyConfig, DeepPartial } from "../types";

let config = defaultConfig;
let hasInitialized = false;

export function setConfig(configPatch: DeepPartial<BigsbyConfig>): void {
  config = merge(config, configPatch);
}

export function getConfig(): BigsbyConfig {
  return config;
}

export function onInit(): void {
  if (hasInitialized) {
    return;
  }

  config.restApi?.lifecycle?.onInit?.();
  hasInitialized = true;
}
