import { del, ENDPOINTS } from "../core";
import { terminalRequest } from "../core/terminal-request";

export function removeFavoriteSymbols(symbols: string[], signal?: AbortSignal) {
  return terminalRequest<string[]>(
    (config) => del(ENDPOINTS.SYMBOLS.FAVORITES, { ...config, data: { symbols } }),
    "Unable to remove favorite symbols.",
    signal,
  );
}
