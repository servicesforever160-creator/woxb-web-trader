
import "./ChartArea.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Candle, MarketTick } from "@/src/types/market";
import ChartHeader from "./ChartHeader";
import ChartToolbar from "./ChartToolbar";
import TradingChart from "./TradingChart";
import type { Theme } from "../hooks/useTheme";
import { fetchMarketHistory } from "../utils/fetchMarketHistory";
import { useMarketSocket } from "../hooks/useMarketSocket";
import { applyMarketTick, mergeLiveCandles } from "../utils/liveCandles";
import type { LiveCandle } from "../utils/liveCandles";

type ChartHistory = { candles: Candle[] } | { error: string };

export default function ChartArea({
  symbol,
  theme,
}: {
  symbol: string;
  theme: Theme;
}) {
  const [history, setHistory] = useState<ChartHistory>();
  const [liveCandles, setLiveCandles] = useState<LiveCandle[]>([]);

  const onPrice = useCallback((tick: MarketTick) => {
    setLiveCandles((current) => applyMarketTick(current, tick));
  }, []);

  useMarketSocket(symbol, onPrice);

  useEffect(() => {
    let isCurrent = true;

    fetchMarketHistory(symbol).then(
      (candles) => {
        if (isCurrent) setHistory({ candles });
      },
      (error: unknown) => {
        if (!isCurrent) return;

        const message = error instanceof Error
          ? error.message
          : "Unable to load market history.";
        setHistory({ error: message });
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [symbol]);

  const candles = useMemo(() => {
    const historicalCandles = history && "candles" in history ? history.candles : [];
    return mergeLiveCandles(historicalCandles, liveCandles);
  }, [history, liveCandles]);

  const status = candles.length > 0
    ? null
    : !history
    ? "Loading market history…"
    : "error" in history
      ? history.error
      : history.candles.length === 0
        ? "No market history available."
        : null;

  return (
    <div className="chart-container">
      <ChartHeader symbol={symbol} candle={candles?.at(-1)} />

      <div className="chart-body">
        <ChartToolbar />

        <div className="chart-plot">
          <TradingChart symbol={symbol} theme={theme} candles={candles} />
          {status && (
            <div className="chart-status" role="status">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
