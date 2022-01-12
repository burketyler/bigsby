import { InferredType, ParameterInstructionTarget } from "./enums";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ParameterInstruction {
  paramIndex: number;
  mapsTo: ParameterInstructionTarget;
  searchKey: string;
  type?: InferredType;
}
