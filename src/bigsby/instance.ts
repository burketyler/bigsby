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
import { badRequest, internalError } from "../response";
import {
  ApiEvent,
  ApiResponse,
  Authenticator,
  BigsbyError,
  BigsbyPluginRegistration,
  DeepPartial,
  HandlerClassesInput,
  HandlerFunction,
  AuthScheme,
  ApiHandler,
  RawHandlerInvokeFunction,
  RequestContext,
  ApiLifecycle,
  ApiHookNames,
  BigsbyConfig,
  ApiConfig,
} from "../types";
import { resolveHookChain, resolveHookChainDefault } from "../utils";

import {
  defaultConfig,
  ERRORED_HANDLER_INSTANCE,
  LOG_ENV_KEY,
} from "./constants";
import {
  concatArray,
  convertErrorToResponse,
  getHandlerClass,
  mergeAnnotationConfigs,
  mergeParamConfigs,
  runRestApiLifecycle,
} from "./utils";

export class BigsbyInstance {
  public readonly name: string;

  public readonly injectionContainer: InjectionContainer;

  public hasInitialized: boolean;

  public logger: Logger;

  private readonly plugins: BigsbyPluginRegistration[];

  private readonly authMethods: { [methodName: string]: Authenticator };

  private globalConfig: BigsbyConfig;

  constructor(name: string, config?: DeepPartial<BigsbyConfig>) {
    this.name = name;
    this.globalConfig = mergeWith(
      cloneDeep(defaultConfig),
      config,
      concatArray
    );
    this.injectionContainer = new InjectionContainer(name, {
      isManualInit: true,
    });
    this.plugins = [];
    this.authMethods = {};
    this.hasInitialized = false;
    this.logger = new Logger(this.name, LOG_ENV_KEY);
  }

  public getConfig(): BigsbyConfig {
    return cloneDeep(this.globalConfig);
  }

  public setConfig(config: DeepPartial<BigsbyConfig>): BigsbyConfig {
    this.globalConfig = mergeWith(defaultConfig, config, concatArray);

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
      const { plugin } = registration;

      this.logger.debug(`Registering plugin ${plugin.name}.`);

      if (this.plugins.some((reg) => reg.plugin.name === plugin.name)) {
        throw new BigsbyError(`Plugin ${plugin.name} already exists.`);
      }

      this.plugins.push(registration);
    });
  }

  public getPlugins(): BigsbyPluginRegistration[] {
    return this.plugins;
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
      await this.initializePlugins();

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
        .onSuccess<Promise<ApiResponse>>(async (HandlerClass) => {
          config = mergeAnnotationConfigs(HandlerClass, config);

          this.logger.debug("Initializing injection container.");
          this.injectionContainer.initialize();

          const enrichedInvoke = this.wrapInvokeMethod(
            this.logger,
            this.injectionContainer.resolve(HandlerClass) ??
              ERRORED_HANDLER_INSTANCE
          );

          return enrichedInvoke(event, context, config);
        })
        .onError(async (error) => {
          if (error instanceof BigsbyError) {
            throw error;
          }

          return badRequest();
        })
        .output();

      this.logger.debug("Response value.", { response });

      return response;
    };
  }

  public async onApiInit(apiConfig: ApiConfig): Promise<void> {
    if (!this.hasInitialized) {
      await resolveHookChain([apiConfig.lifecycle?.onInit], {
        bigsby: this,
      });
      this.hasInitialized = true;
    }
  }

  private async initializePlugins(): Promise<void> {
    if (this.hasInitialized) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const registration of this.plugins) {
      try {
        await registration.plugin.onRegister(this, registration.options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        this.logger.error(
          `Error initializing plugin ${registration.plugin.name}.`
        );

        throw error;
      }
    }
  }

  private wrapInvokeMethod(
    logger: Logger,
    handlerInstance: ApiHandler
  ): RawHandlerInvokeFunction {
    logger.debug("Wrapping handler invoke method with Bigsby logic.");

    const invoke = handlerInstance[INVOKE_METHOD_NAME];

    return async (
      apiGwEvent: ApiEvent,
      apiGwCtx: Context,
      config: ApiConfig
    ): Promise<ApiResponse> => {
      const event = parseApiGwEvent(apiGwEvent);

      logger.info(
        `Incoming request [${event.version}] [${event.method}] ${event.path}.`
      );

      const context: RequestContext = {
        event,
        config,
        bigsby: this,
        rawEvent: apiGwEvent,
        apiGwContext: apiGwCtx,
      };

      try {
        return await (
          await runRestApiLifecycle(handlerInstance, invoke, context)
        )
          .onSuccess(async (response) => {
            logger.info(`Responding with status [${response.statusCode}].`);

            return response;
          })
          .onError(async (error) =>
            convertErrorToResponse(logger, error, context)
          )
          .output();
      } catch (error) {
        logger.error("Unexpected error during handler invocation.", { error });

        return resolveHookChainDefault(
          [config.lifecycle?.onError],
          internalError(),
          {
            error,
            context,
          }
        );
      }
    };
  }
}
