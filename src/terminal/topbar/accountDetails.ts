type TraderAccount = {
  id?: string;
  nickname?: string;
  account_number?: string;
  balance?: string;
  equity?: string;
  margin_used?: string;
  margin_free?: string;
  currency?: { code?: string };
  account_type?: { name?: string };
  mode?: { name?: string };
  platform?: { name?: string };
  leverage?: { leverage?: number };
};

export type AccountDetail = {
  label: string;
  value: string;
};

function formatAmount(amount: unknown, currency: string) {
  if (typeof amount !== "string" || !/^-?\d+(\.\d+)?$/.test(amount)) {
    return undefined;
  }

  const [whole, fraction] = amount.split(".");
  const decimals = (fraction ?? "").replace(/0+$/, "").padEnd(2, "0");

  return `${whole}.${decimals}${currency ? ` ${currency}` : ""}`;
}

export function readTraderAccount(cookie?: string): TraderAccount | null {
  if (!cookie) return null;

  try {
    const account = JSON.parse(cookie);
    return account && typeof account === "object" && !Array.isArray(account)
      ? account
      : null;
  } catch {
    return null;
  }
}

export function readAccountDetails(account: TraderAccount | null): AccountDetail[] {
  if (!account) return [];

  const currency = account.currency?.code;
  const currencyCode = typeof currency === "string" ? currency : "";
  const leverage = account.leverage?.leverage;

  const details = [
    { label: "Account", value: account.nickname },
    { label: "Account number", value: account.account_number },
    { label: "Mode", value: account.mode?.name },
    { label: "Balance", value: formatAmount(account.balance, currencyCode) },
    { label: "Equity", value: formatAmount(account.equity, currencyCode) },
    {
      label: "Used margin",
      value: formatAmount(account.margin_used, currencyCode),
    },
    {
      label: "Free margin",
      value: formatAmount(account.margin_free, currencyCode),
    },
    { label: "Currency", value: currencyCode },
    { label: "Account type", value: account.account_type?.name },
    { label: "Platform", value: account.platform?.name },
    {
      label: "Leverage",
      value: typeof leverage === "number" && leverage > 0
        ? `1:${leverage}`
        : undefined,
    },
  ];

  return details.filter(
    (detail): detail is AccountDetail =>
      typeof detail.value === "string" && detail.value.trim().length > 0,
  );
}
