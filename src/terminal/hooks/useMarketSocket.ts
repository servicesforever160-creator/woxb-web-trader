import { useCallback, useEffect, useRef, useState } from "react";
import { disconnectSocket, getSocket } from "@/src/services/socket/socket";
import type { MarketTick } from "@/src/types/market";
import { getBaseSymbol } from "../market-watch/symbols.data";
import type { MarketSymbol } from "../market-watch/symbols.data";

type TickListener = (tick: MarketTick) => void;

type MarketSnapshot = {
  status: "available";
} & MarketTick | {
  status: "unavailable";
  symbol: string;
};

export function useMarketSocket(symbols: MarketSymbol[]) {
  const [prices, setPrices] = useState<Partial<Record<string, number>>>({});
  const listeners = useRef(new Set<TickListener>());

  const subscribeToTicks = useCallback((listener: TickListener) => {
    const subscribers = listeners.current;
    subscribers.add(listener);
    return () => { subscribers.delete(listener); };
  }, []);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !symbols.length) return;

    const socket = getSocket(accessToken);
    const accountSymbols = [...new Set(symbols.map(({ accountSymbol }) => accountSymbol))];
    const symbolsByKey = new Map(symbols.map(({ baseSymbol, symbol }) => [baseSymbol, symbol]));
    const latestTimes = new Map<string, number>();

    const subscribe = () => {
      socket.emit("market:subscribe", { symbols: accountSymbols });
    };

    const receivePrice = (tick: MarketTick) => {
      if (typeof tick?.symbol !== "string" || !Number.isFinite(tick.price)) return;

      const symbol = symbolsByKey.get(getBaseSymbol(tick.symbol));
      if (!symbol) return;

      const { timestamp, price } = tick;
      const latest = latestTimes.get(symbol);
      if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || latest === undefined || timestamp >= latest) {
        if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
          latestTimes.set(symbol, timestamp);
        }
        setPrices((current) => current[symbol] === price ? current : { ...current, [symbol]: price });
      }

      for (const listener of listeners.current) listener({ ...tick, symbol });
    };

    const receiveSnapshot = (snapshot: MarketSnapshot) => {
      if (snapshot?.status === "available") receivePrice(snapshot);
    };

    socket.on("market:price", receivePrice);
    socket.on("market:snapshot", receiveSnapshot);
    socket.on("connect", subscribe);
    if (socket.connected) subscribe();

    return () => {
      socket.off("market:price", receivePrice);
      socket.off("market:snapshot", receiveSnapshot);
      socket.off("connect", subscribe);
      if (socket.connected) socket.emit("market:unsubscribe", { symbols: accountSymbols });
      disconnectSocket();
    };
  }, [symbols]);

  return { prices, subscribeToTicks };
}
