import { Button } from "@/src/components/ui/button";
import "./MarketWatch.css";
import { useCallback, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Skeleton from "@/src/components/ui/skeleton";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import type { MarketQuotes } from "@/src/types/market";
import type { useMarketSymbols } from "../hooks/useMarketSymbols";
import SearchBox from "./SearchBox";
import MarketTabs from "./MarketTabs";
import SymbolRow from "./SymbolRow";
import QuoteTableHeader, { QUOTE_COLUMNS } from "./QuoteTableHeader";

type MarketWatchProps = {
  market: ReturnType<typeof useMarketSymbols>;
  quotes: MarketQuotes;
  activeSymbol: string;
  onSelect: (symbol: string) => void;
};

export default function MarketWatch({ market, quotes, activeSymbol, onSelect }: MarketWatchProps) {
  const [category, setCategory] = useState("favorite");
  const [search, setSearch] = useState("");
  const [widths, setWidths] = useState(() => QUOTE_COLUMNS.map(({ width }) => width));
  const [rowOrder, setRowOrder] = useState<string[]>([]);
  const { symbols, favorites, loading, marketError, favoritesError, pendingFavorite, retry, toggleFavorite } = market;

  const categories = [...new Set(symbols.map((symbol) => symbol.category))];
  const activeCategory = categories.includes(category) ? category : "favorite";
  const query = search.trim().replaceAll("/", "").toUpperCase();
  const rows = useMemo(() => symbols.map((symbol) => ({
    id: `${symbol.category}:${symbol.accountSymbol}`,
    symbol,
  })), [symbols]);
  const orderedRows = useMemo(() => {
    const ranks = new Map(rowOrder.map((id, index) => [id, index]));
    return [...rows].sort((first, second) =>
      (ranks.get(first.id) ?? ranks.size) - (ranks.get(second.id) ?? ranks.size),
    );
  }, [rowOrder, rows]);
  const moveRow = useCallback((from: string, to: string) => {
    const order = orderedRows.map(({ id }) => id);
    const source = order.indexOf(from);
    const destination = order.indexOf(to);
    if (source === -1 || destination === -1 || source === destination) return;

    order.splice(source, 1);
    order.splice(destination, 0, from);
    setRowOrder(order);
  }, [orderedRows]);

  const visibleRows = orderedRows.filter(({ symbol: { category, baseSymbol, accountSymbol } }) => {
    const matchesCategory = activeCategory === "favorite"
      ? favorites?.has(baseSymbol)
      : category === activeCategory;
    return matchesCategory && accountSymbol.replaceAll("/", "").toUpperCase().includes(query);
  });
  const error = marketError || (activeCategory === "favorite" ? favoritesError : "");

  return (
    <div className="market-watch-panel">
      <div className="market-watch-header">
        <span className="market-watch-title">Market Watch</span>
      </div>

      <div className="search-wrapper">
        <SearchBox value={search} onChange={setSearch} />
      </div>

      <div className="market-tabs">
        <MarketTabs categories={categories} value={activeCategory} onChange={setCategory} />
      </div>

      <div className="symbol-list" aria-busy={loading}>
        <DndProvider backend={HTML5Backend}>
          <TooltipProvider delay={250}>
            <table className="quote-table" aria-label="Market Watch quotes" style={{ minWidth: widths.reduce((sum, width) => sum + width, 0) }}>
              <colgroup>
                {QUOTE_COLUMNS.map(({ label }, index) => <col key={label} style={{ width: widths[index] }} />)}
              </colgroup>
              <QuoteTableHeader widths={widths} onResize={setWidths} />
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <tr className="symbol-row" key={index}>
                      {QUOTE_COLUMNS.map(({ label }) => (
                        <td key={label}><Skeleton className="h-4 w-4/5" /></td>
                      ))}
                    </tr>
                  ))
                ) : error || !visibleRows.length ? (
                  <tr>
                    <td colSpan={3} className="market-empty-state">
                      {error ? (
                        <div role="status">
                          <p>{error}</p>
                          <Button variant="unstyled" type="button" className="mt-2 underline" onClick={retry}>Retry</Button>
                        </div>
                      ) : activeCategory === "favorite" && !query ? "No favorite symbols yet." : "No symbols found."}
                    </td>
                  </tr>
                ) : visibleRows.map(({ id, symbol }, index) => (
                  <SymbolRow
                    key={id}
                    rowId={id}
                    rowIndex={index}
                    symbol={symbol}
                    quote={quotes[symbol.symbol]}
                    active={activeSymbol === symbol.symbol}
                    favorite={favorites?.has(symbol.baseSymbol) ?? false}
                    favoriteDisabled={!favorites || pendingFavorite !== undefined}
                    onSelect={() => onSelect(symbol.symbol)}
                    onToggleFavorite={() => void toggleFavorite(symbol)}
                    onMove={moveRow}
                  />
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        </DndProvider>
      </div>
    </div>
  );
}
