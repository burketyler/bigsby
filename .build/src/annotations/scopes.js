"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scopes = void 0;
require("reflect-metadata");
const constants_1 = require("../domain/constants");
function Scopes(...scopes) {
    return (classCtor) => {
        Reflect.defineMetadata(constants_1.META_SCOPES, scopes, classCtor);
    };
}
exports.Scopes = Scopes;
