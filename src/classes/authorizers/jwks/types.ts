import { AuthorizerBaseConfig } from "../types";

export interface JwksAuthorizerConfig extends AuthorizerBaseConfig {
  issuerUrl: string;
}
