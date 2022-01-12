import merge from "lodash.merge";

import { useLogger } from "../logger";
import { DeepPartial } from "../types";

import { defaultConfig } from "./constants";
import { BigsbyConfig } from "./types";

let index = defaultConfig;

export function setConfig(configPatch: DeepPartial<BigsbyConfig>): void {
  index = merge(index, configPatch);
}

export function getConfig(): BigsbyConfig {
  return index;
}

export function mergeConfig(...configs: BigsbyConfig[]): BigsbyConfig {
  const { logger } = useLogger();

  logger.debug({ ...configs }, "Merging configs from right into left.");

  return merge(configs);
}
