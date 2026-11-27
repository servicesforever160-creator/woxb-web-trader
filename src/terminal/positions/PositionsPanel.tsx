import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { getOpenTrades } from "@/src/services/api/trade/get-open-trades.api";
import { getTradeHistory } from "@/src/services/api/trade/get-trade-history.api";
import type { Trade, TradePage } from "@/src/services/api/trade/trade.types";
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
  revision: number;
  busy: boolean;
  onClose: (tradeId: string) => Promise<{ success: boolean; message: string }>;
};

type TradeTabId = Exclude<PositionTabId, "accountHistory">;

type TradeTableProps = PositionsPanelProps & {
  tab: TradeTabId;
};

type TradeLoad = {
  page: number;
  revision: number;
  data?: TradePage;
  error?: string;
};

function TradeTable({ tab, accountId, revision, busy, onClose }: TradeTableProps) {
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<TradeLoad>();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string }>();
  const columns = TRADE_COLUMNS[tab];

  useEffect(() => {
    if (!accountId) return;

    let active = true;
    const request = tab === "history"
      ? getTradeHistory(accountId, page)
      : getOpenTrades(page);

    void request.then((result) => {
      if (!active) return;

      if (!result.success) {
        setLoaded({ page, revision, error: result.message });
        return;
      }

      if (!Array.isArray(result.data?.data) || !result.data.pagination) {
        setLoaded({ page, revision, error: "The trade list response is incomplete." });
        return;
      }

      const lastPage = Math.max(result.data.pagination.totalPages, 1);
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setLoaded({ page, revision, data: result.data });
    });

    return () => {
      active = false;
    };
  }, [accountId, page, revision, tab]);

  const current = loaded?.page === page && loaded.revision === revision ? loaded : undefined;
  const trades = current?.data?.data ?? [];
  const pagination = current?.data?.pagination;

  async function closePosition(trade: Trade) {
    setFeedback(undefined);
    setFeedback(await onClose(trade.id));
  }

  let message = tab === "history" ? "No closed trades." : "No open trades.";
  if (!accountId) message = "Start an account session to view trades.";
  else if (!current) message = "Loading trades?";
  else if (current.error) message = current.error;

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
                <span role={current?.error ? "alert" : "status"}>{message}</span>
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

      {(page > 1 || pagination?.hasNextPage) && (
        <nav aria-label="Trade pages" className="flex items-center gap-3 px-3 py-2 text-xs">
          <Button variant="unstyled"
            type="button"
            className="table-action"
            disabled={page === 1 || !current}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button variant="unstyled"
            type="button"
            className="table-action"
            disabled={!pagination?.hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

export default function PositionsPanel(props: PositionsPanelProps) {
  const [activeTab, setActiveTab] = useState<PositionTabId>("positions");

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
        <TradeTable key={activeTab} tab={activeTab} {...props} />
      )}
    </section>
  );
}
