import { ENDPOINTS, post } from "../core";
import { tradeRequest } from "./trade-request";
import type { OpenTradeRequest, Trade } from "./trade.types";

export function openTrade(payload: OpenTradeRequest) {
  return tradeRequest<Trade>((config) => post(ENDPOINTS.TRADE.OPEN, payload, config));
}
