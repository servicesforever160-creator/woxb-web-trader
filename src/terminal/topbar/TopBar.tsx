import { Button } from "@/src/components/ui/button";
import "./TopBar.css";
import Link from "next/link";
import { PairSearchModal } from "./PairSearchModal";
import { useState } from "react";
import { InstrumentIcon } from "./InstrumentIcon";
import type { useTopbarInstruments } from "./useTopbarInstruments";
import type { Instrument } from "./instruments.data";
import type { AccountDetail } from "./accountDetails";
import type { Theme } from "../hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import AccountCard from "./AccountCard";
import TickerAreaChart from "./TickerAreaChart";
import type { SubscribeToMarketTicks } from "../hooks/useMarketSocket";

type TickerCardProps = {
  ticker: Instrument;
  active: boolean;
  onSelect: (symbol: string) => void;
  subscribeToTicks: SubscribeToMarketTicks;
};

function TickerCard({ ticker, active, onSelect, subscribeToTicks }: TickerCardProps) {
  const isUp = ticker.trend === "up";
  return (
    <Button
      variant="unstyled"
      type="button"
      className={`ticker-card !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(212,168,83,0.14)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F5B800]/40 motion-reduce:transform-none motion-reduce:!transition-none${active ? " active shadow-[0_5px_16px_rgba(212,168,83,0.18)]" : ""}`}
      onClick={() => onSelect(ticker.symbol)}
      aria-pressed={active}
      data-price-direction={ticker.priceDirection}
    >
      <InstrumentIcon type={ticker.icon} />
      <div className="ticker-copy">
        <span className="ticker-symbol">{ticker.displaySymbol ?? ticker.symbol}</span>
        <strong className="ticker-price">
          {ticker.price}
        </strong>
        {ticker.change && (
          <span className={`ticker-change ${ticker.trend}`}><span className="change-arrow">{isUp ? "▲" : "▼"}</span>{ticker.change}</span>
        )}
      </div>
      <TickerAreaChart symbol={ticker.symbol} subscribeToTicks={subscribeToTicks} />
    </Button>
  );
}



type TopBarProps = ReturnType<typeof useTopbarInstruments> & {
  accountDetails: AccountDetail[];
  theme: Theme;
  onThemeToggle: () => void;
  subscribeToTicks: SubscribeToMarketTicks;
};

export default function TopBar({
  accountDetails,
  instruments,
  availableInstruments,
  activeSymbol,
  setActiveSymbol,
  addInstrument,
  addedSymbols,
  theme,
  onThemeToggle,
  subscribeToTicks,
}: TopBarProps) {
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);

  const addPair = (pair: Instrument) => {
    addInstrument(pair);
    setIsInstrumentModalOpen(false);
  };

  return (
    <header className="top-bar-panel">
      <Link className="paxivo-logo" href="/" aria-label="Paxivo home">
        <motion.div
          whileHover={{
            scale: 1.05,
            rotate: 2,
          }}
          whileTap={{
            scale: 0.97,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 22,
          }}
          className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden"
        >
          <Image
            src={
              theme === "dark"
                ? "/assets/logos-dark/logo-short.png"
                : "/assets/logos-light/logo-short.png"
            }
            alt="App Logo"
            width={62}
            height={62}
            className="size-full object-contain"
            priority
          />
        </motion.div>
        <span>
          {process.env.NEXT_PUBLIC_APP_NAME}
        </span>
      </Link>
      <div className="ticker-list" aria-label="Market ticker">
        {instruments.map((ticker) => (
          <TickerCard
            key={ticker.symbol}
            ticker={ticker}
            active={ticker.symbol === activeSymbol}
            onSelect={setActiveSymbol}
            subscribeToTicks={subscribeToTicks}
          />
        ))}
      </div>
      <AccountCard details={accountDetails} />
      <div className="topbar-actions">
        <Button variant="unstyled" type="button" className="topbar-action !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:border-[#F5B800] hover:shadow-[0_5px_14px_rgba(212,168,83,0.16)] active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#F5B800]/40 motion-reduce:transform-none motion-reduce:!transition-none" aria-label="Add instrument" aria-haspopup="dialog" onClick={() => setIsInstrumentModalOpen(true)}>+</Button>
        <Button variant="unstyled" type="button" className="topbar-action theme-toggle !transition-all !duration-300 !ease-out hover:-translate-y-0.5 hover:border-[#F5B800] hover:shadow-[0_5px_14px_rgba(212,168,83,0.16)] active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#F5B800]/40 motion-reduce:transform-none motion-reduce:!transition-none" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={onThemeToggle}>
          {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
      </div>
      {isInstrumentModalOpen && <PairSearchModal onClose={() => setIsInstrumentModalOpen(false)} onAdd={addPair} addedSymbols={addedSymbols} instruments={availableInstruments} />}
    </header>
  );
}
