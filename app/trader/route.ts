import { type NextRequest, NextResponse } from "next/server";

const headers = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};

function exchangeError(message: string, status: number) {
  return NextResponse.json({ status: false, message }, { status, headers });
}


type UpstreamInfo = {
  status?: number;
  statusText?: string;
  message?: string;
  endpoint?: string;
  body?: string;
};

type ErrorDetails = {
  requestId: string;
  timestamp: string;
  title: string;
  code: string;
  description: string;
  httpStatus: number;
  upstream?: UpstreamInfo;
  error?: string;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function errorToString(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}${err.stack ? `\n\n${err.stack}` : ""}`;
  }
  return prettyJson(err);
}


function renderErrorPage(details: ErrorDetails): NextResponse {
  const {
    requestId,
    timestamp,
    title,
    code,
    description,
    httpStatus,
    upstream,
    error,
  } = details;

  const e = escapeHtml;

  const upstreamStatusCell =
    upstream?.status !== undefined
      ? `<div class="kv"><div class="k">Upstream Status</div><div class="v">${e(
        String(upstream.status)
      )}${upstream.statusText ? ` ${e(upstream.statusText)}` : ""}</div></div>`
      : "";

  const upstreamMessageCell = upstream?.message
    ? `<div class="kv"><div class="k">Upstream Message</div><div class="v">${e(
      upstream.message
    )}</div></div>`
    : "";

  const upstreamEndpointCell = upstream?.endpoint
    ? `<div class="kv"><div class="k">Endpoint</div><div class="v">${e(
      upstream.endpoint
    )}</div></div>`
    : "";

  const rawResponseBlock = upstream?.body
    ? `<div class="block"><h2>Raw Response</h2><pre>${e(
      upstream.body
    )}</pre></div>`
    : "";

  const exceptionBlock = error
    ? `<div class="block"><h2>Exception</h2><pre>${e(error)}</pre></div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${e(title)} · ${e(code)}</title>
  <style>
    :root { color-scheme: light dark; }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; padding: 24px;
      background: #F6F7FB; color: #0f172a;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      width: 100%; max-width: 720px; background: #FFF9EA;
      border: 1px solid rgba(245,184,0,0.35); border-radius: 12px;
      padding: 32px; box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    }
    .icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 12px;
      background: #FFF8E5; border: 1px solid rgba(245,184,0,0.2); color: #A36A00;
    }
    h1 { margin: 20px 0 0; font-size: 26px; line-height: 1.15; font-weight: 700; color: #0f172a; }
    .code-badge {
      display: inline-block; margin-top: 10px; padding: 4px 10px;
      border-radius: 999px; background: #FFF8E5;
      border: 1px solid rgba(245,184,0,0.25); color: #A36A00;
      font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    p.desc { margin: 14px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; }
    .grid {
      margin-top: 22px; display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px; border-top: 1px solid rgba(245,184,0,0.15); padding-top: 18px;
    }
    .kv {
      background: #ffffff; border: 1px solid #DFE5EF; border-radius: 10px;
      padding: 10px 12px; min-width: 0;
    }
    .kv .k {
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; color: #94a3b8;
    }
    .kv .v {
      margin-top: 4px; font-size: 13px; font-weight: 600; color: #0f172a;
      word-break: break-word;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .block { margin-top: 16px; }
    .block h2 {
      margin: 0 0 6px; font-size: 11px; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase; color: #94a3b8;
    }
    pre {
      margin: 0; background: #0f172a; color: #f8fafc; border-radius: 10px;
      padding: 14px; font-size: 12px; line-height: 1.55; overflow: auto;
      max-height: 320px; white-space: pre-wrap; word-break: break-word;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .actions { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 10px; }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; border-radius: 8px;
      font-size: 14px; font-weight: 600; text-decoration: none;
      border: 1px solid transparent; cursor: pointer;
    }
    .btn-primary { background: #f5b800; color: #0f172a; }
    .btn-primary:hover { background: #e5a900; }
    .btn-secondary {
      background: #ffffff; border-color: #DFE5EF; color: #0f172a;
    }
    .btn-secondary:hover { background: #f8fafc; }
    .footer {
      margin-top: 18px; font-size: 11px; color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0b0f14; color: #e6edf3; }
      .card { background: rgba(245,184,0,0.055); border-color: rgba(245,184,0,0.2); }
      h1 { color: #e6edf3; }
      p.desc { color: #94a3b8; }
      .kv { background: #0f141b; border-color: rgba(245,184,0,0.12); }
      .kv .v { color: #e6edf3; }
      .icon { background: rgba(245,184,0,0.08); color: #f5b800; border-color: rgba(245,184,0,0.15); }
      .code-badge { background: rgba(245,184,0,0.1); color: #f5b800; }
      .btn-secondary { background: #0f141b; border-color: rgba(245,184,0,0.12); color: #e6edf3; }
      .btn-secondary:hover { background: #141b23; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    </div>

    <h1>${e(title)}</h1>
    <span class="code-badge">${e(code)}</span>
    <p class="desc">${e(description)}</p>

    <div class="grid">
      <div class="kv"><div class="k">HTTP Status</div><div class="v">${e(
    String(httpStatus)
  )}</div></div>
      ${upstreamStatusCell}
      ${upstreamMessageCell}
      ${upstreamEndpointCell}
      <div class="kv"><div class="k">Timestamp</div><div class="v">${e(
    timestamp
  )}</div></div>
    </div>

    ${rawResponseBlock}
    ${exceptionBlock}

    <div class="actions">
      <a class="btn btn-primary" href="/sign-in?error=${encodeURIComponent(
    code
  )}">Return to sign in</a>
      <button type="button" class="btn btn-secondary" onclick="window.location.reload()">Retry</button>
    </div>

    <p class="footer">Request ID: ${e(requestId)}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: httpStatus,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}


export function HEAD() {
  return new Response(null, { headers });
}

export async function GET(request: NextRequest) {
  const codes = request.nextUrl.searchParams.getAll("code");
  const [code] = codes;


  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (codes.length !== 1 || !code?.trim()) {
    return exchangeError("The trader link must contain one authorization code.", 400);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    console.error("[ViewRoute] NEXT_PUBLIC_APP_URL not configured", {
      requestId,
    });
    return renderErrorPage({
      requestId,
      timestamp,
      title: "Server configuration error",
      code: "view_missing_origin",
      description:
        "NEXT_PUBLIC_APP_URL is not configured on the server. The view exchange cannot be completed.",
      httpStatus: 500,
    });
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

  const response = NextResponse.redirect(new URL("/", origin), { status: 303, headers });
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
