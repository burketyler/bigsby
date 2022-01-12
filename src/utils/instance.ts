import { BigsbyConfig } from "../config";

let hasInitialized = false;

export function onInit(config: BigsbyConfig): void {
  if (hasInitialized) {
    return;
  }

  config.api?.lifecycle?.onInit?.();
  hasInitialized = true;
}
