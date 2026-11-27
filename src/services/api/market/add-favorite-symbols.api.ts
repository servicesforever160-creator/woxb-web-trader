import { ENDPOINTS, post } from "../core";
import { terminalRequest } from "../core/terminal-request";

export function addFavoriteSymbols(symbols: string[], signal?: AbortSignal) {
  return terminalRequest<string[]>(
    (config) => post(ENDPOINTS.SYMBOLS.FAVORITES, { symbols }, config),
    "Unable to add favorite symbols.",
    signal,
  );
}
