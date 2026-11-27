import { ENDPOINTS, get } from "../core";
import { terminalRequest } from "../core/terminal-request";

export type MarketSymbols = Record<string, string[]>;

export function getMarketSymbols(signal?: AbortSignal) {
  return terminalRequest<MarketSymbols>(
    (config) => get(ENDPOINTS.SYMBOLS.MARKETS, config),
    "Unable to load market symbols.",
    signal,
  );
}
