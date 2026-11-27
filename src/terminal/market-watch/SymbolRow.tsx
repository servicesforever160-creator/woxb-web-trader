import { Button } from "@/src/components/ui/button";
import { Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

type SymbolRowProps = {
  symbol: string;
  price?: number;
  active: boolean;
  favorite: boolean;
  favoriteDisabled: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export default function SymbolRow({
  symbol,
  price,
  active,
  favorite,
  favoriteDisabled,
  onSelect,
  onToggleFavorite,
}: SymbolRowProps) {
  const favoriteLabel = favorite ? "Remove from favorites" : "Add to favorites";
  const initials = symbol.includes("/")
    ? symbol.split("/").map((part) => part[0]).join("/")
    : symbol.slice(0, 3);

  return (
    <div className="symbol-row relative" data-active={active}>
      <Button variant="unstyled"
        type="button"
        className="absolute inset-0 rounded-sm focus-visible:outline focus-visible:outline-[var(--terminal-primary)]"
        aria-label={`Select ${symbol}`}
        aria-pressed={active}
        onClick={onSelect}
      />

      <div className="symbol-left">
        <span className="symbol-avatar" aria-hidden="true">{initials}</span>
        <div className="symbol-info flex items-center gap-1">
          <strong>{symbol}</strong>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="unstyled" />}
              type="button"
              className="relative z-10 grid size-6 place-items-center rounded text-[var(--terminal-muted-text)] hover:text-[var(--terminal-primary)] aria-pressed:text-[var(--terminal-primary)] aria-disabled:opacity-50"
              aria-label={`${favoriteLabel}: ${symbol}`}
              aria-pressed={favorite}
              aria-disabled={favoriteDisabled}
              onClick={onToggleFavorite}
            >
              <Star size={13} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{favoriteLabel}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="symbol-price">
        <strong>{price?.toLocaleString("en-US", { maximumFractionDigits: 8 }) ?? "—"}</strong>
      </div>
    </div>
  );
}
