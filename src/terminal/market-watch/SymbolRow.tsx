import { Button } from "@/src/components/ui/button";
import { GripVertical, Star } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { useCallback } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import type { MarketQuote } from "@/src/types/market";
import type { MarketSymbol } from "./symbols.data";

type SymbolRowProps = {
  symbol: MarketSymbol;
  quote?: MarketQuote;
  active: boolean;
  favorite: boolean;
  favoriteDisabled: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  rowId: string;
  rowIndex: number;
  onMove: (from: string, to: string) => void;
};

const MARKET_SYMBOL_ROW = "market-symbol-row";
type DraggedRow = { id: string; index: number };

export default function SymbolRow({
  symbol: { displaySymbol },
  quote,
  active,
  favorite,
  favoriteDisabled,
  onSelect,
  onToggleFavorite,
  rowId,
  rowIndex,
  onMove,
}: SymbolRowProps) {
  const favoriteLabel = favorite ? "Remove from favorites" : "Add to favorites";
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: MARKET_SYMBOL_ROW,
    item: { id: rowId, index: rowIndex },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [rowId, rowIndex]);
  const [{ dropPosition }, drop] = useDrop<DraggedRow, void, { dropPosition?: "before" | "after" }>(() => ({
    accept: MARKET_SYMBOL_ROW,
    canDrop: ({ id }) => id !== rowId,
    drop: ({ id }) => onMove(id, rowId),
    collect: (monitor) => ({
      dropPosition: monitor.isOver() && monitor.canDrop()
        ? (monitor.getItem().index < rowIndex ? "after" : "before")
        : undefined,
    }),
  }), [rowId, rowIndex, onMove]);
  const connectRow = useCallback((element: HTMLTableRowElement | null) => {
    drop(element);
    preview(element);
  }, [drop, preview]);
  const connectGrip = useCallback((element: HTMLSpanElement | null) => {
    drag(element);
  }, [drag]);

  return (
    <tr
      ref={connectRow}
      className="symbol-row"
      data-active={active}
      data-dragging={isDragging}
      data-drop-position={dropPosition}
      onClick={onSelect}
    >
      <td>
        <div className="symbol-info flex items-center gap-1">
          <span
            ref={connectGrip}
            className="quote-row-grip"
            title={`Drag to reorder ${displaySymbol}`}
          >
            <GripVertical size={14} aria-hidden="true" />
          </span>
          <Button
            variant="unstyled"
            type="button"
            className="min-w-0 truncate font-semibold"
            aria-pressed={active}
          >
            {displaySymbol}
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="unstyled" />}
              type="button"
              className="relative z-10 grid size-6 place-items-center rounded text-[var(--terminal-muted-text)] hover:text-[var(--terminal-primary)] aria-pressed:text-[var(--terminal-primary)] aria-disabled:opacity-50"
              aria-label={`${favoriteLabel}: ${displaySymbol}`}
              aria-pressed={favorite}
              aria-disabled={favoriteDisabled}
              onClick={(event) => {
                event.stopPropagation();
                if (!favoriteDisabled) onToggleFavorite();
              }}
            >
              <Star size={13} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{favoriteLabel}</TooltipContent>
          </Tooltip>
        </div>
      </td>
      <td className="symbol-price">
        <span data-price-direction={quote?.bid?.direction}>
          {quote?.bid?.price.toLocaleString("en-US", { maximumFractionDigits: 8 }) ?? "—"}
        </span>
      </td>
      <td className="symbol-price">
        <span data-price-direction={quote?.ask?.direction}>
          {quote?.ask?.price.toLocaleString("en-US", { maximumFractionDigits: 8 }) ?? "—"}
        </span>
      </td>
    </tr>
  );
}
