import { LambdaHandler } from "../domain/models/lambdaHandler";
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import {
  HandlerExecuteMethod,
  META_REQUEST_MAPPING,
  RequestMapTarget,
} from "../domain/constants";
import { APIGatewayProxyEventHeaders } from "aws-lambda/trigger/api-gateway-proxy";
import { RawHandlerFn } from "../domain/models/rawHandlerFn";
import { LambdaHandlerConfig } from "../domain/models/lambdaHandlerConfig";
import { PrimitiveType } from "ts-injection";
import { LambdaExecutionContext } from "../domain/models/lambdaExecutionContext";
import { RequestMappingRule } from "../domain/models/requestMappingRule";

export function applyRequestParamMapping(handler: LambdaHandler): void {
  const handlerFn: Function = handler.execute;
  (handler.execute as RawHandlerFn) = async (
    event: APIGatewayProxyEvent,
    context: APIGatewayEventRequestContext,
    config: LambdaHandlerConfig
  ) => {
    const args = getRules(handler)
      ?.sort(sortByParamIndex)
      .reduce((argCollector: any[], rule) => {
        argCollector.push(processRule(rule, { event, context, config }));
        return argCollector;
      }, []);
    return await handlerFn.apply(handler, [config, ...(args ?? [])]);
  };
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
): any {
  const event = context.event;
  switch (rule.mapTo) {
    case RequestMapTarget.CONTEXT:
      return context;
    case RequestMapTarget.BODY:
      return processBodyRule(event, context);
    case RequestMapTarget.PATH:
      return processPathRule(event, rule, context);
    case RequestMapTarget.QUERY:
      return processQueryRule(event, rule, context);
    case RequestMapTarget.HEADER:
      return processHeaderRule(event, rule, context);
    default:
      throw new Error(`Unimplemented request map target: ${rule.mapTo}`);
  }
}

function processPathRule(
  event: APIGatewayProxyEvent,
  rule: RequestMappingRule,
  context: LambdaExecutionContext
): unknown | undefined {
  return parseAsType(
    rule,
    event.pathParameters?.[
      rule.searchKey as keyof APIGatewayProxyEventPathParameters
    ],
    context
  );
}

function processBodyRule(
  event: APIGatewayProxyEvent,
  context: LambdaExecutionContext
): Object | string | null {
  const contentType = getContentType(event.headers);
  switch (contentType) {
    case "application/json":
      return (
        context.config?.jsonParser?.(event.body) ?? JSON.parse(event.body ?? "")
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
  context: LambdaExecutionContext
): unknown | undefined {
  return parseAsType(
    rule,
    event.queryStringParameters?.[
      rule.searchKey as keyof APIGatewayProxyEventQueryStringParameters
    ],
    context
  );
}

function processHeaderRule(
  event: APIGatewayProxyEvent,
  rule: RequestMappingRule,
  context: LambdaExecutionContext
): unknown | string | undefined {
  return parseAsType(
    rule,
    event.headers?.[rule.searchKey as keyof APIGatewayProxyEventHeaders],
    context
  );
}

function parseAsType(
  rule: RequestMappingRule,
  value: string | undefined,
  context: LambdaExecutionContext
): unknown {
  switch (rule.type) {
    case PrimitiveType.NUMBER:
      return Number(value);
    case PrimitiveType.BOOLEAN:
      return value === "true";
    case PrimitiveType.OBJECT:
      return (
        context.config?.jsonParser?.(context.event.body) ??
        JSON.parse(context.event.body ?? "")
      );
    default:
      return value;
  }
}
