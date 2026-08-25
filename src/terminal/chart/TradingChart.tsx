import { useEffect, useRef } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";
import type { Theme } from "../hooks/useTheme";

const CHART_COLORS = {
  dark: { background: "#111118", text: "#8888A0", grid: "rgba(212, 168, 83, 0.18)" },
  light: { background: "#EFEFF4", text: "#6F7080", grid: "rgba(22, 22, 29, 0.12)" },
};

export default function TradingChart({ theme }: { theme: Theme }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    candleSeries.setData([
      {
        time: "2025-06-01",
        open: 100,
        high: 110,
        low: 95,
        close: 105,
      },
      {
        time: "2025-06-02",
        open: 105,
        high: 120,
        low: 100,
        close: 115,
      },
      {
        time: "2025-06-03",
        open: 115,
        high: 125,
        low: 110,
        close: 118,
      },
      {
        time: "2025-06-04",
        open: 118,
        high: 130,
        low: 112,
        close: 122,
      }
      
    ]);

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
    };
  }, [theme]);

  return (
    <div
      ref={chartContainerRef}
      className="trading-chart"
    />
  );
}
