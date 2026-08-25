import { useEffect, useMemo, useState } from "react";
import { InstrumentIcon } from "./InstrumentIcon";
import { INSTRUMENTS } from "./instruments.data";
import type { Instrument } from "./instruments.data";

type PairSearchModalProps = {
  onClose: () => void;
  onAdd: (instrument: Instrument) => void;
  addedSymbols: string[];
};

export function PairSearchModal({ onClose, onAdd, addedSymbols }: PairSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const filteredPairs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return !term ? INSTRUMENTS : INSTRUMENTS.filter(({ symbol, name }) => `${symbol} ${name}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <div className="instrument-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="instrument-modal" role="dialog" aria-modal="true" aria-labelledby="instrument-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="instrument-modal-header">
          <div><p className="instrument-modal-eyebrow">Market watch</p><h2 id="instrument-modal-title">Add currency pair</h2></div>
          <button type="button" className="instrument-modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <label className="instrument-search">
          <span aria-hidden="true">⌕</span>
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by pair or currency" aria-label="Search currency pairs" />
        </label>
        <div className="instrument-table-wrap">
          <table className="instrument-table">
            <thead><tr><th>Pair</th><th>Last price</th><th>24h change</th><th><span className="sr-only">Add pair</span></th></tr></thead>
            <tbody>
              {filteredPairs.map((pair) => {
                const isAdded = addedSymbols.includes(pair.symbol);
                return <tr key={pair.symbol}>
                  <td><div className="pair-name"><InstrumentIcon type={pair.icon} /><span><strong>{pair.symbol}</strong><small>{pair.name}</small></span></div></td>
                  <td>{pair.price}</td>
                  <td className={`pair-change ${pair.trend}`}>{pair.trend === "up" ? "+" : "-"}{pair.change}</td>
                  <td><button type="button" className={`add-pair-button ${isAdded ? "is-added" : "is-available"}`} disabled={isAdded} onClick={() => onAdd(pair)}>{isAdded ? "✓ Added" : "+ Add"}</button></td>
                </tr>;
              })}
            </tbody>
          </table>
          {!filteredPairs.length && <p className="instrument-empty-state">No currency pair matches “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}
