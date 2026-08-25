export type Instrument = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  trend: "up" | "down";
  icon: string;
};

// Static development data. The object shape is the same one expected from a market API.
export const INSTRUMENTS: Instrument[] = [
  { symbol: "BTC/USDT", name: "Bitcoin / Tether", price: "63,152.45", change: "0.42%", trend: "down", icon: "coin" },
  { symbol: "XAU/USD", name: "Gold / US Dollar", price: "2,387.65", change: "0.62%", trend: "up", icon: "gold" },
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.08562", change: "0.08%", trend: "down", icon: "eu" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", price: "1.27043", change: "0.15%", trend: "up", icon: "gb" },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", price: "0.66542", change: "0.21%", trend: "up", icon: "au" },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", price: "157.284", change: "0.34%", trend: "down", icon: "jp" },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", price: "0.90164", change: "0.12%", trend: "up", icon: "ch" },
  { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", price: "0.61208", change: "0.18%", trend: "down", icon: "nz" },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", price: "1.36651", change: "0.09%", trend: "up", icon: "ca" },
  { symbol: "EUR/GBP", name: "Euro / British Pound", price: "0.85456", change: "0.06%", trend: "down", icon: "eu" },
  { symbol: "EUR/JPY", name: "Euro / Japanese Yen", price: "170.741", change: "0.27%", trend: "up", icon: "jp" },
  { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", price: "199.731", change: "0.31%", trend: "up", icon: "gb" },
];

export const DEFAULT_TOPBAR_SYMBOLS = ["BTC/USDT", "XAU/USD", "EUR/USD", "GBP/USD"];
