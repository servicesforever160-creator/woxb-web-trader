export type PositionTabId = "positions" | "orders" | "history" | "accountHistory";

export type TableData = {
  columns: string[];
  rows: string[][];
  total?: string[];
};

export const POSITION_TABS: { id: PositionTabId; label: string }[] = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Orders" },
  { id: "history", label: "History" },
  { id: "accountHistory", label: "Account History" },
];

export const TAB_DATA: Record<PositionTabId, TableData> = {
  positions: {
    columns: ["Symbol", "Type", "Volume", "Open Price", "Market Price", "SL", "TP", "P/L (USD)", "P/L (%)", "Swap", "Action"],
    rows: [
      ["EUR/USD", "BUY", "0.50", "1.08210", "1.08210", "1.08", "1.08", "176.00", "+1.63%", "-2.10", "+"],
      ["XAU/USD", "SELL", "0.20", "2,390.10", "2,390.10", "2.39", "2.39", "49.00", "+1.63%", "-2.10", ""],
      ["BTC/USDT", "BUY", "0.10", "63,850", "63,850", "63.8", "63.8", "21.19", "+1.63%", "-2.10", ""],
    ],
    total: ["Total", "", "", "", "", "", "", "246.19", "+1.63%", "-2.10", ""],
  },
  orders: {
    columns: ["Order", "Symbol", "Type", "Volume", "Price", "Stop Loss", "Take Profit", "Created", "Status", "Action"],
    rows: [
      ["#10482", "EUR/USD", "BUY LIMIT", "0.25", "1.08050", "1.07700", "1.08600", "Today, 12:10", "Pending", "Cancel"],
      ["#10479", "XAU/USD", "SELL STOP", "0.10", "2,381.00", "2,390.00", "2,365.00", "Today, 11:45", "Pending", "Cancel"],
    ],
  },
  history: {
    columns: ["Ticket", "Symbol", "Type", "Volume", "Open Price", "Close Price", "Closed", "P/L (USD)", "Status"],
    rows: [
      ["#10471", "GBP/USD", "BUY", "0.30", "1.26920", "1.27140", "Today, 10:22", "+66.00", "Closed"],
      ["#10466", "USD/JPY", "SELL", "0.20", "157.640", "157.710", "Today, 09:56", "-14.00", "Closed"],
      ["#10455", "AUD/USD", "BUY", "0.50", "0.66380", "0.66490", "Yesterday", "+55.00", "Closed"],
    ],
  },
  accountHistory: {
    columns: ["Date", "Transaction", "Reference", "Amount", "Balance", "Status"],
    rows: [
      ["Today, 09:00", "Deposit", "DEP-91823", "+$1,000.00", "$6,406.21", "Completed"],
      ["Yesterday, 16:42", "Trade settlement", "TRD-10455", "+$55.00", "$5,406.21", "Completed"],
      ["18 Jun, 12:18", "Withdrawal", "WDL-71640", "-$250.00", "$5,351.21", "Completed"],
    ],
  },
};
