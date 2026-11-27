import type { ReactNode } from "react";
import type { Candle } from "@/src/types/market";

export default function ChartHeader({
  symbol,
  candle,
  timeframe,
  controls,
}: {
  symbol: string;
  candle?: Candle;
  timeframe: ReactNode;
  controls: ReactNode;
}) {
  return (
    <div className="chart-header">

      <div className="chart-symbol">
        {symbol}
      </div>

      {timeframe}
      {controls}

      {candle && (
        <div className="chart-ohlc">
          O:{candle.open} H:{candle.high} L:{candle.low} C:{candle.close}
        </div>
      )}

    </div>
  );
}
