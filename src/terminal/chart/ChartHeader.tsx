import type { Candle } from "@/src/types/market";

export default function ChartHeader({ symbol, candle }: { symbol: string; candle?: Candle }) {
  return (
    <div className="chart-header">

      <div className="chart-symbol">
        {symbol}
      </div>

      <div className="chart-timeframe">
        5m
      </div>

      {candle && (
        <div className="chart-ohlc">
          O:{candle.open} H:{candle.high} L:{candle.low} C:{candle.close}
        </div>
      )}

    </div>
  );
}
