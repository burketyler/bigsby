import { RequestMapTarget } from "../enums/requestMapTarget";

export interface RequestMappingRule {
  paramIndex: number;
  mapTo: RequestMapTarget;
  // eslint-disable-next-line @typescript-eslint/ban-types
  type?: Function;
  searchKey?: string;
}
