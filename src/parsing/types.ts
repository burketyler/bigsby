import { RequestContext } from "../types";

export type ParsedEventValue =
  | string
  | number
  | boolean
  | never[]
  | Record<string, unknown>
  | RequestContext
  | undefined
  | null;

export type RawEventValue = string | Record<string, unknown> | undefined | null;
