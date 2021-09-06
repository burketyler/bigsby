"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const constants_1 = require("../domain/constants");
const addRequestMappingRules_1 = tslib_1.__importDefault(require("./addRequestMappingRules"));
const requestMapTarget_1 = require("../domain/enums/requestMapTarget");
describe("Function addRequestMappingRules tests", () => {
    let mockClass;
    let mockRule;
    beforeAll(() => {
        mockRule = {
            paramIndex: 0,
            mapTo: requestMapTarget_1.RequestMapTarget.CONTEXT,
            type: "".constructor,
        };
    });
    beforeEach(() => {
        mockClass = class {
            constructor() { }
        };
    });
    test("When invoked on class with no existing rules, Then rule array is created", () => {
        addRequestMappingRules_1.default(mockClass.constructor, "test", mockRule);
        const extractedRules = extractRules(mockClass.constructor, "test");
        expect(extractedRules).toHaveLength(1);
        expect(extractedRules).toEqual([mockRule]);
    });
    test("When invoked on class with existing rules, Then rule is pushed to array", () => {
        const existingRule = {
            paramIndex: 1,
            mapTo: requestMapTarget_1.RequestMapTarget.BODY,
            type: "".constructor,
        };
        Reflect.defineMetadata(constants_1.META_REQUEST_MAPPING, [existingRule], mockClass.constructor, "test");
        addRequestMappingRules_1.default(mockClass.constructor, "test", mockRule);
        const extractedRules = extractRules(mockClass.constructor, "test");
        expect(extractedRules).toHaveLength(2);
        expect(extractedRules).toEqual([existingRule, mockRule]);
    });
});
function extractRules(target, key) {
    return Reflect.getOwnMetadata(constants_1.META_REQUEST_MAPPING, target.constructor, key);
}
