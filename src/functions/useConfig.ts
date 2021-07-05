import * as fs from "fs";
import * as path from "path";
import { TsLambdaConfig } from "../domain/models/tsLambdaConfig";

let config: TsLambdaConfig;

export function useConfig(): TsLambdaConfig {
  if (!config) {
    config = getConfig() ?? {};
  }
  return config;
}

function getConfig(): TsLambdaConfig | undefined {
  const appDir = fs.realpathSync(process.cwd());
  const configPath = path.join(appDir, "config.js");
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }
}
