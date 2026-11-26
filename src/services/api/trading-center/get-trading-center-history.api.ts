import { isAxiosError } from "axios";
import { ENDPOINTS, get } from "../core";
import {
    BackendError,
    BackendResponse,
    errorResponse,
    successResponse,
} from "../core/response";
import type { Candle } from "@/src/types/market";

export type MarketHistoryResponse = Candle[];

export const getMarketHistory = async (
    symbol: string,
    interval = "5min",
    outputSize = "100",
) => {
    try {
        if (typeof window === "undefined" || !sessionStorage.getItem("accessToken")) {
            return errorResponse({ message: "Start a WebTrader session to view market history." });
        }

        const params = new URLSearchParams({
            symbol,
            interval,
            outputSize,
        });

        const response = await get<
            BackendResponse<MarketHistoryResponse>
        >(
            `${ENDPOINTS.TRADING_CENTER.HISTORY}?${params.toString()}`,
            {
                skipAuthRefresh: true,
                fingerprintLogout: true,
            },
        );

        if (response.status === false) return errorResponse({ message: response.message });
        if (!Array.isArray(response.data)) return errorResponse({ message: "The market history response is incomplete." });
        return successResponse(response);
    } catch (error: unknown) {
        if (isAxiosError<BackendError>(error)) {
            return errorResponse({
                message: error.response?.data?.message ?? "Unable to load market history.",
            });
        }

        return errorResponse({
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong.",
        });
    }
};
