import { Button } from "@/src/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { getTradeHistory } from "@/src/services/api/trade/get-trade-history.api";
import type { SubscribeToTradeEvents, Trade, TradePage } from "@/src/services/api/trade/trade.types";
import { TRADE_PAGE_SIZE, useLivePositions } from "../hooks/useLivePositions";
import "./Positions.css";
import { POSITION_TABS, TRADE_COLUMNS, getTradeCells } from "./positions.data";
import type { PositionTabId } from "./positions.data";

function getCellClass(value: string, column: string) {
  if (column === "Type") {
    return value === "Sell" ? "cell-negative cell-strong" : "cell-positive cell-strong";
  }
  if (column === "P/L") return value.startsWith("-") ? "cell-negative" : "cell-positive";
  if (column === "Status") return "cell-status";

  return "";
}

type PositionsPanelProps = {
  accountId?: string;
  subscribeToTrades: SubscribeToTradeEvents;
  busy: boolean;
  onClose: (tradeId: string) => Promise<{ success: boolean; message: string }>;
};

type TradeTabId = Exclude<PositionTabId, "accountHistory">;

type TradeTableProps = Omit<PositionsPanelProps, "subscribeToTrades"> & {
  tab: TradeTabId;
  live: ReturnType<typeof useLivePositions>;
};

type TradeLoad = {
  page: number;
  data?: TradePage;
  error?: string;
};

function TradeTable({ tab, accountId, live, busy, onClose }: TradeTableProps) {
  const [requestedPage, setPage] = useState(1);
  const [loaded, setLoaded] = useState<TradeLoad>();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string }>();
  const columns = TRADE_COLUMNS[tab];
  const isHistory = tab === "history";
  const { positions, closed, ready, error: positionsError, reconnects } = live;
  const openTrades = useMemo(() => [...positions.values()].sort((first, second) =>
    (second.open_time ?? "").localeCompare(first.open_time ?? ""),
  ), [positions]);
  const totalOpenPages = Math.max(1, Math.ceil(openTrades.length / TRADE_PAGE_SIZE));
  const page = isHistory ? requestedPage : Math.min(requestedPage, totalOpenPages);

  useEffect(() => {
    if (!accountId || !isHistory) return;

    const controller = new AbortController();

    void getTradeHistory(accountId, page, TRADE_PAGE_SIZE, controller.signal).then((result) => {
      if (controller.signal.aborted) return;

      if (!result.success) {
        setLoaded({ page, error: result.message });
        return;
      }

      if (!Array.isArray(result.data?.data) || !result.data.pagination) {
        setLoaded({ page, error: "The trade list response is incomplete." });
        return;
      }

      const lastPage = Math.max(result.data.pagination.totalPages, 1);
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setLoaded({ page, data: result.data });
    });

    return () => controller.abort();
  }, [accountId, isHistory, page, reconnects]);

  const current = loaded?.page === page ? loaded : undefined;
  const historyTrades = useMemo(() => {
    const saved = current?.data?.data ?? [];
    if (page !== 1 || closed.size === 0) return saved;

    const merged = new Map(saved.map((trade) => [trade.id, trade]));
    for (const [id, trade] of closed) merged.set(id, trade);

    return [...merged.values()].sort((first, second) =>
      (second.close_time ?? "").localeCompare(first.close_time ?? ""),
    );
  }, [closed, current, page]);
  const start = (page - 1) * TRADE_PAGE_SIZE;
  const trades = isHistory ? historyTrades.slice(0, TRADE_PAGE_SIZE) : openTrades.slice(start, start + TRADE_PAGE_SIZE);
  const hasNextPage = isHistory
    ? current?.data?.pagination.hasNextPage || historyTrades.length > TRADE_PAGE_SIZE
    : page < totalOpenPages;
  const loadedPage = isHistory ? Boolean(current) : ready;
  const error = isHistory ? current?.error : positionsError;

  async function closePosition(trade: Trade) {
    setFeedback(undefined);
    setFeedback(await onClose(trade.id));
  }

  let message = tab === "history" ? "No closed trades." : "No open trades.";
  if (!accountId) message = "Start an account session to view trades.";
  else if (error) message = error;
  else if (!loadedPage) message = "Loading trades…";

  return (
    <div className="positions-table-wrap">
      <table className="positions-table">
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              {getTradeCells(tab, trade).map((value, index) => (
                <td key={columns[index]} className={getCellClass(value, columns[index])}>
                  {value}
                </td>
              ))}
              {tab === "positions" && (
                <td>
                  <Button variant="unstyled"
                    type="button"
                    className="table-action"
                    disabled={busy}
                    aria-label={`Close trade ${trade.order_number}`}
                    onClick={() => void closePosition(trade)}
                  >
                    Close
                  </Button>
                </td>
              )}
            </tr>
          ))}
          {trades.length === 0 && (
            <tr>
              <td className="positions-empty" colSpan={columns.length}>
                <span role={error ? "alert" : "status"}>{message}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {feedback && (
        <p className="px-3 py-2 text-xs" role={feedback.success ? "status" : "alert"}>
          {feedback.message}
        </p>
      )}

      {(page > 1 || hasNextPage) && (
        <nav aria-label="Trade pages" className="flex items-center gap-3 px-3 py-2 text-xs">
          <Button variant="unstyled"
            type="button"
            className="table-action"
            disabled={page === 1 || !loadedPage}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button variant="unstyled"
            type="button"
            className="table-action"
            disabled={!hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

export default function PositionsPanel({ subscribeToTrades, ...props }: PositionsPanelProps) {
  const [activeTab, setActiveTab] = useState<PositionTabId>("positions");
  const live = useLivePositions(props.accountId, subscribeToTrades);

  return (
    <section className="positions-panel" aria-label="Trading activity">
      <Tabs
        value={activeTab}
        onChange={(_, nextTab: PositionTabId) => setActiveTab(nextTab)}
        aria-label="Trading activity tabs"
        className="positions-tabs"
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 57,
          borderBottom: "1px solid rgba(212, 168, 83, .25)",
          "& .MuiTabs-indicator": { height: 2, backgroundColor: "#F5B800" },
          "& .MuiTabs-list": { gap: "30px" },
          "& .MuiTab-root": {
            minHeight: 57,
            minWidth: 0,
            padding: 0,
            color: "#718092",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            textTransform: "none",
          },
          "& .MuiTab-root.Mui-selected": { color: "#F5B800", fontWeight: 700 },
        }}
      >
        {POSITION_TABS.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            disableRipple
          />
        ))}
      </Tabs>
      {activeTab === "accountHistory" ? (
        <p className="positions-empty px-3 py-4">Account transaction history is unavailable.</p>
      ) : (
        <TradeTable key={activeTab} tab={activeTab} live={live} {...props} />
      )}
    </section>
  );
}
