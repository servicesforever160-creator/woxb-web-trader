export type TradeSide = "Buy" | "Sell";

export type OpenTradeRequest = {
  account_id: string;
  symbol: string;
  type: TradeSide;
  lots: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  comment?: string;
};

export type CloseTradeRequest = {
  trade_id: string;
  price?: number;
};

export type Trade = {
  id: string;
  account_id?: string;
  order_number: string;
  symbol: string;
  type: TradeSide;
  lots: string;
  open_price: string;
  current_price?: string | null;
  stop_loss?: string | null;
  take_profit?: string | null;
  open_time?: string | null;
  close_price: string | null;
  close_time: string | null;
  duration?: number | null;
  pnl: string;
};

export type TradePage = {
  data: Trade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
