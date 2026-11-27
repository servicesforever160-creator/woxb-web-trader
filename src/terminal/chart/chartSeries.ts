import { BarSeries, HistogramSeries, LineSeries } from "lightweight-charts";
import type { CandlestickData, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import type { ChartSettings } from "./ChartControls";

export type ChartCandle = CandlestickData<UTCTimestamp> & { volume: number };

export const CANDLE_COLORS = {
  upColor: "#089981",
  downColor: "#f23645",
  borderVisible: false,
  wickUpColor: "#089981",
  wickDownColor: "#f23645",
};

function movingAverage(candles: ChartCandle[], period: number, exponential = false) {
  const points = [];
  let average = 0;
  let total = 0;
  const weight = 2 / (period + 1);

  for (const [index, { time, close }] of candles.entries()) {
    total += close;
    if (index >= period) total -= candles[index - period].close;
    if (index < period - 1) continue;

    average = exponential && index >= period
      ? average + (close - average) * weight
      : total / period;
    points.push({ time, value: average });
  }

  return points;
}

export function createChartSeries(chart: IChartApi, primary: ISeriesApi<"Candlestick">) {
  const priceFormat = primary.options().priceFormat;
  const bars = chart.addSeries(BarSeries, {
    priceFormat,
    upColor: CANDLE_COLORS.upColor,
    downColor: CANDLE_COLORS.downColor,
    visible: false,
  });
  const line = chart.addSeries(LineSeries, { priceFormat, color: "#2962ff", visible: false });
  const overlay = { priceLineVisible: false, lastValueVisible: false, visible: false } as const;
  const sma = chart.addSeries(LineSeries, { ...overlay, color: "#2962ff", lineWidth: 1 });
  const ema = chart.addSeries(LineSeries, { ...overlay, color: "#ff9800", lineWidth: 1 });
  const custom = chart.addSeries(LineSeries, { ...overlay, color: "#9c27b0", lineWidth: 1 });
  const volume = chart.addSeries(HistogramSeries, {
    ...overlay,
    priceScaleId: "volume",
    priceFormat: { type: "volume" },
  });
  volume.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
  let previousSettings: ChartSettings | undefined;

  return (candles: ChartCandle[], settings: ChartSettings) => {
    const showSma = settings.indicators.includes("sma");
    const showEma = settings.indicators.includes("ema");
    const showVolume = settings.indicators.includes("volume");

    if (previousSettings !== settings) {
      const showCandles = settings.type === "candles";
      const colors = showCandles ? CANDLE_COLORS : {
        upColor: "transparent",
        downColor: "transparent",
        wickUpColor: "transparent",
        wickDownColor: "transparent",
      };
      // Keep the primary series available to drawing tools in every chart mode.
      primary.applyOptions({ ...colors, priceLineVisible: showCandles, lastValueVisible: showCandles });
      bars.applyOptions({ visible: settings.type === "bars" });
      line.applyOptions({ visible: settings.type === "line" });
      sma.applyOptions({ visible: showSma });
      ema.applyOptions({ visible: showEma });
      custom.applyOptions({ visible: settings.customPeriod !== null });
      volume.applyOptions({ visible: showVolume });
      previousSettings = settings;
    }

    if (settings.type === "bars") bars.setData(candles);
    if (settings.type === "line") line.setData(candles.map(({ time, close }) => ({ time, value: close })));
    if (showSma) sma.setData(movingAverage(candles, 20));
    if (showEma) ema.setData(movingAverage(candles, 20, true));
    if (settings.customPeriod !== null) custom.setData(movingAverage(candles, settings.customPeriod));
    if (showVolume) {
      volume.setData(candles.map(({ time, open, close, volume }) => ({
        time,
        value: volume,
        color: close >= open ? "rgba(8, 153, 129, 0.35)" : "rgba(242, 54, 69, 0.35)",
      })));
    }
  };
}
