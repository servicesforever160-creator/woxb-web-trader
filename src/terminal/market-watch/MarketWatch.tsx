import "./MarketWatch.css"
import { useMemo, useState } from "react";

import SearchBox from "./SearchBox";
import MarketTabs from "./MarketTabs";
import type { MarketCategory } from "./MarketTabs";
import SymbolRow from "./SymbolRow";
import { SYMBOLS } from "./symbols.data";

export default function MarketWatch() {
  const [activeCategory, setActiveCategory] = useState<MarketCategory>("favorite");
  const [searchQuery, setSearchQuery] = useState("");
  const visibleSymbols = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SYMBOLS.filter((symbol) => {
      const matchesCategory = activeCategory === "favorite" ? symbol.isFavorite : symbol.category === activeCategory;
      return matchesCategory && symbol.Pair.toLowerCase().includes(query);
    });
  }, [activeCategory, searchQuery]);
  return (
    <div className="market-watch-panel">

  <div className="market-watch-header">
    <span className="market-watch-title">Market Watch</span>

    <div className="market-watch-actions">
      <button>+</button>
      <button>•••</button>
    </div>
  </div>

  <div className="search-wrapper">
    <SearchBox value={searchQuery} onChange={setSearchQuery} />
  </div>

  <div className="market-tabs">
    <MarketTabs value={activeCategory} onChange={setActiveCategory} />
  </div>

  <div className="symbol-list">
    {visibleSymbols.map((symbol) => (
      <SymbolRow key={symbol.Pair} Pair={symbol.Pair} CurrentPrice={symbol.CurrentPrice} PercentageChange={symbol.PercentageChange} PairSymbol={symbol.PairSymbol} Spread={symbol.spread}/>
    ))}
    {!visibleSymbols.length && <p className="market-empty-state">No symbols found.</p>}
  </div>

  {/* <div className="market-watch-footer">
    <button className="view-all-btn">
      View all symbols
    </button>
  </div> */}

</div>
  );
}
