import { useMemo, useState } from "react";
import type { MarketQuotes } from "@/src/types/market";
import { DEFAULT_TOPBAR_SYMBOLS, INSTRUMENTS } from "./instruments.data";
import type { Instrument } from "./instruments.data";
import type { MarketSymbol } from "../market-watch/symbols.data";

const getInstrument = (symbol: string) => INSTRUMENTS.find((instrument) => instrument.symbol === symbol);

export function useTopbarInstruments(
  marketSymbols: MarketSymbol[],
  quotes: MarketQuotes,
) {
  const [symbols, setSymbols] = useState(DEFAULT_TOPBAR_SYMBOLS);
  const [selectedSymbol, setActiveSymbol] = useState(DEFAULT_TOPBAR_SYMBOLS[0]);

  const availableInstruments = useMemo(() => {
    const available = new Map<string, Instrument>();
    for (const { symbol, displaySymbol } of marketSymbols) {
      const bid = quotes[symbol]?.bid;
      const instrument = getInstrument(symbol);
      available.set(symbol, {
        symbol,
        displaySymbol,
        name: instrument?.name ?? symbol,
        icon: instrument?.icon ?? "coin",
        price: bid?.price.toLocaleString("en-US", { maximumFractionDigits: 8 }) ?? "—",
        priceDirection: bid?.direction,
        change: "",
        trend: "up",
      });
    }
    return available;
  }, [marketSymbols, quotes]);

  const instruments = symbols.flatMap((symbol) => {
    const instrument = availableInstruments.get(symbol);
    return instrument ? [instrument] : [];
  });
  const activeSymbol = availableInstruments.has(selectedSymbol)
    ? selectedSymbol
    : instruments[0]?.symbol ?? marketSymbols[0]?.symbol ?? "";

  const addInstrument = (instrument: Instrument) => {
    setSymbols((currentSymbols) => (
      currentSymbols.includes(instrument.symbol)
        ? currentSymbols
        : [...currentSymbols, instrument.symbol]
    ));
    setActiveSymbol(instrument.symbol);
  };

  return {
    instruments,
    availableInstruments: [...availableInstruments.values()],
    activeSymbol,
    setActiveSymbol,
    addInstrument,
    addedSymbols: symbols,
  };
}
