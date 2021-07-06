"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMapTarget = exports.META_REQUEST_MAPPING = exports.InjectableType = exports.HandlerExecuteMethod = exports.TKN_CONTEXT = exports.TKN_LOGGER = void 0;
exports.TKN_LOGGER = "TOKEN_LOGGER";
exports.TKN_CONTEXT = "TOKEN_CONTEXT";
exports.HandlerExecuteMethod = "execute";
var InjectableType;
(function (InjectableType) {
    InjectableType["LOGGER"] = "LOGGER";
})(InjectableType = exports.InjectableType || (exports.InjectableType = {}));
exports.META_REQUEST_MAPPING = "meta:request-mapping";
var RequestMapTarget;
(function (RequestMapTarget) {
    RequestMapTarget[RequestMapTarget["CONTEXT"] = 0] = "CONTEXT";
    RequestMapTarget[RequestMapTarget["BODY"] = 1] = "BODY";
    RequestMapTarget[RequestMapTarget["PATH"] = 2] = "PATH";
    RequestMapTarget[RequestMapTarget["QUERY"] = 3] = "QUERY";
    RequestMapTarget[RequestMapTarget["HEADER"] = 4] = "HEADER";
})(RequestMapTarget = exports.RequestMapTarget || (exports.RequestMapTarget = {}));
