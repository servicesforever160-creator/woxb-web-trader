import { getMarketHistory } from "@/src/services/api/trading-center/get-trading-center-history.api";
import type { Candle } from "@/src/types/market";
import { getCandleStart } from "./liveCandles";

const HISTORY_UTC_OFFSET = process.env.NEXT_PUBLIC_MARKET_HISTORY_UTC_OFFSET || "+11:00";
const DATE_WITHOUT_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

function normalizeCandleDate(date: string) {
  if (typeof date !== "string") return "";

  const isoDate = date.trim().replace(" ", "T");
  const zonedDate = DATE_WITHOUT_OFFSET.test(isoDate)
    ? `${isoDate}${HISTORY_UTC_OFFSET}`
    : isoDate;
  const timestamp = Date.parse(zonedDate);

  if (!Number.isFinite(timestamp)) return "";

  return new Date(getCandleStart(timestamp / 1000) * 1000).toISOString();
}

export async function fetchMarketHistory(symbol: string): Promise<Candle[]> {
  const response = await getMarketHistory(symbol, "5min", "100");

  if (!response.success) {
    throw new Error(response.message);
  }

  return (response.data ?? [])
    .map((candle) => ({
      ...candle,
      date: normalizeCandleDate(candle.date),
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
    }))
    .filter(({ date, open, high, low, close }) =>
      Boolean(date) && [open, high, low, close].every(Number.isFinite),
    )
    .sort((first, second) => Date.parse(first.date) - Date.parse(second.date));
}
