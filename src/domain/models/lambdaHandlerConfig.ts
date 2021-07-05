import { ValidationError } from "../errors/validationError";
import { EntitlementsError } from "../errors/entitlementsError";

export type LambdaHandlerConfig = {
  jsonParser?: (rawBody: string | null) => any;
  onUnhandledErr?: (err: Error) => void;
  onValidationErr?: (err: ValidationError) => void;
  onEntitlementsErr?: (err: EntitlementsError) => void;
};
