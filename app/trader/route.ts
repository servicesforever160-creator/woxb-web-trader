import { type NextRequest, NextResponse } from "next/server";

const headers = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};

function exchangeError(message: string, status: number) {
  return NextResponse.json({ status: false, message }, { status, headers });
}

export function HEAD() {
  return new Response(null, { headers });
}

export async function GET(request: NextRequest) {
  const codes = request.nextUrl.searchParams.getAll("code");
  const [code] = codes;

  if (codes.length !== 1 || !code?.trim()) {
    return exchangeError("The trader link must contain one authorization code.", 400);
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() + '/api/v1';
  if (!apiBaseUrl) {
    return exchangeError("The WebTrader API is not configured.", 500);
  }

  let exchange: Response;
  try {
    exchange = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/clients/trades/web-trader/exchange`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    return exchangeError("The WebTrader API could not be reached.", 502);
  }

  if (!exchange.ok) {
    if ([400, 401, 403, 404, 409, 410, 422].includes(exchange.status)) {
      return exchangeError("The WebTrader API rejected the authorization code.", 400);
    }
    return exchangeError("The WebTrader API could not complete the exchange.", 502);
  }

  const result = await exchange.json().catch(() => null);
  if (result?.status === false) {
    return exchangeError("The WebTrader API rejected the authorization code.", 400);
  }

  const { token, account, expiresInSeconds } = result?.data ?? {};
  if (
    result?.status !== true ||
    typeof token !== "string" ||
    !token.trim() ||
    typeof account?.id !== "string" ||
    !account.id ||
    !Number.isSafeInteger(expiresInSeconds) ||
    expiresInSeconds <= 0
  ) {
    return exchangeError("The WebTrader API returned an invalid session.", 502);
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303, headers });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: expiresInSeconds,
  };

  response.cookies.set("access_token", token, cookieOptions);
  response.cookies.set("trader_account", JSON.stringify(account), cookieOptions);
  return response;
}
