import { ENDPOINTS, get } from "../core";
import { tradeRequest } from "./trade-request";
import type { TradePage } from "./trade.types";

export function getTradeHistory(accountId: string, page = 1, limit = 10, signal?: AbortSignal) {
  return tradeRequest<TradePage>(
    (config) => get(ENDPOINTS.TRADE.HISTORY_BY_ACCOUNT(accountId), { ...config, params: { page, limit } }),
    signal,
  );
}
