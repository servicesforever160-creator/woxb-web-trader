import { getMarketHistory } from "@/src/services/api/trading-center/get-trading-center-history.api";
import type { Candle } from "@/src/types/market";

const HISTORY_UTC_OFFSET = process.env.NEXT_PUBLIC_MARKET_HISTORY_UTC_OFFSET || "Z";
const DATE_WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

function normalizeCandleDate(date: string) {
  if (typeof date !== "string") return "";

  const isoDate = date.trim().replace(" ", "T");
  const zonedDate = DATE_WITHOUT_OFFSET.test(isoDate)
    ? `${isoDate}${HISTORY_UTC_OFFSET}`
    : isoDate;
  const timestamp = Date.parse(zonedDate);

  if (!Number.isFinite(timestamp)) return "";

  return new Date(timestamp).toISOString();
}

export async function fetchMarketHistory(
  symbol: string,
  interval: string,
  to: number | undefined,
  signal: AbortSignal,
): Promise<Candle[]> {
  const response = await getMarketHistory(symbol, interval, 200, to, signal);

  if (!response.success) {
    throw new Error(response.message);
  }

  const candlesByDate = new Map<string, Candle>();

  for (const candle of response.data) {
    if (!candle) continue;

    const { open, high, low, close, volume } = candle;
    const date = normalizeCandleDate(candle.date);
    if (!date || ![open, high, low, close, volume].every(Number.isFinite)) continue;

    candlesByDate.set(date, { date, open, high, low, close, volume });
  }

  return [...candlesByDate.values()].sort((first, second) => first.date.localeCompare(second.date));
}
