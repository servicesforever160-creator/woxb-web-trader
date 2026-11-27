import type { AxiosRequestConfig } from "axios";
import type { BackendResponse } from "../core/response";
import { terminalRequest } from "../core/terminal-request";

export async function tradeRequest<T>(
  request: (config: AxiosRequestConfig) => Promise<BackendResponse<T>>,
  signal?: AbortSignal,
) {
  return terminalRequest(request, "The trade request failed.", signal);
}
