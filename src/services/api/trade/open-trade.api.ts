import { isAxiosError } from "axios";
import { ENDPOINTS, post } from "../core";
import { tradeRequest } from "./trade-request";
import type { OpenTradeSubmission, Trade } from "./trade.types";

export async function openTrade({ key, body }: OpenTradeSubmission) {
  let outcomeUnknown = false;
  const result = await tradeRequest<Trade | undefined>(async (config) => {
    try {
      return await post(ENDPOINTS.TRADE.OPEN, body, {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        outcomeUnknown = status === undefined || status === 408 || status >= 500;
      }
      throw error;
    }
  });

  return { ...result, outcomeUnknown };
}
