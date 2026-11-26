import { useEffect, useRef } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";
import type { CandlestickData, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/src/types/market";
import type { Theme } from "../hooks/useTheme";

const CHART_COLORS = {
  dark: { background: "#111118", text: "#8888A0", grid: "rgba(212, 168, 83, 0.18)" },
  light: { background: "#EFEFF4", text: "#6F7080", grid: "rgba(22, 22, 29, 0.12)" },
};

type TradingChartProps = {
  symbol: string;
  theme: Theme;
  candles?: Candle[];
};

export default function TradingChart({ symbol, theme, candles }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const firstTimeRef = useRef<UTCTimestamp | undefined>(undefined);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    const colors = CHART_COLORS[theme];

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,

      layout: {
        background: {
          color: colors.background,
        },
        textColor: colors.text,
      },

      grid: {
        vertLines: {
          color: colors.grid,
        },
        horzLines: {
          color: colors.grid,
        },
      },

      rightPriceScale: {
        borderColor: colors.grid,
      },

      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
      },
    });

    chartRef.current = chart;
    const precision = symbol.endsWith("/JPY") ? 3 : symbol.startsWith("BTC/") || symbol.startsWith("XAU/") ? 2 : 5;

    seriesRef.current = chart.addSeries(CandlestickSeries, {
      priceFormat: {
        type: "price",
        precision,
        minMove: 10 ** -precision,
      },
    });

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      if (width > 0 && height > 0) {
        chart.resize(width, height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      firstTimeRef.current = undefined;
    };
  }, [symbol, theme]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    const candlesByTime = new Map<UTCTimestamp, CandlestickData<UTCTimestamp>>();

    for (const candle of candles ?? []) {
      const time = Math.floor(Date.parse(candle.date) / 1000) as UTCTimestamp;
      const { open, high, low, close } = candle;

      if (![time, open, high, low, close].every(Number.isFinite)) continue;

      candlesByTime.set(time, { time, open, high, low, close });
    }

    const chartCandles = [...candlesByTime.values()].sort(
      (first, second) => first.time - second.time,
    );

    series.setData(chartCandles);

    const firstTime = chartCandles[0]?.time;
    if (firstTime !== undefined && (firstTimeRef.current === undefined || firstTime < firstTimeRef.current)) {
      chart.timeScale().fitContent();
    }
    firstTimeRef.current = firstTime;
  }, [symbol, theme, candles]);

  return (
    <div
      ref={chartContainerRef}
      className="trading-chart"
    />
  );
}
