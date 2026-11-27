import type {
  IChartApi,
  IPrimitivePaneView,
  ISeriesPrimitiveAxisView,
  ISeriesApi,
  Time,
} from "lightweight-charts";

export const DRAWING_POINTS = {
  "Trend Line": 2,
  "Fib Retracement": 2,
  "XABCD Pattern": 5,
  "Long Position": 1,
  Brush: 2,
  Text: 1,
  Icon: 1,
  Measure: 2,
};

export type DrawingTool = keyof typeof DRAWING_POINTS;

export type DrawingPoint = {
  time: Time;
  price: number;
  barOffset: number;
};

export type ChartDrawing = {
  id: number;
  tool: DrawingTool;
  points: DrawingPoint[];
  text?: string;
  activeAnchor?: number;
};

const FIB_LEVELS = [
  { level: 0, color: "#787b86" },
  { level: 0.236, color: "#f23645" },
  { level: 0.382, color: "#ff9800" },
  { level: 0.5, color: "#4caf50" },
  { level: 0.618, color: "#089981" },
  { level: 0.786, color: "#00bcd4" },
  { level: 1, color: "#787b86" },
];
const DRAWING_BLUE = "#2962ff";
const POSITION_COLORS = ["#787b86", "#089981", "#f23645"];

function drawingColor(drawing: ChartDrawing) {
  if (drawing.tool === "Measure" && drawing.points.length >= 2) {
    return drawing.points[1].price < drawing.points[0].price ? "#f23645" : DRAWING_BLUE;
  }
  return DRAWING_BLUE;
}

function drawingPrices(drawing: ChartDrawing) {
  const { points, tool } = drawing;
  if (tool === "Fib Retracement" && points.length === 2) {
    const [first, last] = points;
    return FIB_LEVELS.map(({ level, color }) => ({
      price: last.price + (first.price - last.price) * level,
      color,
    }));
  }

  const anchors = tool === "Brush" && points.length > 1 ? [points[0], points[points.length - 1]] : points;
  return anchors.map(({ price }, index) => ({
    price,
    color: tool === "Long Position" ? POSITION_COLORS[index] : drawingColor(drawing),
  }));
}

export function moveDrawingAnchor(drawing: ChartDrawing, index: number, point: DrawingPoint) {
  const points = drawing.points.map((anchor, anchorIndex) => {
    if (anchorIndex === index) return point;
    if (drawing.tool === "Long Position" && index > 0 && anchorIndex > 0) {
      return { ...anchor, time: point.time, barOffset: point.barOffset };
    }
    return anchor;
  });

  if (drawing.tool === "Long Position") {
    const [entry, target, stop] = points;
    if (stop.price >= entry.price || target.price <= entry.price) return drawing;
  }

  return { ...drawing, points };
}

export function projectDrawingPoint(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  point: DrawingPoint,
) {
  const scale = chart.timeScale();
  const x = scale.timeToCoordinate(point.time);
  const y = series.priceToCoordinate(point.price);

  return x === null || y === null
    ? null
    : { x: x + point.barOffset * scale.options().barSpacing, y };
}

export function createDrawingLayer(chart: IChartApi, series: ISeriesApi<"Candlestick">) {
  let drawings: ChartDrawing[] = [];
  let axisViews: ISeriesPrimitiveAxisView[] = [];

  const view: IPrimitivePaneView = {
    zOrder: () => "top",
    renderer: () => ({
      draw(target) {
        target.useMediaCoordinateSpace(({ context }) => {
          context.lineWidth = 2;
          context.font = "12px sans-serif";

          for (const drawing of drawings) {
            const points = drawing.points.map((point) => projectDrawingPoint(chart, series, point));

            if (points.some((point) => point === null)) continue;
            context.strokeStyle = drawingColor(drawing);
            context.fillStyle = drawingColor(drawing);
            drawDrawing(context, drawing, points.filter((point) => point !== null));

            const anchor = drawing.activeAnchor === undefined ? null : points[drawing.activeAnchor];
            if (anchor) {
              context.beginPath();
              context.strokeStyle = DRAWING_BLUE;
              context.arc(anchor.x, anchor.y, 5, 0, 2 * Math.PI);
              context.stroke();
            }
          }
        });
      },
    }),
  };
  const views = [view];

  let requestUpdate: (() => void) | undefined;

  series.attachPrimitive({
    attached: (params) => { requestUpdate = params.requestUpdate; },
    detached: () => { requestUpdate = undefined; },
    paneViews: () => views,
    priceAxisViews: () => axisViews,
  });

  return (nextDrawings: ChartDrawing[]) => {
    drawings = nextDrawings;
    const labels = new Map<number, string>();
    for (const drawing of drawings) {
      for (const { price, color } of drawingPrices(drawing)) labels.set(price, color);
    }
    axisViews = [...labels].map(([price, color]) => ({
      coordinate: () => series.priceToCoordinate(price) ?? -1,
      text: () => series.priceFormatter().format(price),
      textColor: () => "#ffffff",
      backColor: () => color,
      visible: () => {
        const coordinate = series.priceToCoordinate(price);
        return coordinate !== null && coordinate >= 0 && coordinate <= chart.paneSize().height;
      },
    }));
    requestUpdate?.();
  };
}

type ScreenPoint = { x: number; y: number };

function drawDrawing(
  context: CanvasRenderingContext2D,
  drawing: ChartDrawing,
  points: ScreenPoint[],
) {
  const [start, end, stop] = points;
  if (!start) return;

  const line = (from: ScreenPoint, to: ScreenPoint) => {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  };

  if (drawing.text) {
    context.fillText(drawing.text, start.x, start.y);
  } else if (points.length === 1) {
    context.beginPath();
    context.arc(start.x, start.y, 3, 0, 2 * Math.PI);
    context.fill();
  } else if (drawing.tool === "Fib Retracement" && end) {
    for (const { level, color } of FIB_LEVELS) {
      context.strokeStyle = color;
      context.fillStyle = color;
      const y = end.y + (start.y - end.y) * level;
      line({ x: start.x, y }, { x: end.x, y });
      const [first, last] = drawing.points;
      const price = last.price + (first.price - last.price) * level;
      context.fillText(`${level} (${Number(price.toPrecision(7))})`, Math.max(start.x, end.x) + 4, y - 3);
    }
  } else if (drawing.tool === "Long Position" && end && stop) {
    context.save();
    context.fillStyle = "rgba(8, 153, 129, 0.25)";
    context.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
    context.fillStyle = "rgba(242, 54, 69, 0.25)";
    context.fillRect(start.x, start.y, end.x - start.x, stop.y - start.y);
    context.restore();
    line(start, { x: end.x, y: start.y });
    const [entryPoint, targetPoint, stopPoint] = drawing.points;
    const reward = targetPoint.price - entryPoint.price;
    const risk = entryPoint.price - stopPoint.price;
    if (reward > 0 && risk > 0) {
      context.fillText(`Reward / Risk: ${(reward / risk).toFixed(2)}`, start.x + 5, start.y - 5);
    }
  } else {
    context.beginPath();
    context.moveTo(start.x, start.y);
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();

    if (drawing.tool === "XABCD Pattern") {
      points.forEach((point, index) => context.fillText("XABCD"[index], point.x + 4, point.y - 4));
    }

    if (drawing.tool === "Measure" && end) {
      const [first, last] = drawing.points;
      const difference = last.price - first.price;
      const percent = first.price ? ` (${(difference / first.price * 100).toFixed(2)}%)` : "";
      const minutes = Math.abs(Number(last.time) - Number(first.time)) / 60;
      context.save();
      context.globalAlpha = 0.15;
      context.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
      context.restore();
      context.fillText(`${Number(difference.toPrecision(6))}${percent} · ${minutes}m`, end.x + 4, end.y - 4);
    }
  }
}
