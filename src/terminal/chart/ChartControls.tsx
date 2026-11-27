import { CandlestickChart, LayoutGrid, SquareFunction } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/src/components/ui/select";

const CHART_TYPES = {
  candles: "Candlesticks",
  bars: "OHLC bars",
  line: "Line",
} as const;

const INDICATORS = {
  sma: "SMA (20)",
  ema: "EMA (20)",
  volume: "Volume",
} as const;

export type ChartSettings = {
  type: keyof typeof CHART_TYPES;
  indicators: (keyof typeof INDICATORS)[];
  customPeriod: number | null;
};

export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  type: "candles",
  indicators: [],
  customPeriod: null,
};

export default function ChartControls({ settings, onChange }: {
  settings: ChartSettings;
  onChange: (settings: ChartSettings) => void;
}) {
  const toggleIndicator = (indicator: keyof typeof INDICATORS) => {
    const current = settings.indicators;
    const indicators = current.includes(indicator)
      ? current.filter((item) => item !== indicator)
      : [...current, indicator];
    onChange({ ...settings, indicators });
  };

  return (
    <div className="chart-controls">
      <Select value={settings.type} onValueChange={(type) => {
        if (type) onChange({ ...settings, type });
      }}>
        <SelectTrigger size="sm" className="chart-control-trigger" aria-label={`Chart type: ${CHART_TYPES[settings.type]}`}>
          <CandlestickChart className="size-4" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CHART_TYPES).map(([type, label]) => (
            <SelectItem key={type} value={type}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger render={<Button variant="ghost" size="sm" className="chart-control-trigger" />}>
          <SquareFunction className="size-4" />
          Indicators
        </PopoverTrigger>
        <PopoverContent align="start" className="w-44">
          <PopoverTitle>Indicators</PopoverTitle>
          {Object.entries(INDICATORS).map(([key, label]) => {
            const indicator = key as keyof typeof INDICATORS;
            return (
              <label key={key} className="flex cursor-pointer items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={settings.indicators.includes(indicator)}
                  onChange={() => toggleIndicator(indicator)}
                />
                {label}
              </label>
            );
          })}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger
          aria-label="Custom indicators"
          title="Custom indicators"
          render={<Button variant="ghost" size="icon-xs" className="chart-control-trigger" />}
        >
          <LayoutGrid className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <PopoverTitle>Custom moving average</PopoverTitle>
          <form className="mt-2 grid gap-2" onSubmit={(event) => {
            event.preventDefault();
            const period = Number(new FormData(event.currentTarget).get("period"));
            if (Number.isInteger(period) && period >= 2 && period <= 200) {
              onChange({ ...settings, customPeriod: period });
            }
          }}>
            <label className="grid gap-1">
              Period (candles)
              <input
                name="period"
                type="number"
                min={2}
                max={200}
                required
                defaultValue={settings.customPeriod ?? 50}
                className="rounded border border-input bg-background px-2 py-1"
              />
            </label>
            <Button type="submit" size="xs">Apply</Button>
            {settings.customPeriod !== null && (
              <Button type="button" variant="ghost" size="xs" onClick={() => onChange({ ...settings, customPeriod: null })}>
                Remove SMA ({settings.customPeriod})
              </Button>
            )}
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
