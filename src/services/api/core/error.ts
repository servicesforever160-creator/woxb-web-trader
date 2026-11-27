"use client";

import { addToast } from "@/src/components/ui/toast";
import type { ErrorResponse } from "./response";

export function HandleErrorResponse(response: ErrorResponse) {
  const validation = response.errors?.[0];
  const field = validation?.field;

  addToast({
    title: field ? field.charAt(0).toUpperCase() + field.slice(1) : response.message,
    description: validation?.message,
    type: "error",
  });
}
