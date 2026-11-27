import { Button } from "@/src/components/ui/button";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { CandlestickSeries, createChart, CrosshairMode, MismatchDirection } from "lightweight-charts";
import type { CandlestickData, IChartApi, ISeriesApi, LogicalRange, Time, UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/src/types/market";
import type { Theme } from "../hooks/useTheme";
import ChartToolbar from "./ChartToolbar";
import type { ToolbarAction } from "./ChartToolbar";
import {
  createDrawingLayer,
  DRAWING_POINTS,
  moveDrawingAnchor,
  projectDrawingPoint,
} from "./tools/chartDrawings";
import type { ChartDrawing, DrawingPoint, DrawingTool } from "./tools/chartDrawings";
import type { ChartSettings } from "./ChartControls";
import { CANDLE_COLORS, createChartSeries } from "./chartSeries";
import type { ChartCandle } from "./chartSeries";

function isCandlestick(bar: { time: Time }): bar is CandlestickData {
  return "open" in bar;
}

type TradingChartProps = {
  symbol: string;
  theme: Theme;
  candles: Candle[];
  settings: ChartSettings;
  onLoadOlder: () => void;
  children: ReactNode;
};

export default function TradingChart({ symbol, theme, candles, settings, onLoadOlder, children }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const updateChartSeries = useRef<ReturnType<typeof createChartSeries> | null>(null);
  const firstTimeRef = useRef<UTCTimestamp | undefined>(undefined);
  const updatingDataRef = useRef(false);
  const renderDrawingsRef = useRef<ReturnType<typeof createDrawingLayer> | null>(null);
  const nextDrawingId = useRef(0);
  const brushRef = useRef<DrawingPoint[]>([]);
  const [tool, setTool] = useState<DrawingTool | "Cross">("Cross");
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [draft, setDraft] = useState<DrawingPoint[]>([]);
  const [previewPoint, setPreviewPoint] = useState<DrawingPoint | null>(null);
  const [measurement, setMeasurement] = useState<ChartDrawing | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<{ id: number; index: number } | null>(null);
  const anchorDragRef = useRef<{ id: number; index: number; original: DrawingPoint } | null>(null);
  const [magnet, setMagnet] = useState(true);
  const [keepDrawing, setKeepDrawing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showObjects, setShowObjects] = useState(false);

  const checkHistory = useEffectEvent((range: LogicalRange | null) => {
    if (!range || updatingDataRef.current) return;

    const bars = seriesRef.current?.barsInLogicalRange(range);
    if (bars && bars.barsBefore < 25) onLoadOlder();
  });

  const addDrawing = (drawingTool: DrawingTool, points: DrawingPoint[], text?: string) => {
    const id = nextDrawingId.current++;
    const drawing = { id, tool: drawingTool, points, text };
    if (drawingTool === "Measure") {
      setMeasurement(drawing);
    } else {
      setDrawings((current) => [...current, drawing]);
    }
    setDraft([]);
    setPreviewPoint(null);
    if (!keepDrawing) setTool("Cross");
  };

  const selectTool = (action: ToolbarAction) => {
    switch (action) {
      case "Zoom In": {
        const scale = chartRef.current?.timeScale();
        const range = scale?.getVisibleLogicalRange();
        if (!scale || !range) return;

        const inset = (range.to - range.from) * 0.15;
        if (range.to - range.from > 5) {
          scale.setVisibleLogicalRange({ from: range.from + inset, to: range.to - inset });
        }
        return;
      }
      case "Magnet Mode":
        setMagnet((current) => !current);
        return;
      case "Keep drawing":
        setKeepDrawing((current) => !current);
        return;
      case "Lock all drawings":
        setLocked((current) => !current);
        return;
      case "Hide all drawings":
        setHidden((current) => !current);
        return;
      case "Remove drawings":
        if (!locked) {
          setDrawings([]);
          setDraft([]);
        }
        return;
      case "Show Object Tree":
        setShowObjects((current) => !current);
        return;
      default:
        setDraft([]);
        setPreviewPoint(null);
        setMeasurement(null);
        setActiveAnchor(null);
        setTool(action);
        chartContainerRef.current?.focus({ preventScroll: true });
    }
  };

  const getPoint = (x: number, y: number, snap: boolean) => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return null;

    const scale = chart.timeScale();
    const logical = scale.coordinateToLogical(x);
    if (logical === null) return null;

    const index = Math.round(logical);
    const bar = series.dataByIndex(index, MismatchDirection.NearestLeft)
      ?? series.dataByIndex(index, MismatchDirection.NearestRight);
    if (!bar) return null;

    const { time } = bar;
    const anchor = scale.timeToCoordinate(time);
    const price = series.coordinateToPrice(y);
    if (anchor === null || price === null) return null;

    const barSpacing = scale.options().barSpacing;
    if (snap && Math.abs(x - anchor) <= barSpacing / 2 && isCandlestick(bar)) {
      const prices = [bar.open, bar.high, bar.low, bar.close];
      const nearest = prices.reduce((best, value) =>
        Math.abs(value - price) < Math.abs(best - price) ? value : best,
      );
      const snappedY = series.priceToCoordinate(nearest);
      if (snappedY !== null && Math.abs(snappedY - y) <= 12) {
        return { time, price: nearest, barOffset: 0 };
      }
    }

    return { time, price, barOffset: (x - anchor) / barSpacing };
  };

  const handleChartClick = useEffectEvent((x: number, y: number) => {
    if (tool === "Cross" || tool === "Brush" || tool === "Measure") return;

    const point = getPoint(x, y, magnet);
    if (!point) return;

    if (tool === "Long Position") {
      const chart = chartRef.current;
      if (!chart) return;

      const { width, height } = chart.paneSize();
      const endX = x + width * 0.15;
      const target = getPoint(endX, y - height * 0.16, false);
      const stop = getPoint(endX, y + height * 0.08, false);
      if (target && stop) addDrawing(tool, [point, target, stop]);
      return;
    }

    if (tool === "Text" || tool === "Icon") {
      const text = window.prompt(
        tool === "Text" ? "Chart annotation" : "Choose an icon or emoji",
        tool === "Icon" ? "★" : "",
      );
      if (text?.trim()) addDrawing(tool, [point], text.trim());
      return;
    }

    const points = [...draft, point];
    if (points.length === DRAWING_POINTS[tool]) {
      addDrawing(tool, points);
    } else {
      setDraft(points);
    }
  });

  const updatePreview = useEffectEvent((point?: { x: number; y: number }) => {
    if (tool !== "Cross" && tool !== "Brush" && tool !== "Measure" && draft.length) {
      setPreviewPoint(point ? getPoint(point.x, point.y, magnet) : null);
    }
  });

  const handleAnchorPointer = (event: PointerEvent<HTMLDivElement>) => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series || tool !== "Cross") return;
    if (event.type === "pointerdown" && measurement) setMeasurement(null);

    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const drag = anchorDragRef.current;

    if (drag) {
      const point = event.type === "pointercancel" ? drag.original : getPoint(x, y, magnet);
      if (point) {
        setDrawings((current) => current.map((drawing) => drawing.id === drag.id
          ? moveDrawingAnchor(drawing, drag.index, point)
          : drawing));
      }

      if (event.type !== "pointermove") {
        anchorDragRef.current = null;
        element.releasePointerCapture(event.pointerId);
      }
      return;
    }

    if (locked || hidden) return;
    const { width, height } = chart.paneSize();
    if (x < 0 || x >= width || y < 0 || y >= height) {
      if (activeAnchor) setActiveAnchor(null);
      return;
    }

    for (let drawingIndex = drawings.length - 1; drawingIndex >= 0; drawingIndex--) {
      const drawing = drawings[drawingIndex];
      if (drawing.tool === "Brush") continue;

      const index = drawing.points.findIndex((point) => {
        const anchor = projectDrawingPoint(chart, series, point);
        return anchor && Math.hypot(x - anchor.x, y - anchor.y) <= 8;
      });
      if (index < 0) continue;

      if (activeAnchor?.id !== drawing.id || activeAnchor.index !== index) {
        setActiveAnchor({ id: drawing.id, index });
      }
      if (event.type === "pointerdown" && event.button === 0) {
        event.preventDefault();
        event.stopPropagation();
        anchorDragRef.current = { id: drawing.id, index, original: drawing.points[index] };
        element.setPointerCapture(event.pointerId);
      }
      return;
    }

    if (activeAnchor) setActiveAnchor(null);
  };

  const handleDrawingDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (tool !== "Brush" && tool !== "Measure") return;
    const chart = chartRef.current;
    if (!chart) return;

    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const { width, height } = chart.paneSize();
    const point = x >= 0 && x < width && y >= 0 && y < height
      ? getPoint(x, y, tool === "Measure" && magnet)
      : null;

    if (event.type === "pointerdown") {
      if (!point || event.button !== 0) return;
      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      brushRef.current = [point];
      setDraft([point]);
    } else if (element.hasPointerCapture(event.pointerId)) {
      if (point) {
        const points = tool === "Measure" ? brushRef.current.slice(0, 1) : brushRef.current;
        brushRef.current = [...points, point];
      }

      if (event.type === "pointermove") {
        setDraft(brushRef.current);
      } else {
        element.releasePointerCapture(event.pointerId);
        if (event.type === "pointerup" && brushRef.current.length >= DRAWING_POINTS[tool]) {
          addDrawing(tool, brushRef.current);
        } else {
          setDraft([]);
        }
        brushRef.current = [];
      }
    }
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    const styles = getComputedStyle(container);
    const colors = {
      background: styles.getPropertyValue("--terminal-card").trim(),
      text: styles.getPropertyValue("--terminal-muted-text").trim(),
      grid: styles.getPropertyValue("--terminal-border").trim(),
    };

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

    const series = chart.addSeries(CandlestickSeries, {
      ...CANDLE_COLORS,
      priceFormat: {
        type: "price",
        precision,
        minMove: 10 ** -precision,
      },
    });
    seriesRef.current = series;
    renderDrawingsRef.current = createDrawingLayer(chart, series);
    updateChartSeries.current = createChartSeries(chart, series);

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => checkHistory(range));
    chart.subscribeClick(({ point, paneIndex }) => {
      if (point && paneIndex === 0) handleChartClick(point.x, point.y);
    });
    chart.subscribeCrosshairMove(({ point, paneIndex }) => {
      updatePreview(paneIndex === 0 ? point : undefined);
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
      renderDrawingsRef.current = null;
      updateChartSeries.current = null;
      firstTimeRef.current = undefined;
    };
  }, [symbol, theme]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    const candlesByTime = new Map<UTCTimestamp, ChartCandle>();

    for (const candle of candles) {
      const time = Math.floor(Date.parse(candle.date) / 1000) as UTCTimestamp;
      const { open, high, low, close } = candle;

      if (![time, open, high, low, close].every(Number.isFinite)) continue;

      candlesByTime.set(time, { time, open, high, low, close, volume: candle.volume });
    }

    const chartCandles = [...candlesByTime.values()].sort(
      (first, second) => first.time - second.time,
    );

    const scale = chart.timeScale();
    const range = scale.getVisibleLogicalRange();
    const previousFirstTime = firstTimeRef.current;
    const firstTime = chartCandles[0]?.time;
    updatingDataRef.current = true;
    try {
      series.setData(chartCandles);
      updateChartSeries.current?.(chartCandles, settings);

      if (firstTime !== undefined && previousFirstTime === undefined) {
        scale.fitContent();
      } else if (range && firstTime !== undefined && previousFirstTime !== undefined && firstTime < previousFirstTime) {
        const prepended = chartCandles.findIndex(({ time }) => time === previousFirstTime);
        if (prepended > 0) {
          scale.setVisibleLogicalRange({ from: range.from + prepended, to: range.to + prepended });
        }
      }

      firstTimeRef.current = firstTime;
    } finally {
      updatingDataRef.current = false;
    }
  }, [symbol, theme, candles, settings]);

  useEffect(() => {
    chartRef.current?.applyOptions({
      crosshair: { mode: magnet ? CrosshairMode.MagnetOHLC : CrosshairMode.Normal },
      handleScroll: {
        pressedMouseMove: tool !== "Brush" && tool !== "Measure",
        horzTouchDrag: tool !== "Brush" && tool !== "Measure",
        vertTouchDrag: tool !== "Brush" && tool !== "Measure",
      },
    });
  }, [theme, magnet, tool]);

  useEffect(() => {
    const visible = hidden ? [] : drawings.map((drawing) =>
      !locked && activeAnchor?.id === drawing.id
        ? { ...drawing, activeAnchor: activeAnchor.index }
        : drawing,
    );
    const points = previewPoint ? [...draft, previewPoint] : draft;
    const preview = tool !== "Cross" && draft.length ? [{ id: -1, tool, points }] : [];
    renderDrawingsRef.current?.([...visible, ...preview, ...(measurement ? [measurement] : [])]);
  }, [theme, hidden, locked, activeAnchor, drawings, tool, draft, previewPoint, measurement]);

  return (
    <>
      <ChartToolbar
        active={{
          [tool]: true,
          "Magnet Mode": magnet,
          "Keep drawing": keepDrawing,
          "Lock all drawings": locked,
          "Hide all drawings": hidden,
          "Show Object Tree": showObjects,
        }}
        locked={locked}
        onAction={selectTool}
      />

      <div className="chart-plot" onKeyDown={(event) => {
        if (event.key === "Escape") selectTool("Cross");
      }}>
        <div
          ref={chartContainerRef}
          className={`trading-chart ${tool === "Brush" || tool === "Measure" ? "touch-none" : ""}`}
          tabIndex={0}
          aria-label="Market chart"
          onPointerDownCapture={handleAnchorPointer}
          onPointerMoveCapture={handleAnchorPointer}
          onPointerUpCapture={handleAnchorPointer}
          onPointerCancelCapture={handleAnchorPointer}
          onPointerLeave={() => setActiveAnchor(null)}
          onPointerDown={handleDrawingDrag}
          onPointerMove={handleDrawingDrag}
          onPointerUp={handleDrawingDrag}
          onPointerCancel={handleDrawingDrag}
        />
        {children}

        {tool !== "Cross" && (
          <p className="pointer-events-none absolute left-2 top-2 rounded bg-[var(--terminal-card)] p-1 text-xs text-[var(--terminal-text)]">
            {tool === "Brush" || tool === "Measure"
              ? tool === "Brush" ? "Drag to draw" : "Drag to measure"
              : tool === "Long Position"
                ? "Click to place the entry. Drag the anchors to adjust."
                : `${tool} · Point ${draft.length + 1} of ${DRAWING_POINTS[tool]}`}
          </p>
        )}

        {showObjects && (
          <aside
            aria-label="Chart drawings"
            className="absolute right-16 top-2 z-10 max-h-[80%] min-w-36 overflow-auto rounded border border-[var(--terminal-border)] bg-[var(--terminal-card)] p-2 text-xs text-[var(--terminal-text)]"
          >
            {drawings.length === 0 && <p>No drawings</p>}
            {drawings.map(({ id, tool, text }) => (
              <div key={id} className="flex items-center justify-between gap-2 py-1">
                <span>{text ?? tool}</span>
                <Button variant="unstyled"
                  type="button"
                  className="disabled:opacity-40"
                  aria-label={`Remove ${text ?? tool}`}
                  disabled={locked}
                  onClick={() => setDrawings((current) => current.filter((drawing) => drawing.id !== id))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}
