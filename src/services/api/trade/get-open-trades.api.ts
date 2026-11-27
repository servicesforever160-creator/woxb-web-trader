import { ENDPOINTS, get } from "../core";
import { tradeRequest } from "./trade-request";
import type { TradePage } from "./trade.types";

export function getOpenTrades(page = 1, limit = 10, signal?: AbortSignal) {
  return tradeRequest<TradePage>(
    (config) => get(ENDPOINTS.TRADE.OPEN_MY_ACCOUNT, { ...config, params: { page, limit } }),
    signal,
  );
}
