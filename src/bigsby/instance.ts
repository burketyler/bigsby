import { Context } from "aws-lambda";
import cloneDeep from "clone-deep";
import mergeWith from "lodash.mergewith";
import {
  fail,
  InjectionContainer,
  Logger,
  success,
  Throwable,
} from "ts-injection";

import { INVOKE_METHOD_NAME } from "../constants";
import { parseApiGwEvent } from "../parsing";
import { internalError, invalidVersion, transformResponse } from "../response";
import {
  ApiConfig,
  ApiEvent,
  ApiHandler,
  ApiHookNames,
  ApiLifecycle,
  ApiResponse,
  Authenticator,
  AuthScheme,
  BigsbyConfig,
  BigsbyError,
  BigsbyPluginRegistration,
  DeepPartial,
  HandlerClassesInput,
  HandlerFunction,
  RawHandlerInvokeFunction,
  RequestContext,
  BigsbyLogger,
  EnvVar,
  InvalidApiVersionError,
  BigsbyPlugin,
  RegisteredPlugin,
} from "../types";
import { resolveHookChain, resolveHookChainDefault } from "../utils";

import {
  DEFAULT_CONFIG,
  ERRORED_HANDLER_INSTANCE,
  TOKEN_REQ_CONTEXT,
} from "./constants";
import {
  concatArray,
  convertErrorToResponse,
  getHandlerClass,
  isBigsbyPlugin,
  mergeAnnotationConfigs,
  mergeParamConfigs,
  runRestApiLifecycle,
} from "./utils";

export class BigsbyInstance {
  public readonly name: string;

  private readonly plugins: RegisteredPlugin[];

  public readonly injectionContainer: InjectionContainer;

  private readonly authMethods: { [methodName: string]: Authenticator };

  public logger: BigsbyLogger;

  public hasInitialized: boolean;

  public hasLoadedPlugins: boolean;

  private globalConfig: BigsbyConfig;

  constructor(name: string, config?: DeepPartial<BigsbyConfig>) {
    this.name = name;
    this.plugins = [];
    this.authMethods = {};
    this.hasInitialized = false;
    this.hasLoadedPlugins = false;
    this.globalConfig = this.createGlobalConfig(config);
    this.logger = this.createLogger(name, this.globalConfig);
    this.injectionContainer = this.createInjectionContext(name);
  }

  public getConfig(): BigsbyConfig {
    return cloneDeep(this.globalConfig);
  }

  public setConfig(config: DeepPartial<BigsbyConfig>): BigsbyConfig {
    this.globalConfig = mergeWith(DEFAULT_CONFIG, config, concatArray);

    return this.getConfig();
  }

  public patchConfig(config: DeepPartial<BigsbyConfig>): BigsbyConfig {
    this.globalConfig = mergeWith(this.globalConfig, config, concatArray);
    return this.getConfig();
  }

  public registerPlugin(
    registrationOrRegistrations:
      | BigsbyPluginRegistration
      | BigsbyPluginRegistration[]
  ): void {
    const plugins = Array.isArray(registrationOrRegistrations)
      ? registrationOrRegistrations
      : [registrationOrRegistrations];

    plugins.forEach((registration) => {
      let plugin: BigsbyPlugin;

      if (typeof registration.plugin === "string") {
        // eslint-disable-next-line global-require,import/no-dynamic-require, @typescript-eslint/no-var-requires
        const { default: module } = require(registration.plugin);

        if (!isBigsbyPlugin(module)) {
          throw new BigsbyError(
            `${registration.plugin} isn't a valid Bigsby plugin.`
          );
        }

        plugin = module;
      } else {
        plugin = registration.plugin;
      }

      this.logger.debug(`Registering plugin ${plugin.name}.`);

      if (this.plugins.some(({ plugin: { name } }) => name === plugin.name)) {
        throw new BigsbyError(`Plugin ${plugin.name} already exists.`);
      }

      this.plugins.push({ plugin, options: registration.options });
    });
  }

  public registerApiHook<
    HookName extends ApiHookNames,
    HookImplType extends ApiLifecycle[HookName][0]
  >(name: HookName, implementation: HookImplType): void {
    this.patchConfig({
      api: {
        lifecycle: {
          [name]: [implementation],
        },
      },
    });
  }

  public registerAuthMethod(
    authMethodOrMethods: AuthScheme | AuthScheme[]
  ): void {
    const methods = Array.isArray(authMethodOrMethods)
      ? authMethodOrMethods
      : [authMethodOrMethods];

    methods.forEach(({ name, authenticator }) => {
      this.logger.debug(`Registering auth method ${name}.`);

      if (this.authMethods[name]) {
        throw new BigsbyError(`Auth method ${name} already exists.`);
      }

      this.authMethods[name] = authenticator;
    });
  }

  public getAuthMethod(
    methodName: string
  ): Throwable<BigsbyError, Authenticator> {
    if (!this.authMethods[methodName]) {
      return fail(new BigsbyError(`Auth method ${methodName} doesn't exist.`));
    }

    return success(this.authMethods[methodName]);
  }

  public createApiHandler(
    classes: HandlerClassesInput,
    scopedConfig?: DeepPartial<ApiConfig>
  ): HandlerFunction {
    return async (event: ApiEvent, context: Context): Promise<ApiResponse> => {
      if (!this.hasLoadedPlugins) {
        await this.loadPlugins();
      }

      this.logger.debug("Received API Gateway event.", { event, context });

      let config = mergeParamConfigs(
        this.logger,
        this.globalConfig.api,
        scopedConfig
      );

      const response = await getHandlerClass(
        this.logger,
        classes,
        event,
        config
      )
        .onSuccess<Promise<ApiResponse>>(
          async ({ handler: HandlerClass, apiVersion }) => {
            config = mergeAnnotationConfigs(HandlerClass, config);

            this.logger.debug("Initializing injection container.");
            this.injectionContainer.initialize();

            const enrichedInvoke = this.wrapInvokeMethod(
              this.logger,
              this.injectionContainer.resolve(HandlerClass) ??
                ERRORED_HANDLER_INSTANCE,
              apiVersion
            );

            return enrichedInvoke(event, context, config);
          }
        )
        .onError(async (error) => {
          if (error instanceof InvalidApiVersionError) {
            return invalidVersion(error.message);
          }

          throw error;
        })
        .output();

      this.logger.debug("Sending API Gateway response.", response);

      return response;
    };
  }

  public async invokeOnInitHook(apiConfig: ApiConfig): Promise<void> {
    if (this.hasInitialized) {
      return;
    }

    await resolveHookChain(
      {
        bigsby: this,
      },
      apiConfig.lifecycle?.onInit
    );
    this.hasInitialized = true;
  }

  public getCurrentRequestContext(): RequestContext {
    return this.injectionContainer.resolve(TOKEN_REQ_CONTEXT);
  }

  private createGlobalConfig(
    config: DeepPartial<BigsbyConfig> | undefined
  ): BigsbyConfig {
    return mergeWith(cloneDeep(DEFAULT_CONFIG), config, concatArray);
  }

  private createInjectionContext(name: string) {
    return new InjectionContainer(name, {
      isManualInit: true,
    });
  }

  private createLogger(name: string, { logging }: BigsbyConfig): BigsbyLogger {
    const shouldInjectEnvVar =
      process.env[EnvVar.BIGSBY_LOG] === undefined &&
      logging.enabled &&
      logging.level;

    if (shouldInjectEnvVar) {
      process.env[EnvVar.BIGSBY_LOG] = `${name}=${logging.level}`;
    }

    return new Logger(name, EnvVar.BIGSBY_LOG, logging.logger);
  }

  private async loadPlugins(): Promise<void> {
    this.logger.debug("Loading plugins.");

    // eslint-disable-next-line no-restricted-syntax
    for (const { plugin, options } of this.plugins) {
      try {
        await plugin.onRegister(this, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        this.logger.error(`Error loading plugin ${plugin.name}.`);

        throw error;
      }
    }
  }

  private wrapInvokeMethod(
    logger: BigsbyLogger,
    handlerInstance: ApiHandler,
    apiVersion: string
  ): RawHandlerInvokeFunction {
    logger.debug("Wrapping handler invoke method with Bigsby logic.");

    const invokeMethod = handlerInstance[INVOKE_METHOD_NAME];

    return async (
      apiGwEvent: ApiEvent,
      apiGwCtx: Context,
      config: ApiConfig
    ): Promise<ApiResponse> => {
      const event = parseApiGwEvent(apiGwEvent);

      logger.info(`Incoming request '${event.method} ${event.path}'.`);

      const context: RequestContext = {
        event,
        config,
        apiVersion,
        state: {},
        bigsby: this,
        rawEvent: apiGwEvent,
        apiGwContext: apiGwCtx,
      };

      this.injectionContainer
        .register(context, TOKEN_REQ_CONTEXT)
        .successOrThrow();

      let response: ApiResponse;

      try {
        response = await (
          await runRestApiLifecycle(handlerInstance, invokeMethod, context)
        )
          .onSuccess(async (res) => res)
          .onError((error) => convertErrorToResponse(logger, error, context))
          .output();

        logger.info(`Responding with status code '${response.statusCode}'.`);
        return transformResponse(response, context).successOrThrow();
      } catch (error) {
        logger.error("Unexpected error during handler invocation.", {
          err: error,
        });

        response = await resolveHookChainDefault(
          {
            error,
            context,
          },
          internalError(),
          config.lifecycle?.onError
        );

        logger.info(`Responding with status code '${response.statusCode}'.`);
        return transformResponse(response, context).successOrThrow();
      } finally {
        this.injectionContainer.deRegister(TOKEN_REQ_CONTEXT);
      }
    };
  }
}
