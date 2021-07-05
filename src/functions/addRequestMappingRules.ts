import { META_REQUEST_MAPPING } from "../domain/constants";
import { RequestMappingRule } from "../domain/models/requestMappingRule";

export default function addRequestMappingRules(
  targetClass: any,
  paramName: string,
  rule: RequestMappingRule
) {
  const rules = getRulesOnTargetClass(targetClass, paramName);
  rules.push(rule);
  setRulesOnTargetClass(targetClass, paramName, rules);
}

function getRulesOnTargetClass(
  targetClass: any,
  paramName: string
): RequestMappingRule[] {
  return (
    Reflect.getOwnMetadata(
      META_REQUEST_MAPPING,
      targetClass.constructor,
      paramName
    ) ?? []
  );
}

function setRulesOnTargetClass(
  targetClass: any,
  paramName: string,
  rules: RequestMappingRule[]
): void {
  Reflect.defineMetadata(
    META_REQUEST_MAPPING,
    rules,
    targetClass.constructor,
    paramName
  );
}
