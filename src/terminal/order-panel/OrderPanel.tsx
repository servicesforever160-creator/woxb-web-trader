import "./OrderPanel.css"
import { useState } from "react";
import { FormControl, MenuItem, Select, Tab, Tabs } from "@mui/material";
import type { Theme } from "../hooks/useTheme";

export default function OrderPanel({ theme }: { theme: Theme }) {
  const [volumeUnit, setVolumeUnit] = useState("Lots");
  const [orderType, setOrderType] = useState("market");
  const [entryPrice, setEntryPrice] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const surfaceColor = theme === "dark" ? "#1A1A24" : "#E2E2E8";
  const textColor = theme === "dark" ? "#FFFFFF" : "#202028";

  return (
    <div className="order-bar-panel order-panel-scroll p-4">
        <Tabs
          value={orderType}
          onChange={(_, nextOrderType) => setOrderType(nextOrderType)}
          aria-label="Order type"
          className="order-type-tabs"
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: 42,
            mb: 2,
            borderBottom: "1px solid rgba(212,168,83,.25)",
            "& .MuiTabs-list": { gap: "22px" },
            "& .MuiTabs-indicator": { height: 2, backgroundColor: "#D4A853" },
            "& .MuiTab-root": {
              minWidth: 0,
              minHeight: 42,
              padding: 0,
              color: "#6b6f7b",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              textTransform: "none",
            },
            "& .MuiTab-root.Mui-selected": { color: "#D4A853", fontWeight: 700 },
          }}
        >
          <Tab value="market" label="Market" disableRipple />
          <Tab value="limit" label="Limit" disableRipple />
          <Tab value="stop" label="Stop" disableRipple />
        </Tabs>

        {/* <!-- Sell / Buy buttons --> */}
        <div className="relative flex gap-1.5 mb-4">
          <button className="flex-1 bg-[#E5404C] hover:bg-[#d63943] rounded-lg py-2.5 px-3 text-left transition-colors">
            <div className="text-white text-xs font-medium opacity-90">Sell</div>
            <div className="text-white text-base font-bold tabular leading-tight">
              64,062.47
            </div>
          </button>
          <button className="flex-1 bg-[#1FAE6A] hover:bg-[#1b9c5f] rounded-lg py-2.5 px-3 text-left transition-colors">
            <div className="text-white text-xs font-medium opacity-90">BUY</div>
            <div className="text-white text-base font-bold tabular leading-tight">
              64,062.47
            </div>
          </button>
          <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-[#0d0e12] border border-white/10 text-white/70 text-[10px] px-1.5 py-0.5 rounded tabular">
            35.2
          </span>
        </div>

        {/* <!-- Volume --> */}
        <div className="text-white/50 text-xs mb-1.5">Volume</div>
        <div className="flex items-stretch stepper-box rounded-lg overflow-hidden mb-3">
          <button className="px-3 text-white/70 hover:text-white text-lg font-medium">
            −
          </button>
          <div className="flex-1 flex items-center justify-center text-white text-sm font-medium tabular">
            0.10
          </div>
          <button className="px-3 text-white/70 hover:text-white text-lg font-medium">
            +
          </button>
        </div>

        {/* Volume unit — Material UI Select */}
        <FormControl fullWidth size="small" className="order-unit-select">
          <Select
            value={volumeUnit}
            onChange={(event) => setVolumeUnit(event.target.value)}
            aria-label="Volume unit"
            MenuProps={{
              slotProps: {
                paper: {
                sx: {
                  mt: 0.5,
                  color: textColor,
                  backgroundColor: surfaceColor,
                  border: "1px solid rgba(212,168,83,0.25)",
                  borderRadius: "8px",
                  "& .MuiMenuItem-root": { fontSize: "0.875rem" },
                  "& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected": {
                    backgroundColor: "rgba(244,180,0,0.12)",
                  },
                },
                },
              },
            }}
            sx={{
              mb: 0.25,
              color: textColor,
              backgroundColor: surfaceColor,
              borderRadius: "8px",
              fontSize: "0.875rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,168,83,0.25)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,168,83,0.4)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D4A853" },
              "& .MuiSelect-select": { py: 1.25, px: 1.5 },
              "& .MuiSvgIcon-root": { color: "#8a8d96" },
            }}
          >
            <MenuItem value="Lots">Lots</MenuItem>
            <MenuItem value="Units">Units</MenuItem>
            <MenuItem value="Contracts">Contracts</MenuItem>
          </Select>
        </FormControl>

        <div className="text-white/40 text-xs mb-4">Available: 2.35 Lots</div>

        {/* <!-- Take Profit --> */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8a8d96"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
            </svg>
            <span className="text-white text-sm">Take Profit</span>
          </div>
          <label className="switch relative inline-block">
            <input type="checkbox" />
            <span className="switch-track"></span>
          </label>
        </div>
        <div className="field-box rounded-lg flex items-center justify-between px-3 py-2.5 mb-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={takeProfit}
            onChange={(event) => setTakeProfit(event.target.value.replace(/\D/g, ""))}
            placeholder="Price"
            aria-label="Take Profit price"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <span className="text-white/50 text-xs font-medium">USDT</span>
        </div>

        {orderType !== "market" && (
          <div className="field-box rounded-lg flex items-center justify-between px-3 py-2.5 mb-4">
            <input
              type="text"
              inputMode="decimal"
              value={entryPrice}
              onChange={(event) => setEntryPrice(event.target.value.replace(/[^0-9.]/g, ""))}
              placeholder={`${orderType === "limit" ? "Limit" : "Stop"} price`}
              aria-label={`${orderType} order price`}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            <span className="text-white/50 text-xs font-medium">USDT</span>
          </div>
        )}

        {/* <!-- Stop Loss --> */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8a8d96"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
            </svg>
            <span className="text-white text-sm">Stop Loss</span>
          </div>
          <label className="switch relative inline-block">
            <input type="checkbox" />
            <span className="switch-track"></span>
          </label>
        </div>
        <div className="field-box rounded-lg flex items-center justify-between px-3 py-2.5 mb-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={stopLoss}
            onChange={(event) => setStopLoss(event.target.value.replace(/\D/g, ""))}
            placeholder="Price"
            aria-label="Stop Loss price"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <span className="text-white/50 text-xs font-medium">USDT</span>
        </div>

        {/* <!-- Buy BTC button --> */}
        <button className="w-full bg-[#D4A853] hover:bg-[#F0C870] text-[#1a1505] font-bold text-sm rounded-lg py-3 mb-4 transition-colors">
          {orderType === "market" ? "Buy BTC" : `Place ${orderType === "limit" ? "Limit" : "Stop"} Buy`}
        </button>

        {/* <!-- Margin info --> */}
        <div className="space-y-1.5 mb-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/50">Margin Required</span>
            <span className="text-white tabular">$640.62</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Value</span>
            <span className="text-white tabular">$6,406.21</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Margin Level</span>
            <span className="text-[#1FAE6A] tabular font-medium">1,592.35%</span>
          </div>
        </div>

        {/* <!-- Market Sentiment --> */}
        <div className="border-t border-white/5 pt-4 mb-5">
          <div className="text-white text-sm font-medium mb-3">
            Market Sentiment
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-[#14b8a6] text-lg font-bold tabular">62%</div>
              <div className="text-white/60 text-xs">Buy</div>
            </div>
            <div className="donut">
              <div className="donut-inner"></div>
            </div>
            <div className="text-center">
              <div className="text-[#FF4D57] text-lg font-bold tabular">62%</div>
              <div className="text-white/60 text-xs">Sell</div>
            </div>
          </div>
        </div>

        {/* <!-- Economic Calendar --> */}
        <div className="border-t border-white/5 pt-4">
          <div className="text-white text-sm font-medium mb-3">
            Economic Calendar
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 tabular w-10 shrink-0">12:30</span>
              <span className="currency-badge px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">
                USD
              </span>
              <span className="text-white/80 flex-1">Core Retail Sales (MoM)</span>
              <span className="impact-high px-2 py-0.5 rounded text-[10px] font-semibold shrink-0">
                High
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 tabular w-10 shrink-0">14:00</span>
              <span className="currency-badge px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">
                GBP
              </span>
              <span className="text-white/80 flex-1">CPI (YoY)</span>
              <span className="impact-high px-2 py-0.5 rounded text-[10px] font-semibold shrink-0">
                High
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40 tabular w-10 shrink-0">15:30</span>
              <span className="currency-badge px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0">
                USD
              </span>
              <span className="text-white/80 flex-1">Crude Oil Inventories</span>
              <span className="impact-medium px-2 py-0.5 rounded text-[10px] font-semibold shrink-0">
                Medium
              </span>
            </div>
          </div>
        </div>
    </div>
  );
}
