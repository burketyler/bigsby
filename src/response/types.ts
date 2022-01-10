import { HttpResponse } from "../annotations/rest-api";

export type ResponseValues = Omit<HttpResponse, "statusCode">;
