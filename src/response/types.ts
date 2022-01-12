import { HttpResponse } from "../api";

export type ResponseValues = Omit<HttpResponse, "statusCode">;
