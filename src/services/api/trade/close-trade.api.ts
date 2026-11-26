import { ENDPOINTS, post } from "../core";
import { tradeRequest } from "./trade-request";
import type { CloseTradeRequest, Trade } from "./trade.types";

export function closeTrade(payload: CloseTradeRequest) {
  return tradeRequest<Trade>((config) => post(ENDPOINTS.TRADE.CLOSE, payload, config));
}
