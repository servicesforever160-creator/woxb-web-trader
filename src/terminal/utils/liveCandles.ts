import type { Candle, MarketTick } from "@/src/types/market";

export type LiveCandle = Candle & { lastTick: number };

export function applyMarketTick(candles: LiveCandle[], tick: MarketTick, intervalSeconds: number): LiveCandle[] {
  const { price, timestamp } = tick;
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || !Number.isFinite(price)) {
    console.log("[Market chart] Skipped tick with invalid price or timestamp", tick);
    return candles;
  }

  const start = Math.floor(timestamp / intervalSeconds) * intervalSeconds;
  const date = new Date(start * 1000);
  if (!Number.isFinite(date.getTime()) || timestamp <= 0) {
    console.log("[Market chart] Skipped tick with invalid candle date", tick);
    return candles;
  }

  const candleDate = date.toISOString();
  const latest = candles.at(-1);
  console.log("[Market chart] Tick bucket", {
    symbol: tick.symbol,
    timestamp,
    candleDate,
    latestLiveDate: latest?.date,
  });

  if (latest && candleDate < latest.date) {
    console.log("[Market chart] Skipped tick older than the latest live candle");
    return candles;
  }

  if (latest?.date === candleDate) {
    console.log("[Market chart] Updating live candle", {
      candleDate,
      previousClose: latest.close,
      price,
      updatesClose: timestamp >= latest.lastTick,
    });

    return [...candles.slice(0, -1), {
      ...latest,
      high: Math.max(latest.high, price),
      low: Math.min(latest.low, price),
      close: timestamp >= latest.lastTick ? price : latest.close,
      lastTick: Math.max(timestamp, latest.lastTick),
    }];
  }

  console.log("[Market chart] Opening live candle", { candleDate, price });

  return [...candles.slice(-99), {
    date: candleDate,
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 0,
    lastTick: timestamp,
  }];
}

export function mergeLiveCandles(history: Candle[], live: LiveCandle[]): Candle[] {
  if (!live.length) return history;

  const candles = [...history];

  for (const candle of live) {
    const latest = candles.at(-1);
    const time = Date.parse(candle.date);
    const latestTime = latest ? Date.parse(latest.date) : -Infinity;
    const mergeCheck = {
      liveDate: candle.date,
      liveClose: candle.close,
      latestDate: latest?.date,
      latestClose: latest?.close,
    };

    if (latest && time === latestTime) {
      console.log("[Market chart] Merged live candle into latest candle", mergeCheck);
      candles[candles.length - 1] = {
        ...latest,
        high: Math.max(latest.high, candle.high),
        low: Math.min(latest.low, candle.low),
        close: candle.close,
      };
    } else if (time > latestTime) {
      console.log("[Market chart] Appended live candle", mergeCheck);
      candles.push(candle);
    } else {
      console.log("[Market chart] Skipped live candle during history merge", mergeCheck);
    }
  }

  return candles;
}
