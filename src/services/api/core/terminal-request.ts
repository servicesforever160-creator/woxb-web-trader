import { isAxiosError, isCancel } from "axios";
import type { AxiosRequestConfig } from "axios";
import { addToast } from "@/src/components/ui/toast";
import { HandleErrorResponse } from "./error";
import { errorResponse, successResponse } from "./response";
import type { BackendError, BackendResponse } from "./response";

export async function terminalRequest<T>(
  request: (config: AxiosRequestConfig) => Promise<BackendResponse<T>>,
  fallback: string,
  signal?: AbortSignal,
) {
  try {
    if (typeof window === "undefined" || !sessionStorage.getItem("accessToken")) {
      return errorResponse({ message: "Start a WebTrader session to continue." });
    }

    const response = await request({ skipAuthRefresh: true, fingerprintLogout: true, signal });
    if (signal?.aborted) return errorResponse({ message: fallback });

    if (response.status !== true) {
      const failure = errorResponse({ response: { data: response } });
      HandleErrorResponse(failure);
      return failure;
    }

    return successResponse(response);
  } catch (error: unknown) {
    if (signal?.aborted || isCancel(error)) return errorResponse({ message: fallback });

    const failure = isAxiosError<BackendError>(error)
      ? errorResponse({ response: error.response, message: fallback })
      : errorResponse({ message: error instanceof Error ? error.message : fallback });

    if (isAxiosError<BackendError>(error) && error.response?.data?.status === false) {
      HandleErrorResponse(failure);
    } else {
      addToast({ title: failure.message, type: "error" });
    }

    return failure;
  }
}
