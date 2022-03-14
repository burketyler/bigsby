/* eslint-disable no-underscore-dangle, max-classes-per-file */

import { InjectionContainer } from "ts-injection";

import {
  BigsbyPluginRegistration,
  DeepPartial,
  AuthScheme,
  HandlerClassesInput,
  HandlerFunction,
  ApiHandlerConstructor,
  ApiConfig,
  BigsbyConfig,
} from "../types";

import { BigsbyInstance } from "./instance";
import { generateInstanceName } from "./utils";

export class Bigsby {
  public readonly _instance: BigsbyInstance;

  constructor();
  constructor(name: string);
  constructor(config: DeepPartial<BigsbyConfig>);
  constructor(name: string, config: DeepPartial<BigsbyConfig>);
  constructor(
    nameOrConfig?: string | DeepPartial<BigsbyConfig>,
    _config?: DeepPartial<BigsbyConfig>
  ) {
    let name: string;
    let config: DeepPartial<BigsbyConfig> | undefined;

    if (typeof nameOrConfig === "string") {
      name = nameOrConfig;
      config = _config;
    } else {
      name = generateInstanceName();
      config = _config ?? nameOrConfig;
    }

    this._instance = new BigsbyInstance(name, config);
  }

  public getInjectionContainer(): InjectionContainer {
    return this._instance.injectionContainer;
  }

  public getConfig(): BigsbyConfig {
    return this._instance.getConfig();
  }

  public setConfig(config: DeepPartial<BigsbyConfig>): BigsbyConfig {
    return this._instance.setConfig(config);
  }

  public patchConfig(config: DeepPartial<BigsbyConfig>): BigsbyConfig {
    return this._instance.patchConfig(config);
  }

  public registerPlugin(registration: BigsbyPluginRegistration): void;
  public registerPlugin(registration: BigsbyPluginRegistration[]): void;
  public registerPlugin(
    registrationOrRegistrations:
      | BigsbyPluginRegistration
      | BigsbyPluginRegistration[]
  ): void {
    return this._instance.registerPlugin(registrationOrRegistrations);
  }

  public registerAuthScheme(method: AuthScheme): void;
  public registerAuthScheme(methods: AuthScheme[]): void;
  public registerAuthScheme(
    authMethodOrMethods: AuthScheme | AuthScheme[]
  ): void {
    return this._instance.registerAuthMethod(authMethodOrMethods);
  }

  public createApiHandler(
    handlerClass: ApiHandlerConstructor,
    scopedConfig?: DeepPartial<ApiConfig>
  ): HandlerFunction;
  public createApiHandler(
    handlerClasses: ApiHandlerConstructor[],
    scopedConfig?: DeepPartial<ApiConfig>
  ): HandlerFunction;
  public createApiHandler(
    versionedHandlerClassMap: { [VersionId: string]: ApiHandlerConstructor },
    scopedConfig?: DeepPartial<ApiConfig>
  ): HandlerFunction;
  public createApiHandler(
    input: HandlerClassesInput,
    scopedConfig?: DeepPartial<ApiConfig>
  ): HandlerFunction {
    return this._instance.createApiHandler(input, scopedConfig);
  }
}
