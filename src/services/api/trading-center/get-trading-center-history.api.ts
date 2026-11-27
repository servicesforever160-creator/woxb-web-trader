import { ENDPOINTS, get } from "../core";
import { terminalRequest } from "../core/terminal-request";
import type { BackendResponse } from "../core/response";
import type { Candle } from "@/src/types/market";

export type MarketHistoryResponse = Candle[];

export function getMarketHistory(
  symbol: string,
  interval = "5min",
  outputSize: number | string = 200,
  to?: number,
  signal?: AbortSignal,
) {
  return terminalRequest<MarketHistoryResponse>(async (config) => {
    const params = new URLSearchParams({
      symbol: symbol.replaceAll("/", ""),
      interval,
      outputSize: String(outputSize),
    });
    if (to !== undefined) params.set("to", String(to));

    const response = await get<BackendResponse<MarketHistoryResponse>>(
      `${ENDPOINTS.TRADING_CENTER.HISTORY}?${params}`,
      config,
    );
    if (response.status && !Array.isArray(response.data)) {
      throw new Error("The market history response is incomplete.");
    }
    return response;
  }, "Unable to load market history.", signal);
}
