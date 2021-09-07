import { LambdaLoggerConstructor } from "../../domain/models/lambdaLogger";
import { JwtPayload, VerifyOptions } from "jsonwebtoken";
import { EffectStatement } from "../../domain/models/effectStatement";

export interface AuthorizerBaseConfig {
  principalIdFieldName: string;
  logger?: LambdaLoggerConstructor;
  verifyOptions?: VerifyOptions;
  verifyDecoded?(payload: JwtPayload | string): void;
  statements?: EffectStatement[];
}
