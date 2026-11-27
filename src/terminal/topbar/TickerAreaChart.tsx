import { useEffect, useId, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { Area, AreaChart, YAxis } from "recharts";
import { ChartContainer } from "@/src/components/ui/chart";
import type { ChartConfig } from "@/src/components/ui/chart";
import type { SubscribeToMarketTicks } from "../hooks/useMarketSocket";
import { fetchMarketHistory } from "../utils/fetchMarketHistory";

const POINT_LIMIT = 24;
const FIVE_MINUTES = 300;
const CHART_CONFIG = {
  close: { label: "Close", color: "var(--ticker-price-color)" },
} satisfies ChartConfig;

type PricePoint = { time: number; close: number };

type TickerAreaChartProps = {
  symbol: string;
  subscribeToTicks: SubscribeToMarketTicks;
};

export default function TickerAreaChart({ symbol, subscribeToTicks }: TickerAreaChartProps) {
  const gradientId = useId();
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [historySettled, setHistorySettled] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const hasSeries = historySettled && points.length >= 2;

  useEffect(() => {
    const controller = new AbortController();
    let latestTick = -Infinity;

    const unsubscribe = subscribeToTicks(({ symbol: tickSymbol, timestamp, price }) => {
      if (
        tickSymbol !== symbol
        || typeof timestamp !== "number"
        || !Number.isFinite(timestamp)
        || timestamp < latestTick
      ) return;

      latestTick = timestamp;
      const time = Math.floor(timestamp / FIVE_MINUTES) * FIVE_MINUTES;
      const next = { time, close: price };

      setPoints((current) => {
        const last = current.at(-1);
        if (last && time < last.time) return current;
        if (last?.time === time) {
          return last.close === price ? current : [...current.slice(0, -1), next];
        }
        return [...current.slice(1 - POINT_LIMIT), next];
      });
    });

    fetchMarketHistory(symbol, "5min", undefined, controller.signal, POINT_LIMIT).then(
      (candles) => {
        if (controller.signal.aborted) return;

        setPoints((current) => {
          const byTime = new Map(candles.map(({ date, close }) => {
            const time = Date.parse(date) / 1000;
            return [time, { time, close }];
          }));
          for (const point of current) byTime.set(point.time, point);

          return [...byTime.values()].sort((first, second) => first.time - second.time).slice(-POINT_LIMIT);
        });
        setHistorySettled(true);
      },
      () => {
        // The history request reports its own errors. Live prices can still populate the chart.
        if (!controller.signal.aborted) setHistorySettled(true);
      },
    );

    return () => {
      unsubscribe();
      controller.abort();
    };
  }, [symbol, subscribeToTicks]);

  useEffect(() => {
    if (!hasSeries || reduceMotion) return;

    const animation = animate(0, 1, {
      duration: 0.45,
      ease: "easeOut",
      onUpdate: setProgress,
    });

    return () => animation.stop();
  }, [hasSeries, reduceMotion]);

  if (!hasSeries) {
    return <span className="ticker-trend ticker-trend-flat" aria-hidden="true" />;
  }

  const closes = points.map(({ close }) => close);
  const minimum = Math.min(...closes);
  const maximum = Math.max(...closes);
  const center = minimum + (maximum - minimum) / 2;
  const flatPadding = minimum === maximum ? Math.abs(center) * 0.001 || 1 : 0;
  const morph = reduceMotion ? 1 : progress;
  const chartPoints = morph === 1 ? points : points.map((point) => ({
    ...point,
    close: center + (point.close - center) * morph,
  }));

  return (
    <ChartContainer
      className="ticker-trend pointer-events-none"
      config={CHART_CONFIG}
      initialDimension={{ width: 60, height: 28 }}
      aria-hidden="true"
    >
      <AreaChart
        data={chartPoints}
        margin={{ top: 2, right: 1, bottom: 2, left: 1 }}
        accessibilityLayer={false}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-close)" stopOpacity={0.36} />
            <stop offset="100%" stopColor="var(--color-close)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <YAxis hide allowDataOverflow domain={[minimum - flatPadding, maximum + flatPadding]} />
        <Area
          type="linear"
          dataKey="close"
          stroke="var(--color-close)"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          baseValue={center + (minimum - center) * morph}
          isAnimationActive={false}
          activeDot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
