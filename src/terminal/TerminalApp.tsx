"use client";

import { useEffect, useState } from "react";
import TerminalLayout from "./layout/TerminalLayout";
import type { AccountDetail } from "./topbar/accountDetails";

export default function TerminalApp({
  accessToken,
  accountId,
  accountDetails,
}: {
  accessToken?: string;
  accountId?: string;
  accountDetails: AccountDetail[];
}) {
  const [initializedToken, setInitializedToken] = useState<string | null>();

  useEffect(() => {
    let active = true;

    // Initialize storage before mounting the terminal's network effects.
    queueMicrotask(() => {
      if (!active) return;

      try {
        if (accessToken) {
          sessionStorage.setItem("accessToken", accessToken);
        } else {
          sessionStorage.removeItem("accessToken");
        }

        setInitializedToken(accessToken ?? null);
      } catch {
        setInitializedToken(null);
      }
    });

    return () => {
      active = false;
    };
  }, [accessToken]);

  if (initializedToken === undefined) return null;
  if (initializedToken === null && accessToken) {
    return <p role="alert">WebTrader could not initialize session storage.</p>;
  }
  if (initializedToken !== (accessToken ?? null)) return null;

  return <TerminalLayout accountId={accountId} accountDetails={accountDetails} />;
}
