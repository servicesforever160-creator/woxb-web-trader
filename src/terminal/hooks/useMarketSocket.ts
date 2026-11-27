import { useCallback, useEffect, useRef, useState } from "react";
import { disconnectSocket, getSocket } from "@/src/services/socket/socket";
import type { MarketQuotes, MarketQuoteSide, MarketTick } from "@/src/types/market";
import { getBaseSymbol } from "../market-watch/symbols.data";
import type { MarketSymbol } from "../market-watch/symbols.data";

type TickListener = (tick: MarketTick) => void;

export type SubscribeToMarketTicks = (listener: TickListener) => () => void;

type SocketQuote = Omit<MarketTick, "price"> & {
  price?: number;
  bid?: number;
  ask?: number;
};

type MarketSnapshot =
  | (SocketQuote & { status: "available" })
  | { status: "unavailable"; symbol: string };

function finitePrice(price: number | undefined) {
  return typeof price === "number" && Number.isFinite(price) ? price : undefined;
}

function updateSide(previous: MarketQuoteSide | undefined, price: number | undefined): MarketQuoteSide | undefined {
  if (price === undefined || previous?.price === price) return previous;

  const direction = previous ? (price > previous.price ? "up" : "down") : undefined;
  return { price, direction };
}

export function useMarketSocket(symbols: MarketSymbol[]) {
  const [quotes, setQuotes] = useState<MarketQuotes>({});
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

    const receivePrice = (tick: SocketQuote) => {
      if (typeof tick?.symbol !== "string") return;

      const symbol = symbolsByKey.get(getBaseSymbol(tick.symbol));
      if (!symbol) return;

      const { timestamp } = tick;
      const ask = finitePrice(tick.ask);
      const bid = finitePrice(tick.bid) ?? (ask === undefined ? finitePrice(tick.price) : undefined);
      if (bid === undefined && ask === undefined) return;

      const latest = latestTimes.get(symbol);
      if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || latest === undefined || timestamp >= latest) {
        if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
          latestTimes.set(symbol, timestamp);
        }
        setQuotes((current) => {
          const previous = current[symbol];
          const nextBid = updateSide(previous?.bid, bid);
          const nextAsk = updateSide(previous?.ask, ask);
          if (previous?.bid === nextBid && previous?.ask === nextAsk) return current;

          return { ...current, [symbol]: { bid: nextBid, ask: nextAsk } };
        });
      }

      if (bid !== undefined) {
        for (const listener of listeners.current) listener({ symbol, timestamp, price: bid });
      }
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

  return { quotes, subscribeToTicks };
}
