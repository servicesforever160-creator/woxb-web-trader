import { Tab, Tabs } from "@mui/material";

type MarketTabsProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function MarketTabs({ categories, value, onChange }: MarketTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, nextValue: string) => onChange(nextValue)}
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
      <Tab value="favorite" label="Favorites" disableRipple />
      {categories.map((category) => (
        <Tab
          key={category}
          value={category}
          label={category.toLowerCase().replace(/(^|[_ -])\w/g, (letter) => letter.toUpperCase()).replaceAll("_", " ")}
          disableRipple
        />
      ))}
    </Tabs>
  );
}
