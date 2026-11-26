export type MarketDirection =
  | "bullish"
  | "bearish"
  | "neutral";

export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketState = {
  symbol: string;
  asset: string;

  price: number;
  previousPrice: number;
  change: number;

  candles: Candle[];

  sentiment: number;
  direction: MarketDirection;

  support: number;
  resistance: number;

  note: string;

  loading: boolean;
  error?: string;
};

export type MarketTick = {
  symbol: string;
  price: number;
  timestamp?: number;
};

export type MarketPriceHandler = (
  symbol: string,
  price: number,
  timestamp: number,
) => void;

export type MarketCard = {
  symbol: string;
  asset: string;
};