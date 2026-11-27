import { useEffect, useRef, useState } from "react";
import { getMarketSymbols } from "@/src/services/api/market/get-market-symbols.api";
import { getFavoriteSymbols } from "@/src/services/api/market/get-favorite-symbols.api";
import { addFavoriteSymbols } from "@/src/services/api/market/add-favorite-symbols.api";
import { removeFavoriteSymbols } from "@/src/services/api/market/remove-favorite-symbols.api";
import { getBaseSymbol, toMarketSymbols } from "../market-watch/symbols.data";
import type { MarketSymbol } from "../market-watch/symbols.data";

const EMPTY_MARKET: MarketSymbol[] = [];

export function useMarketSymbols() {
  const [symbols, setSymbols] = useState<MarketSymbol[]>(EMPTY_MARKET);
  const [favorites, setFavorites] = useState<Set<string>>();
  const [marketError, setMarketError] = useState("");
  const [favoritesError, setFavoritesError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingFavorite, setPendingFavorite] = useState<string>();
  const [loadAttempt, setLoadAttempt] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    const { signal } = controller;

    const market = getMarketSymbols(signal).then((response) => {
      if (signal.aborted) return;
      if (response.success) {
        const nextSymbols = toMarketSymbols(response.data);
        setSymbols((current) => {
          const unchanged = current.length === nextSymbols.length && current.every((symbol, index) =>
            symbol.accountSymbol === nextSymbols[index].accountSymbol
            && symbol.category === nextSymbols[index].category,
          );
          return unchanged ? current : nextSymbols;
        });
        setMarketError("");
      } else {
        setMarketError(response.message);
      }
    });

    const saved = getFavoriteSymbols(signal).then((response) => {
      if (signal.aborted) return;
      if (response.success) {
        setFavorites(new Set(response.data.map(getBaseSymbol)));
        setFavoritesError("");
      } else {
        setFavoritesError(response.message);
      }
    });

    void Promise.all([market, saved]).then(() => {
      if (!signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [loadAttempt]);

  const retry = () => {
    if (savingRef.current) return;
    setLoading(true);
    setLoadAttempt((current) => current + 1);
  };

  const toggleFavorite = async ({ accountSymbol, baseSymbol }: MarketSymbol) => {
    const signal = requestRef.current?.signal;
    if (loading || !favorites || savingRef.current || !signal || signal.aborted) return;

    savingRef.current = true;
    setPendingFavorite(baseSymbol);

    try {
      const write = favorites.has(baseSymbol) ? removeFavoriteSymbols : addFavoriteSymbols;
      const response = await write([accountSymbol], signal);
      if (!signal.aborted && response.success) {
        setFavorites(new Set(response.data.map(getBaseSymbol)));
      }
    } finally {
      savingRef.current = false;
      if (!signal.aborted) setPendingFavorite(undefined);
    }
  };

  return { symbols, favorites, marketError, favoritesError, loading, pendingFavorite, retry, toggleFavorite };
}
