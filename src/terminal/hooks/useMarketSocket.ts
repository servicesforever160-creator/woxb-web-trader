import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { disconnectSocket, getSocket } from "@/src/services/socket/socket";
import type { MarketTick } from "@/src/types/market";

export function useMarketSocket(symbol: string, onPrice: (tick: MarketTick) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return;

    socketRef.current = getSocket(accessToken);

    return () => {
      socketRef.current = null;
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const subscribe = () => {
      socket.emit("market:subscribe", { symbols: [symbol] });
    };

    const receivePrice = (tick: MarketTick) => {
      const matchesSymbol = tick?.symbol === symbol;

      console.log("[Market chart] Socket tick", {
        selectedSymbol: symbol,
        tick,
        matchesSymbol,
      });

      if (matchesSymbol) onPrice(tick);
    };

    socket.on("market:price", receivePrice);
    socket.on("connect", subscribe);
    if (socket.connected) subscribe();

    return () => {
      socket.off("connect", subscribe);
      socket.off("market:price", receivePrice);
    };
  }, [symbol, onPrice]);
}
