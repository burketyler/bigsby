import { BigsbyConfig } from "../domain/models/bigsbyConfig";
import merge from "lodash.merge";
import { defaultConfig } from "../domain/defaultConfig";

class BigsbyInstance {
  private config: BigsbyConfig;

  constructor() {
    this.config = defaultConfig;
  }

  public setConfig(config: BigsbyConfig): void {
    this.config = merge(defaultConfig, config);
  }

  public getConfig(): BigsbyConfig {
    return this.config;
  }
}

export const Bigsby = new BigsbyInstance();
