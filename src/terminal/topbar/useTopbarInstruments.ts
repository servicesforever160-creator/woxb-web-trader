import { useMemo, useState } from "react";
import { DEFAULT_TOPBAR_SYMBOLS, INSTRUMENTS } from "./instruments.data";
import type { Instrument } from "./instruments.data";

const getInstrument = (symbol: string) => INSTRUMENTS.find((instrument) => instrument.symbol === symbol);

export function useTopbarInstruments() {
  const [symbols, setSymbols] = useState(DEFAULT_TOPBAR_SYMBOLS);
  const [activeSymbol, setActiveSymbol] = useState(DEFAULT_TOPBAR_SYMBOLS[0]);

  const instruments = useMemo(
    () => symbols.map(getInstrument).filter((instrument): instrument is Instrument => Boolean(instrument)),
    [symbols]
  );

  const addInstrument = (instrument: Instrument) => {
    setSymbols((currentSymbols) => (
      currentSymbols.includes(instrument.symbol)
        ? currentSymbols
        : [...currentSymbols, instrument.symbol]
    ));
    setActiveSymbol(instrument.symbol);
  };

  return { instruments, activeSymbol, setActiveSymbol, addInstrument, addedSymbols: symbols };
}
