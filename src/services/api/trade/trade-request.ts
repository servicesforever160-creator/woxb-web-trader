import { isAxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { errorResponse, successResponse } from "../core";
import type { BackendError, BackendResponse } from "../core/response";

export async function tradeRequest<T>(
  request: (config: AxiosRequestConfig) => Promise<BackendResponse<T>>,
) {
  try {
    if (typeof window === "undefined" || !sessionStorage.getItem("accessToken")) {
      return errorResponse({ message: "Start a WebTrader session to access trades." });
    }

    const response = await request({ skipAuthRefresh: true, fingerprintLogout: true });

    if (!response.status) return errorResponse({ message: response.message });

    return successResponse(response);
  } catch (error: unknown) {
    if (isAxiosError<BackendError>(error)) return errorResponse(error);

    return errorResponse({
      message: error instanceof Error ? error.message : "The trade request failed.",
    });
  }
}
