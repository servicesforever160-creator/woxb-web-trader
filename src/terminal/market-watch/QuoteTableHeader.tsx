import { useRef } from "react";
import type { PointerEvent } from "react";

export const QUOTE_COLUMNS = [
  { label: "Symbol", width: 120, minWidth: 76 },
  { label: "Bid", width: 84, minWidth: 52 },
  { label: "Ask", width: 84, minWidth: 52 },
];

export default function QuoteTableHeader({ widths, onResize }: {
  widths: number[];
  onResize: (widths: number[]) => void;
}) {
  const drag = useRef<{ x: number; widths: number[] } | null>(null);

  const startResize = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    const row = event.currentTarget.closest("tr");
    if (!row) return;

    drag.current = { x: event.clientX, widths: Array.from(row.cells, (cell) => cell.offsetWidth) };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  function resize(index: number, delta: number, startingWidths: number[]) {
    onResize(startingWidths.map((width, column) =>
      column === index ? Math.max(QUOTE_COLUMNS[index].minWidth, width + delta) : width,
    ));
  }

  return (
    <thead>
      <tr>
        {QUOTE_COLUMNS.map(({ label, minWidth }, index) => (
          <th key={label} scope="col">
            {label}
            <span
              className="quote-column-resizer"
              role="separator"
              tabIndex={0}
              aria-label={`Resize ${label} column`}
              aria-orientation="vertical"
              aria-valuemin={minWidth}
              aria-valuenow={widths[index]}
              onPointerDown={startResize}
              onPointerMove={(event) => {
                if (drag.current) resize(index, event.clientX - drag.current.x, drag.current.widths);
              }}
              onLostPointerCapture={() => { drag.current = null; }}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                resize(index, event.key === "ArrowLeft" ? -8 : 8, widths);
              }}
            />
          </th>
        ))}
      </tr>
    </thead>
  );
}
