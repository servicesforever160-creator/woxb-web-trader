
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import "./ChartArea.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Candle, MarketTick } from "@/src/types/market";
import ChartHeader from "./ChartHeader";
import ChartControls, { DEFAULT_CHART_SETTINGS } from "./ChartControls";
import type { ChartSettings } from "./ChartControls";
import TradingChart from "./TradingChart";
import type { Theme } from "../hooks/useTheme";
import { fetchMarketHistory } from "../utils/fetchMarketHistory";
import { applyMarketTick, mergeLiveCandles } from "../utils/liveCandles";
import type { LiveCandle } from "../utils/liveCandles";

type ChartHistory = { candles: Candle[] } | { error: string };

const TIMEFRAMES = {
  "1min": { label: "1m", seconds: 60 },
  "5min": { label: "5m", seconds: 300 },
  "15min": { label: "15m", seconds: 900 },
  "30min": { label: "30m", seconds: 1800 },
  "1h": { label: "1h", seconds: 3600 },
};

type Timeframe = keyof typeof TIMEFRAMES;

export default function ChartArea({
  symbol,
  displaySymbol,
  theme,
  subscribeToTicks,
}: {
  symbol: string;
  displaySymbol: string;
  theme: Theme;
  subscribeToTicks: (listener: (tick: MarketTick) => void) => () => void;
}) {
  const [interval, setInterval] = useState<Timeframe>("5min");
  const [settings, setSettings] = useState(DEFAULT_CHART_SETTINGS);

  return (
    <ChartSession
      key={`${symbol}:${interval}`}
      symbol={symbol}
      displaySymbol={displaySymbol}
      theme={theme}
      subscribeToTicks={subscribeToTicks}
      interval={interval}
      onIntervalChange={setInterval}
      settings={settings}
      onSettingsChange={setSettings}
    />
  );
}

function ChartSession({
  symbol,
  displaySymbol,
  theme,
  interval,
  onIntervalChange,
  settings,
  onSettingsChange,
  subscribeToTicks,
}: {
  symbol: string;
  displaySymbol: string;
  theme: Theme;
  interval: Timeframe;
  onIntervalChange: (interval: Timeframe) => void;
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
  subscribeToTicks: (listener: (tick: MarketTick) => void) => () => void;
}) {
  const [history, setHistory] = useState<ChartHistory>();
  const [liveCandles, setLiveCandles] = useState<LiveCandle[]>([]);
  const [pageError, setPageError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  const pagingRef = useRef(false);
  const lastCursorRef = useRef<number | null>(null);
  const intervalSeconds = TIMEFRAMES[interval].seconds;

  useEffect(() => subscribeToTicks((tick) => {
    if (tick.symbol === symbol) {
      setLiveCandles((current) => applyMarketTick(current, tick, intervalSeconds));
    }
  }), [subscribeToTicks, symbol, intervalSeconds]);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;

    fetchMarketHistory(symbol, interval, undefined, controller.signal).then(
      (candles) => {
        if (!controller.signal.aborted) setHistory({ candles });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;

        const message = error instanceof Error
          ? error.message
          : "Unable to load market history.";
        setHistory({ error: message });
      },
    );

    return () => {
      controller.abort();
    };
  }, [symbol, interval]);

  const loadOlder = useCallback(async () => {
    const signal = requestRef.current?.signal;
    const oldest = history && "candles" in history ? history.candles[0] : undefined;

    if (!signal || signal.aborted || !oldest || pagingRef.current) return;

    const cursor = Date.parse(oldest.date);
    if (lastCursorRef.current === cursor) return;

    pagingRef.current = true;
    setPageError("");

    try {
      const page = await fetchMarketHistory(symbol, interval, cursor, signal);
      if (signal.aborted) return;

      // An inclusive cursor can return the oldest candle already on the chart.
      const older = page.filter((candle) => Date.parse(candle.date) < cursor);
      lastCursorRef.current = cursor;

      if (older.length) {
        setHistory((current) => current && "candles" in current
          ? { candles: [...older, ...current.candles] }
          : current);
      }
    } catch (error) {
      if (!signal.aborted) {
        setPageError(error instanceof Error ? error.message : "Unable to load older candles.");
      }
    } finally {
      pagingRef.current = false;
    }
  }, [history, symbol, interval]);

  const candles = useMemo(() => {
    if (!history) return [];

    const historicalCandles = "candles" in history ? history.candles : [];
    return mergeLiveCandles(historicalCandles, liveCandles);
  }, [history, liveCandles]);

  const status = !history
    ? "Loading market history…"
    : "error" in history
      ? history.error
      : candles.length === 0
        ? "No market history available."
        : null;

  return (
    <div className="chart-container">
      <ChartHeader
        symbol={displaySymbol}
        candle={candles.at(-1)}
        controls={<ChartControls settings={settings} onChange={onSettingsChange} />}
        timeframe={
          <Select
            value={interval}
            onValueChange={(value) => {
              if (value !== null) onIntervalChange(value);
            }}
          >
            <SelectTrigger aria-label="Chart timeframe" size="sm" className="chart-timeframe">
              <SelectValue>{TIMEFRAMES[interval].label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIMEFRAMES).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="chart-body">
        <TradingChart symbol={symbol} theme={theme} candles={candles} settings={settings} onLoadOlder={loadOlder}>
          {status && (
            <div className="chart-status" role="status">
              {status}
            </div>
          )}
          {pageError && (
            <Button variant="unstyled"
              type="button"
              className="absolute bottom-8 left-3 z-10 rounded bg-[var(--terminal-card)] p-2 text-xs text-[var(--terminal-text)]"
              onClick={loadOlder}
            >
              {pageError} Retry
            </Button>
          )}
        </TradingChart>
      </div>
    </div>
  );
}
