import { Tab, Tabs } from "@mui/material";

const MARKET_TABS = [
  { value: "favorite", label: "Favorite" },
  { value: "Forex", label: "Forex" },
  { value: "Crypto", label: "Crypto" },
  { value: "Metals", label: "Metals" },
] as const;

export type MarketCategory = (typeof MARKET_TABS)[number]["value"];

type MarketTabsProps = {
  value: MarketCategory;
  onChange: (value: MarketCategory) => void;
};

export default function MarketTabs({ value, onChange }: MarketTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: MarketCategory) => onChange(nextValue)}
      variant="scrollable"
      scrollButtons={false}
      aria-label="Market categories"
      className="market-tabs-control"
      sx={{
        minHeight: 34,
        "& .MuiTabs-list": { gap: "18px" },
        "& .MuiTabs-indicator": { height: 2, backgroundColor: "#F5B800" },
        "& .MuiTab-root": {
          minWidth: 0,
          minHeight: 34,
          padding: 0,
          color: "#6f7785",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          textTransform: "none",
        },
        "& .MuiTab-root.Mui-selected": { color: "#F5B800", fontWeight: 700 },
      }}
    >
      {MARKET_TABS.map((tab) => <Tab key={tab.value} value={tab.value} label={tab.label} disableRipple />)}
    </Tabs>
  );
}
