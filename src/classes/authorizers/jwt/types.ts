import { Secret } from "jsonwebtoken";
import { AuthorizerBaseConfig } from "../types";

export interface JwtAuthorizerConfig extends AuthorizerBaseConfig {
  secretOrPublicKey: Secret;
}
