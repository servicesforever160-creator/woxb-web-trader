import { useEffect, useEffectEvent, useRef, useState } from "react";
import { closeTrade } from "@/src/services/api/trade/close-trade.api";
import { openTrade } from "@/src/services/api/trade/open-trade.api";
import type { OpenTradeRequest, SubscribeToTradeEvents, TradeSocketEvent } from "@/src/services/api/trade/trade.types";
import { getBaseSymbol } from "../market-watch/symbols.data";
import { playTradeSound, prepareTradeAudio } from "../utils/tradeSound";
import {
  hasOpenTradeForAnotherAccount,
  loadOpenTrade,
  readOpenTradeBody,
  readTradeExecution,
  storeOpenTrade,
} from "../utils/openTradeSubmission";
import type { PendingOpenTrade } from "../utils/openTradeSubmission";

type OpenFeedback = { success: boolean; message: string };
type TradeExecution = NonNullable<ReturnType<typeof readTradeExecution>>;

type TradeActionsOptions = {
  accountId?: string;
  isRealAccount: boolean;
  subscribeToTrades: SubscribeToTradeEvents;
  isTradeSocketConnected: () => boolean;
};

export function useTradeActions({
  accountId,
  isRealAccount,
  subscribeToTrades,
  isTradeSocketConnected,
}: TradeActionsOptions) {
  const busyRef = useRef(false);
  const listening = useRef(false);
  const handledExecutions = useRef(new Set<string>());
  const openedTrades = useRef(new Set<string>());
  const executionsByTradeId = useRef(new Map<string, TradeExecution>());
  const audio = useRef<ReturnType<typeof prepareTradeAudio> | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [submission, setSubmission] = useState(() => loadOpenTrade(accountId));
  const submissionRef = useRef(submission);
  const [openFeedback, setOpenFeedback] = useState<OpenFeedback>();

  function remember(next: PendingOpenTrade | null) {
    submissionRef.current = next;
    storeOpenTrade(accountId, next);
    setSubmission(next);
  }

  function finishOpen(execution: TradeExecution) {
    openedTrades.current.clear();
    executionsByTradeId.current.clear();
    remember(null);
    setOpenFeedback({ success: execution.success, message: execution.message });
    if (execution.success && audio.current) void playTradeSound(audio.current, "open");
  }

  const onTradeEvent = useEffectEvent((event: TradeSocketEvent) => {
    if (!isRealAccount) return;

    const current = submissionRef.current;
    const original = current && readOpenTradeBody(current.body);
    if (event.type === "open") {
      const { trade } = event;
      if (
        !original || trade?.account_id !== original.account_id || !trade.id
        || trade.type !== original.type
        || typeof trade.symbol !== "string"
        || getBaseSymbol(trade.symbol) !== getBaseSymbol(original.symbol)
      ) return;

      openedTrades.current.add(trade.id);
      const execution = executionsByTradeId.current.get(trade.id);
      if (execution) finishOpen(execution);
      return;
    }

    if (event.type !== "execution") return;

    const execution = readTradeExecution(event.payload);
    if (!execution || handledExecutions.current.has(execution.orderLinkId)) return;

    handledExecutions.current.add(execution.orderLinkId);
    if (!original) return;

    if (!execution.tradeId) {
      finishOpen(execution);
    } else if (openedTrades.current.has(execution.tradeId)) {
      finishOpen(execution);
    } else {
      executionsByTradeId.current.set(execution.tradeId, execution);
    }
  });

  useEffect(() => {
    const unsubscribe = subscribeToTrades((event) => onTradeEvent(event));
    listening.current = true;

    return () => {
      listening.current = false;
      unsubscribe();
    };
  }, [subscribeToTrades]);

  function canSubmit() {
    if (busyRef.current) return false;
    if (!listening.current || !isTradeSocketConnected()) {
      setOpenFeedback({ success: false, message: "Waiting for the trade connection. Try again once connected." });
      return false;
    }
    return true;
  }

  async function sendOpen(next: PendingOpenTrade) {
    busyRef.current = true;
    setBusy(true);
    setOpenFeedback(undefined);
    remember({ ...next, phase: "sending" });
    audio.current = prepareTradeAudio();

    try {
      const result = await openTrade(next);
      if (!listening.current || submissionRef.current?.key !== next.key) return;

      if (result.success && isRealAccount) {
        remember({ ...next, phase: "pending" });
      } else if (!result.success && result.outcomeUnknown) {
        remember({ ...next, phase: "uncertain" });
      } else {
        openedTrades.current.clear();
        executionsByTradeId.current.clear();
        remember(null);
        setOpenFeedback({ success: result.success, message: result.message });
        if (result.success && audio.current) void playTradeSound(audio.current, "open");
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function open(payload: OpenTradeRequest) {
    if (submissionRef.current || payload.account_id !== accountId || !canSubmit()) return;
    if (hasOpenTradeForAnotherAccount(accountId)) {
      setOpenFeedback({ success: false, message: "An order for another account is still awaiting an outcome in this tab." });
      return;
    }

    void sendOpen({
      key: crypto.randomUUID(),
      body: JSON.stringify(payload),
      phase: "sending",
    });
  }

  function retryOpen() {
    const current = submissionRef.current;
    if (current?.phase === "uncertain" && canSubmit()) void sendOpen(current);
  }

  async function close(tradeId: string) {
    if (busyRef.current) return { success: false, message: "A trade request is already in progress." };

    busyRef.current = true;
    setBusy(true);
    const closeAudio = prepareTradeAudio();

    try {
      const result = await closeTrade({ trade_id: tradeId });
      if (result.success) void playTradeSound(closeAudio, "close");
      return result;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return { busy, open, close, retryOpen, openFeedback, openPhase: submission?.phase };
}
