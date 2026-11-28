import { Button } from "@/src/components/ui/button";
import "./OrderPanel.css";
import { useState } from "react";
import type { FormEvent } from "react";
import type { OpenTradeRequest } from "@/src/services/api/trade/trade.types";
import type { PendingOpenTrade } from "../utils/openTradeSubmission";

type OrderPanelProps = {
  accountId?: string;
  symbol: string;
  displaySymbol: string;
  busy: boolean;
  onOpen: (payload: OpenTradeRequest) => void;
  openPhase?: PendingOpenTrade["phase"];
  openFeedback?: { success: boolean; message: string };
  onRetryOpen: () => void;
};

function readOptionalPrice(values: FormData, name: string) {
  const value = values.get(name);
  return typeof value === "string" && value !== "" ? Number(value) : undefined;
}

export default function OrderPanel({
  accountId,
  symbol,
  displaySymbol,
  busy,
  onOpen,
  openPhase,
  openFeedback,
  onRetryOpen,
}: OrderPanelProps) {
  const [validationError, setValidationError] = useState("");
  const [base, quote] = symbol.split("/");

  function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountId || !symbol || busy || openPhase) return;

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (!(submitter instanceof HTMLButtonElement)) return;

    const side = submitter.value;
    if (side !== "Buy" && side !== "Sell") return;

    const values = new FormData(event.currentTarget);
    const lots = Number(values.get("lots"));
    const stopLoss = readOptionalPrice(values, "stop_loss");
    const takeProfit = readOptionalPrice(values, "take_profit");

    if (!Number.isFinite(lots) || lots <= 0 || [stopLoss, takeProfit].some(
      (price) => price !== undefined && (!Number.isFinite(price) || price <= 0),
    )) {
      setValidationError("Enter positive values for lots and any exit prices.");
      return;
    }

    setValidationError("");
    onOpen({
      account_id: accountId,
      symbol,
      type: side,
      lots,
      stop_loss: stopLoss,
      take_profit: takeProfit,
    });
  }

  return (
    <div className="order-bar-panel order-panel-scroll p-4">
      <form aria-label="Market trade" onSubmit={submitTrade} className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Market</span>
          <strong className="text-sm">{displaySymbol}</strong>
        </div>

        <fieldset disabled={busy || !!openPhase || !accountId || !symbol} className="min-w-0 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block">Volume (lots)</span>
            <input
              className="field-box w-full rounded-lg px-3 py-2"
              name="lots"
              type="number"
              inputMode="decimal"
              min="0.00000001"
              step="any"
              defaultValue="0.10"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Take profit {quote && `(${quote})`}</span>
            <input
              className="field-box w-full rounded-lg px-3 py-2"
              name="take_profit"
              type="number"
              inputMode="decimal"
              min="0.00000001"
              step="any"
              placeholder="Optional"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Stop loss {quote && `(${quote})`}</span>
            <input
              className="field-box w-full rounded-lg px-3 py-2"
              name="stop_loss"
              type="number"
              inputMode="decimal"
              min="0.00000001"
              step="any"
              placeholder="Optional"
            />
          </label>

          <div className="flex gap-2">
            <Button variant="unstyled"
              type="submit"
              value="Buy"
              className="flex-1 rounded-lg bg-[#1FAE6A] px-2 py-2 font-semibold text-white hover:bg-[#1b9c5f] disabled:opacity-50"
            >
              Buy {base}
            </Button>
            <Button variant="unstyled"
              type="submit"
              value="Sell"
              className="flex-1 rounded-lg bg-[#E5404C] px-2 py-2 font-semibold text-white hover:bg-[#d63943] disabled:opacity-50"
            >
              Sell {base}
            </Button>
          </div>
        </fieldset>

        {!accountId && <p className="mt-2 text-sm">Start an account session to trade.</p>}
        {openPhase === "sending" && <p className="mt-2 text-sm" role="status">Submitting trade...</p>}
        {openPhase === "pending" && <p className="mt-2 text-sm" role="status">Pending execution</p>}
        {openPhase === "uncertain" && (
          <div className="mt-2 grid gap-2 text-sm">
            <p role="status">Trade outcome unknown. Retry the original order.</p>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onRetryOpen}>
              Retry original order
            </Button>
          </div>
        )}
        {validationError ? (
          <p className="mt-2 text-sm" role="alert">{validationError}</p>
        ) : openFeedback && (
          <p className="mt-2 text-sm" role={openFeedback.success ? "status" : "alert"}>
            {openFeedback.message}
          </p>
        )}
      </form>

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
