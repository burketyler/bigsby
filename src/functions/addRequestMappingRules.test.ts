import "reflect-metadata";
import { META_REQUEST_MAPPING } from "../domain/constants";
import addRequestMappingRules from "./addRequestMappingRules";
import { RequestMappingRule } from "../domain/models/requestMappingRule";
import { RequestMapTarget } from "../domain/enums/requestMapTarget";

describe("Function addRequestMappingRules tests", () => {
  let mockClass: any;
  let mockRule: RequestMappingRule;

  beforeAll(() => {
    mockRule = {
      paramIndex: 0,
      mapTo: RequestMapTarget.CONTEXT,
      type: "".constructor,
    };
  });

  beforeEach(() => {
    mockClass = class {
      constructor() {}
    };
  });

  test("When invoked on class with no existing rules, Then rule array is created", () => {
    addRequestMappingRules(mockClass.constructor, "test", mockRule);
    const extractedRules = extractRules(mockClass.constructor, "test");

    expect(extractedRules).toHaveLength(1);
    expect(extractedRules).toEqual([mockRule]);
  });

  test("When invoked on class with existing rules, Then rule is pushed to array", () => {
    const existingRule = {
      paramIndex: 1,
      mapTo: RequestMapTarget.BODY,
      type: "".constructor,
    };
    Reflect.defineMetadata(
      META_REQUEST_MAPPING,
      [existingRule],
      mockClass.constructor,
      "test"
    );
    addRequestMappingRules(mockClass.constructor, "test", mockRule);
    const extractedRules = extractRules(mockClass.constructor, "test");

    expect(extractedRules).toHaveLength(2);
    expect(extractedRules).toEqual([existingRule, mockRule]);
  });
});

function extractRules(target: any, key: string) {
  return Reflect.getOwnMetadata(META_REQUEST_MAPPING, target.constructor, key);
}
