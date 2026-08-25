import "./TopBar.css";
import Link from "next/link";
import { PairSearchModal } from "./PairSearchModal";
import { useState } from "react";
import { InstrumentIcon } from "./InstrumentIcon";
import { useTopbarInstruments } from "./useTopbarInstruments";
import type { Instrument } from "./instruments.data";
import type { Theme } from "../hooks/useTheme";
import { Moon, Sun } from "lucide-react";

function TrendChart({ trend }: { trend: Instrument["trend"] }) {
  const isUp = trend === "up";
  const points = isUp
    ? "0,30 11,27 22,28 34,19 45,21 57,11 68,13 80,3"
    : "0,7 11,12 22,10 34,18 45,16 57,25 68,23 80,32";

  return (
    <svg className={`ticker-trend ${trend}`} viewBox="0 0 80 38" aria-hidden="true">
      <polyline points={points} />
      <polygon points={`${points} 80,38 0,38`} />
    </svg>
  );
}


type TickerCardProps = {
  ticker: Instrument;
  active: boolean;
  onSelect: (symbol: string) => void;
};

function TickerCard({ ticker, active, onSelect }: TickerCardProps) {
  const isUp = ticker.trend === "up";
  return (
    <button type="button" className={`ticker-card !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(212,168,83,0.14)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D4A853]/40 motion-reduce:transform-none motion-reduce:!transition-none${active ? " active shadow-[0_5px_16px_rgba(212,168,83,0.18)]" : ""}`} onClick={() => onSelect(ticker.symbol)} aria-pressed={active}>
      <InstrumentIcon type={ticker.icon} />
      <div className="ticker-copy">
        <span className="ticker-symbol">{ticker.symbol}</span>
        <strong className="ticker-price">{ticker.price}</strong>
        <span className={`ticker-change ${ticker.trend}`}><span className="change-arrow">{isUp ? "▲" : "▼"}</span>{ticker.change}</span>
      </div>
      <TrendChart trend={ticker.trend} />
    </button>
  );
}



type TopBarProps = {
  theme: Theme;
  onThemeToggle: () => void;
};

export default function TopBar({ theme, onThemeToggle }: TopBarProps) {
  const { instruments, activeSymbol, setActiveSymbol, addInstrument, addedSymbols } = useTopbarInstruments();
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);

  const addPair = (pair: Instrument) => {
    addInstrument(pair);
    setIsInstrumentModalOpen(false);
  };

  return (
    <header className="top-bar-panel">
      <Link className="paxivo-logo" href="/" aria-label="Paxivo home"><span className="paxivo-logo-mark" aria-hidden="true">P</span><span>PAXIVO</span></Link>
      <div className="ticker-list" aria-label="Market ticker">
        {instruments.map((ticker) => <TickerCard key={ticker.symbol} ticker={ticker} active={ticker.symbol === activeSymbol} onSelect={setActiveSymbol} />)}
      </div>
      <div className="topbar-actions">
        <button type="button" className="topbar-action !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:border-[#D4A853] hover:shadow-[0_5px_14px_rgba(212,168,83,0.16)] active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D4A853]/40 motion-reduce:transform-none motion-reduce:!transition-none" aria-label="Add instrument" aria-haspopup="dialog" onClick={() => setIsInstrumentModalOpen(true)}>+</button>
        <button type="button" className="topbar-action theme-toggle !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:border-[#D4A853] hover:shadow-[0_5px_14px_rgba(212,168,83,0.16)] active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#D4A853]/40 motion-reduce:transform-none motion-reduce:!transition-none" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={onThemeToggle}>
          {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
      </div>
      {isInstrumentModalOpen && <PairSearchModal onClose={() => setIsInstrumentModalOpen(false)} onAdd={addPair} addedSymbols={addedSymbols} />}
    </header>
  );
}
