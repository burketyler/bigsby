import { ApiResponse } from "../types";

export type ResponseValues = Omit<ApiResponse, "statusCode">;
