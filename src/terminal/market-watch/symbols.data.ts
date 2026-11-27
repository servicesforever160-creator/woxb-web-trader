import type { MarketSymbols } from "@/src/services/api/market/get-market-symbols.api";
import { INSTRUMENTS } from "../topbar/instruments.data";

export type MarketSymbol = {
  accountSymbol: string;
  baseSymbol: string;
  symbol: string;
  category: string;
};

export function getBaseSymbol(symbol: string) {
  return symbol.split(".")[0].replaceAll("/", "").toUpperCase();
}

export function toMarketSymbols(categories: MarketSymbols): MarketSymbol[] {
  return Object.entries(categories).flatMap(([category, symbols]) =>
    [...new Set(symbols)].map((accountSymbol) => {
      const baseSymbol = getBaseSymbol(accountSymbol);
      const known = INSTRUMENTS.find((instrument) => getBaseSymbol(instrument.symbol) === baseSymbol);
      const pair = /^(.*?)(USDT|USDC|USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD|BTC|ETH)$/.exec(baseSymbol);
      const symbol = known?.symbol ?? (pair && pair[1] ? `${pair[1]}/${pair[2]}` : baseSymbol);

      return { accountSymbol, baseSymbol, symbol, category };
    }),
  );
}
