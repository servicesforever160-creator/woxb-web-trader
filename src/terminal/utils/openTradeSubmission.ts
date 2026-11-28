import type { OpenTradeRequest, OpenTradeSubmission } from "@/src/services/api/trade/trade.types";

export type PendingOpenTrade = OpenTradeSubmission & {
  phase: "sending" | "uncertain" | "pending";
};

const STORAGE_KEY = "webtrader:open-trade";

export function readOpenTradeBody(body: string): OpenTradeRequest | undefined {
  try {
    const payload = JSON.parse(body);
    if (
      typeof payload?.account_id === "string"
      && typeof payload.symbol === "string"
      && (payload.type === "Buy" || payload.type === "Sell")
      && Number.isFinite(payload.lots)
    ) return payload;
  } catch {
    return undefined;
  }
}

function readStoredOpenTrade(): PendingOpenTrade | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const submission = JSON.parse(stored) as PendingOpenTrade | null;
    if (
      typeof submission?.key !== "string"
      || typeof submission.body !== "string"
      || !readOpenTradeBody(submission.body)
    ) return null;

    return {
      key: submission.key,
      body: submission.body,
      phase: submission.phase === "pending" ? "pending" : "uncertain",
    };
  } catch {
    return null;
  }
}

export function loadOpenTrade(accountId?: string) {
  const submission = readStoredOpenTrade();
  return submission && readOpenTradeBody(submission.body)?.account_id === accountId ? submission : null;
}

export function hasOpenTradeForAnotherAccount(accountId?: string) {
  const submission = readStoredOpenTrade();
  return submission !== null && readOpenTradeBody(submission.body)?.account_id !== accountId;
}

export function storeOpenTrade(accountId: string | undefined, submission: PendingOpenTrade | null) {
  if (!accountId) return;

  try {
    if (submission) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    } else if (loadOpenTrade(accountId)) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // The active form still retains the submission when browser storage is unavailable.
  }
}

export function readTradeExecution(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;

  const event = payload as Record<string, unknown>;
  if (
    event.action !== "open"
    || typeof event.order_link_id !== "string"
    || !event.order_link_id
    || typeof event.status !== "string"
    || typeof event.requested_quantity !== "string"
    || typeof event.filled_quantity !== "string"
    || !event.filled_quantity.trim()
  ) return;

  const status = event.status.toUpperCase();
  if (!["FILLED", "CANCELLED", "REJECTED", "EXPIRED"].includes(status)) return;

  const requested = Number(event.requested_quantity);
  const filled = Number(event.filled_quantity);
  if (!Number.isFinite(requested) || !Number.isFinite(filled) || requested <= 0 || filled < 0 || filled > requested) return;

  const tradeId = typeof event.trade_id === "string" ? event.trade_id : undefined;
  if (filled > 0 && !tradeId) return;
  if (status === "FILLED" && filled !== requested) return;

  const message = filled === 0
    ? `Trade ${status.toLowerCase()} with no fills.`
    : filled < requested
      ? `Trade partially filled (${event.filled_quantity} of ${event.requested_quantity}).`
      : "Trade executed.";

  return {
    success: filled > 0,
    message,
    tradeId,
    orderLinkId: event.order_link_id,
  };
}
