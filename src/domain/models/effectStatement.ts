import { HttpMethod } from "aws-sdk/clients/appmesh";

export interface EffectStatement {
  effect: "allow" | "deny";
  method?: HttpMethod;
  stage?: "*" | string;
  path?: "*" | string;
}
