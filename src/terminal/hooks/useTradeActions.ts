import { useRef, useState } from "react";
import { closeTrade } from "@/src/services/api/trade/close-trade.api";
import { openTrade } from "@/src/services/api/trade/open-trade.api";
import type { OpenTradeRequest } from "@/src/services/api/trade/trade.types";

export function useTradeActions() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);

  async function execute(request: () => Promise<{ success: boolean; message: string }>) {
    if (pending.current) {
      return { success: false, message: "A trade request is already in progress." };
    }

    pending.current = true;
    setBusy(true);

    try {
      const result = await request();
      if (result.success) setRevision((current) => current + 1);
      return result;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return {
    busy,
    revision,
    open: (payload: OpenTradeRequest) => execute(() => openTrade(payload)),
    close: (tradeId: string) => execute(() => closeTrade({ trade_id: tradeId })),
  };
}
