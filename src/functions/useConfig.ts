import * as fs from "fs";
import * as path from "path";
import { BigsbyConfig } from "../domain/models/bigsbyConfig";

let config: BigsbyConfig;

export function useConfig(): BigsbyConfig {
  if (!config) {
    config = getConfig() ?? {};
  }
  return config;
}

function getConfig(): BigsbyConfig | undefined {
  const appDir = fs.realpathSync(process.cwd());
  const configPath = path.join(appDir, "config.js");
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }
}
