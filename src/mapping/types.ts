import { ApiContext } from "../api";

export type ParsedEventValue =
  | string
  | number
  | boolean
  | never[]
  | Record<string, unknown>
  | ApiContext
  | undefined
  | null;

export type RawEventValue = string | Record<string, unknown> | undefined | null;
