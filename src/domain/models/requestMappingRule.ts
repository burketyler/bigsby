import { RequestMapTarget } from "../constants";

export interface RequestMappingRule {
  paramIndex: number;
  mapTo: RequestMapTarget;
  type?: Function;
  searchKey?: string;
}
