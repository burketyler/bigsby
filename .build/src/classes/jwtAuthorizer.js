"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthorizer = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const ts_injection_1 = require("ts-injection");
class JwtAuthorizer {
    constructor(config) {
        this.config = config;
        if (config.logger) {
            this.logger = ts_injection_1.resolve(config.logger);
        }
    }
    authorize(context) {
        var _a, _b, _c, _d;
        try {
            const decoded = this.verifyAndExtractJwtPayload(context, this.config);
            (_b = (_a = this.config).verifyDecoded) === null || _b === void 0 ? void 0 : _b.call(_a, decoded);
            const authContext = this.extractAuthContext(decoded);
            const methodArn = this.parseMethodArn(context);
            const policyStatements = this.generatePolicyStatements(methodArn, this.config);
            const result = this.createAuthorizerResult(policyStatements, authContext, this.config);
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.info("User authorized successfully.", result);
            return result;
        }
        catch (err) {
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.error("User authorization failed.", err);
            context.callback("Unauthorized");
            return;
        }
    }
    verifyAndExtractJwtPayload(context, config) {
        return jsonwebtoken_1.verify(context.event.authorizationToken, config.secretOrPublicKey, config.verifyOptions);
    }
    extractAuthContext(payload) {
        if (typeof payload === "string") {
            return {
                payload,
            };
        }
        else {
            return Object.entries(payload).reduce((requestAuthCtx, [key, value]) => {
                if (this.isPrimitive(value)) {
                    requestAuthCtx[key] = value;
                }
                else if (Array.isArray(value)) {
                    requestAuthCtx[key] = value.join(",");
                }
                return requestAuthCtx;
            }, {});
        }
    }
    isPrimitive(value) {
        return (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean");
    }
    parseMethodArn(context) {
        const methodArn = context.event.methodArn;
        const regionAcctIdApiGwIdBlob = methodArn.split("/")[0].split(":");
        const stageMethodUriBlob = methodArn.split(":")[5].split("/");
        const region = regionAcctIdApiGwIdBlob[3];
        const acctId = regionAcctIdApiGwIdBlob[4];
        const apiGwId = regionAcctIdApiGwIdBlob[5];
        const stage = stageMethodUriBlob[1];
        return { region, acctId, apiGwId, stage };
    }
    generatePolicyStatements(parsed, config) {
        if (config.statements) {
            return config.statements.reduce((statements, statement) => {
                var _a, _b, _c;
                statements.push({
                    Action: "execute-api:Invoke",
                    Effect: statement.effect,
                    Resource: `arn:aws:execute-api:${parsed.region}:${parsed.acctId}:${parsed.apiGwId}/${(_a = statement.stage) !== null && _a !== void 0 ? _a : parsed.stage}/${(_b = statement.method) !== null && _b !== void 0 ? _b : "*"}/${(_c = this.removeSlash(statement.path)) !== null && _c !== void 0 ? _c : "*"}`,
                });
                return statements;
            }, []);
        }
        else {
            return [
                {
                    Action: "execute-api:Invoke",
                    Effect: "allow",
                    Resource: `arn:aws:execute-api:${parsed.region}:${parsed.acctId}:${parsed.apiGwId}/${parsed.stage}/*/*`,
                },
            ];
        }
    }
    removeSlash(path) {
        return (path === null || path === void 0 ? void 0 : path.charAt(0)) === "/" ? path.slice(1) : path;
    }
    createAuthorizerResult(policyStatements, requestAuthCtx, config) {
        var _a, _b;
        return {
            principalId: (_b = (_a = requestAuthCtx === null || requestAuthCtx === void 0 ? void 0 : requestAuthCtx[config.principalIdFieldName]) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "Not Provided",
            policyDocument: {
                Version: "2012-10-17",
                Statement: policyStatements,
            },
            context: requestAuthCtx,
        };
    }
}
exports.JwtAuthorizer = JwtAuthorizer;
