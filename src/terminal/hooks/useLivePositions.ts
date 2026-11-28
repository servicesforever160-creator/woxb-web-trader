import { useEffect, useState } from "react";
import { getOpenTrades } from "@/src/services/api/trade/get-open-trades.api";
import type { SubscribeToTradeEvents, Trade, TradeSocketEvent } from "@/src/services/api/trade/trade.types";

type TradeChange = Extract<TradeSocketEvent, { trade: Trade }>;

function applyTradeChange(positions: Map<string, Trade>, { type, trade }: TradeChange) {
  if (type === "close") {
    positions.delete(trade.id);
  } else {
    positions.set(trade.id, trade);
  }
}

export const TRADE_PAGE_SIZE = 10;

export function useLivePositions(accountId: string | undefined, subscribeToTrades: SubscribeToTradeEvents) {
  const [positions, setPositions] = useState(() => new Map<string, Trade>());
  const [closed, setClosed] = useState(() => new Map<string, Trade>());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [reconnects, setReconnects] = useState(0);

  useEffect(() => {
    if (!accountId) return;

    const closedIds = new Set<string>();
    const changesDuringLoad = new Map<string, TradeChange>();
    let request: AbortController | undefined;

    async function loadPositions() {
      request?.abort();
      request = new AbortController();
      const { signal } = request;
      changesDuringLoad.clear();
      const snapshot = new Map<string, Trade>();

      for (let page = 1; ; page++) {
        const result = await getOpenTrades(page, TRADE_PAGE_SIZE, signal);
        if (signal.aborted) return;

        if (!result.success || !Array.isArray(result.data?.data) || !result.data.pagination) {
          request = undefined;
          changesDuringLoad.clear();
          setError(result.success ? "The trade list response is incomplete." : result.message);
          setReady(true);
          return;
        }

        for (const trade of result.data.data) {
          if ((!trade.account_id || trade.account_id === accountId) && !closedIds.has(trade.id)) {
            snapshot.set(trade.id, trade);
          }
        }
        if (!result.data.pagination.hasNextPage || page >= result.data.pagination.totalPages) break;
      }

      for (const change of changesDuringLoad.values()) applyTradeChange(snapshot, change);
      request = undefined;
      changesDuringLoad.clear();
      setPositions(snapshot);
      setError("");
      setReady(true);
    }

    const unsubscribe = subscribeToTrades((event) => {
      if (event.type === "execution") return;

      if (event.type === "reconnect") {
        setReconnects((current) => current + 1);
        void loadPositions();
        return;
      }

      const { trade } = event;
      if (trade?.account_id !== accountId || !trade.id) return;
      if (event.type !== "close" && closedIds.has(trade.id)) return;

      if (event.type === "close") {
        closedIds.add(trade.id);
        setClosed((current) => new Map(current).set(trade.id, trade));
      }

      if (request) changesDuringLoad.set(trade.id, event);
      setPositions((current) => {
        const next = new Map(current);
        applyTradeChange(next, event);
        return next;
      });
    });
    void loadPositions();

    return () => {
      request?.abort();
      unsubscribe();
    };
  }, [accountId, subscribeToTrades]);

  return { positions, closed, ready, error, reconnects };
}
