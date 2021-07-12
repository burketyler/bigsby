import { LambdaHandler } from "../domain/models/lambdaHandler";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import {
  HandlerExecuteMethod,
  META_REQUEST_MAPPING,
} from "../domain/constants";
import { APIGatewayProxyEventHeaders } from "aws-lambda/trigger/api-gateway-proxy";
import { PrimitiveType } from "ts-injection";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { RequestMappingRule } from "../domain/models/requestMappingRule";
import { RequestMapTarget } from "../domain/enums/requestMapTarget";
import { Bigsby } from "../classes/bigsby";
import { LambdaConfig } from "../domain/models/bigsbyConfig";
import merge from "lodash.merge";

export function getArgsForHandlerParams(
  context: LambdaExecutionContext,
  handler: LambdaHandler
): unknown[] {
  return getRules(handler)
    ?.sort(sortByParamIndex)
    .reduce((argCollector: unknown[], rule) => {
      argCollector.push(processRule(rule, context));
      return argCollector;
    }, []);
}

function sortByParamIndex(a: RequestMappingRule, b: RequestMappingRule) {
  return a.paramIndex - b.paramIndex;
}

function getRules(handler: LambdaHandler): RequestMappingRule[] {
  return Reflect.getOwnMetadata(
    META_REQUEST_MAPPING,
    handler.constructor,
    HandlerExecuteMethod
  );
}

function processRule(
  rule: RequestMappingRule,
  context: LambdaExecutionContext
): unknown {
  const event = context.event;
  const config: LambdaConfig = merge(Bigsby.getConfig().lambda, context.config);
  switch (rule.mapTo) {
    case RequestMapTarget.CONTEXT:
      return context;
    case RequestMapTarget.BODY:
      return processBodyRule(event, context);
    case RequestMapTarget.PATH:
      return processPathRule(event, rule, config);
    case RequestMapTarget.QUERY:
      return processQueryRule(event, rule, config);
    case RequestMapTarget.HEADER:
      return processHeaderRule(event, rule, config);
    default:
      throw new Error(`Unimplemented request map target: ${rule.mapTo}`);
  }
}

function processPathRule(
  event: APIGatewayProxyEvent,
  rule: RequestMappingRule,
  config: LambdaConfig
): unknown | undefined {
  return parseAsType(
    rule,
    event.pathParameters?.[
      rule.searchKey as keyof APIGatewayProxyEventPathParameters
    ],
    event.body,
    config
  );
}

function processBodyRule(
  event: APIGatewayProxyEvent,
  context: LambdaExecutionContext
): Record<string, unknown> | string | null {
  const contentType = getContentType(event.headers);
  switch (contentType) {
    case "application/json":
      return (
        context.config?.request?.jsonParser?.(event.body) ??
        JSON.parse(event.body ?? "")
      );
    default:
      return event.body;
  }
}

function getContentType(
  headers: APIGatewayProxyEventHeaders
): unknown | undefined {
  return headers["content-type"] ?? headers["Content-Type"];
}

function processQueryRule(
  event: APIGatewayProxyEvent,
  rule: RequestMappingRule,
  config: LambdaConfig
): unknown | undefined {
  return parseAsType(
    rule,
    event.queryStringParameters?.[
      rule.searchKey as keyof APIGatewayProxyEventQueryStringParameters
    ],
    event.body,
    config
  );
}

function processHeaderRule(
  event: APIGatewayProxyEvent,
  rule: RequestMappingRule,
  config: LambdaConfig
): unknown | string | undefined {
  return parseAsType(
    rule,
    event.headers?.[rule.searchKey as keyof APIGatewayProxyEventHeaders],
    event.body,
    config
  );
}

function parseAsType(
  rule: RequestMappingRule,
  value: string | undefined,
  body: string | null,
  config: LambdaConfig
): number | boolean | Record<string, unknown> | string | undefined {
  if (config.request?.enableInferType) {
    switch (rule.type) {
      case PrimitiveType.NUMBER:
        return Number(value);
      case PrimitiveType.BOOLEAN:
        return value === "true";
      case PrimitiveType.OBJECT:
        return config.request?.jsonParser?.(body) ?? JSON.parse(body ?? "");
      default:
        return value;
    }
  } else {
    return value;
  }
}
