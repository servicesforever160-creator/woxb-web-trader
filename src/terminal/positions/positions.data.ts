import type { Trade } from "@/src/services/api/trade/trade.types";

export type PositionTabId = "positions" | "orders" | "history" | "accountHistory";

export const POSITION_TABS: { id: PositionTabId; label: string }[] = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Orders" },
  { id: "history", label: "History" },
  { id: "accountHistory", label: "Account History" },
];

type TradeTabId = Exclude<PositionTabId, "accountHistory">;

export const TRADE_COLUMNS: Record<TradeTabId, string[]> = {
  positions: ["Symbol", "Type", "Lots", "Open Price", "Market Price", "SL", "TP", "P/L", "Action"],
  orders: ["Order", "Symbol", "Type", "Lots", "Open Price", "Opened", "Status"],
  history: ["Order", "Symbol", "Type", "Lots", "Open Price", "Close Price", "Closed", "P/L"],
};

export function getTradeCells(tab: TradeTabId, trade: Trade): string[] {
  const tradeDetails = [trade.symbol, trade.type, trade.lots, trade.open_price];

  if (tab === "orders") {
    return [trade.order_number, ...tradeDetails, trade.open_time ?? "-", "Open"];
  }

  if (tab === "history") {
    return [
      trade.order_number,
      ...tradeDetails,
      trade.close_price ?? "-",
      trade.close_time ?? "-",
      trade.pnl,
    ];
  }

  return [
    ...tradeDetails,
    trade.current_price ?? "-",
    trade.stop_loss ?? "-",
    trade.take_profit ?? "-",
    trade.pnl,
  ];
}
