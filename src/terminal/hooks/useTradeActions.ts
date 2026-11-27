import { useRef, useState } from "react";
import { closeTrade } from "@/src/services/api/trade/close-trade.api";
import { openTrade } from "@/src/services/api/trade/open-trade.api";
import type { OpenTradeRequest } from "@/src/services/api/trade/trade.types";
import { playTradeSound, prepareTradeAudio } from "../utils/tradeSound";
import type { TradeSound } from "../utils/tradeSound";

export function useTradeActions() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);

  async function execute(
    sound: TradeSound,
    request: () => Promise<{ success: boolean; message: string }>,
  ) {
    if (pending.current) {
      return { success: false, message: "A trade request is already in progress." };
    }

    pending.current = true;
    setBusy(true);

    const audio = prepareTradeAudio();

    try {
      const result = await request();
      if (result.success) {
        void playTradeSound(audio, sound);
      }
      return result;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return {
    busy,
    open: (payload: OpenTradeRequest) => execute("open", () => openTrade(payload)),
    close: (tradeId: string) => execute("close", () => closeTrade({ trade_id: tradeId })),
  };
}
