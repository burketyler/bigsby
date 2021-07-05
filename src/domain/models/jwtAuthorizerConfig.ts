import { JwtPayload, Secret, VerifyOptions } from "jsonwebtoken";
import { EffectStatement } from "./effectStatement";
import { LambdaLoggerConstructor } from "./lambdaLogger";

export type JwtAuthorizerConfig = {
  secretOrPublicKey: Secret;
  principalIdFieldName: string;
  logger?: LambdaLoggerConstructor;
  verifyOptions?: VerifyOptions;
  verifyDecoded?(payload: JwtPayload | string): void;
  statements?: EffectStatement[];
};
