import { Button } from "@/src/components/ui/button";
import "./MarketWatch.css";
import { useState } from "react";
import Skeleton from "@/src/components/ui/skeleton";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import type { useMarketSymbols } from "../hooks/useMarketSymbols";
import SearchBox from "./SearchBox";
import MarketTabs from "./MarketTabs";
import SymbolRow from "./SymbolRow";
import { getBaseSymbol } from "./symbols.data";

type MarketWatchProps = {
  market: ReturnType<typeof useMarketSymbols>;
  prices: Partial<Record<string, number>>;
  activeSymbol: string;
  onSelect: (symbol: string) => void;
};

export default function MarketWatch({ market, prices, activeSymbol, onSelect }: MarketWatchProps) {
  const [category, setCategory] = useState("favorite");
  const [search, setSearch] = useState("");
  const { symbols, favorites, loading, marketError, favoritesError, pendingFavorite, retry, toggleFavorite } = market;

  const categories = [...new Set(symbols.map((symbol) => symbol.category))];
  const activeCategory = categories.includes(category) ? category : "favorite";
  const query = getBaseSymbol(search.trim());
  const visibleSymbols = symbols.filter(({ category, baseSymbol }) => {
    const matchesCategory = activeCategory === "favorite"
      ? favorites?.has(baseSymbol)
      : category === activeCategory;
    return matchesCategory && baseSymbol.includes(query);
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
        {loading ? (
          <>
            <p className="sr-only" role="status">Loading market symbols</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div className="symbol-row" key={index}>
                <div className="symbol-left">
                  <Skeleton className="size-[30px]" rounded="rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="market-empty-state" role="status">
            <p>{error}</p>
            <Button variant="unstyled" type="button" className="mt-2 underline" onClick={retry}>Retry</Button>
          </div>
        ) : visibleSymbols.length ? (
          <TooltipProvider delay={250}>
            {visibleSymbols.map((symbol) => (
              <SymbolRow
                key={`${symbol.category}:${symbol.accountSymbol}`}
                symbol={symbol.symbol}
                price={prices[symbol.symbol]}
                active={activeSymbol === symbol.symbol}
                favorite={favorites?.has(symbol.baseSymbol) ?? false}
                favoriteDisabled={!favorites || pendingFavorite !== undefined}
                onSelect={() => onSelect(symbol.symbol)}
                onToggleFavorite={() => void toggleFavorite(symbol)}
              />
            ))}
          </TooltipProvider>
        ) : (
          <p className="market-empty-state">
            {activeCategory === "favorite" && !query ? "No favorite symbols yet." : "No symbols found."}
          </p>
        )}
      </div>
    </div>
  );
}
