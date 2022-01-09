import { InferredType } from "../enums";

export interface ParameterInstruction {
  paramIndex: number;
  mapsTo: ParameterInstructionTarget;
  searchKey: string;
  type?: InferredType;
}

export enum ParameterInstructionTarget {
  CONTEXT = "context",
  BODY = "body",
  PATH = "pathParameters",
  QUERY = "queryStringParameters",
  HEADER = "headers",
}
