import { ENDPOINTS, get } from "../core";
import { terminalRequest } from "../core/terminal-request";

export function getFavoriteSymbols(signal?: AbortSignal) {
  return terminalRequest<string[]>(
    (config) => get(ENDPOINTS.SYMBOLS.FAVORITES, config),
    "Unable to load favorite symbols.",
    signal,
  );
}
