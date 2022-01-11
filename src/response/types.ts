import { HttpResponse } from "../annotations/api-handler";

export type ResponseValues = Omit<HttpResponse, "statusCode">;
