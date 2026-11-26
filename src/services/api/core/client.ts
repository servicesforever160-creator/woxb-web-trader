import { getFingerprint } from "@/src/lib/client-fingerprint";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import ENDPOINTS from "./endpoints";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    fingerprintLogout?: boolean;
    lastTry?: boolean;
    publicEndpoint?: boolean;
    skipMaintenanceRedirect?: boolean
  }
}

const getDefaultApiBaseUrl = () => {
  const hostname =
    typeof window === "undefined"
      ? "192.168.100.5"
      : window.location.hostname;

  return `http://${hostname}:5000/api/v1`;
};

export const getEnvApiBaseUrl = () => {
  const hostname =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  const prefix =
    process.env.NEXT_PUBLIC_API_PREFIX ?? "/api";

  const apiVersion =
    process.env.NEXT_PUBLIC_API_VERSION ?? "/v1";

  return `${hostname}${prefix}${apiVersion}`;
};

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/verify-authenticator",
];

const MAINTENANCE_STATUS = 503;

const isOnPublicPath = () => {
  if (typeof window === "undefined") return false;

  const pathname = window.location.pathname;

  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/confirm-password/")
  );
};

const buildScreenPayload = () => ({
  width: typeof window !== "undefined" ? window.screen.width : 0,
  height: typeof window !== "undefined" ? window.screen.height : 0,
  pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
});

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.substring(name.length + 1));
};

const isViewMode = (): boolean => {
  return !!getCookie("view_token");
};

const persistAccessToken = (token: string) => {
  sessionStorage.setItem("accessToken", token);

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie =
    `accessToken=${encodeURIComponent(token)}` +
    `; Path=/` +
    `; Max-Age=900` +
    `; SameSite=Lax` +
    secure;
};

const clearSessionAndRedirect = async () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");

  try {
    await fetch("/api/remove-session", { method: "DELETE" });
  } catch {
    // ignore
  }

  if (!isOnPublicPath()) {
    window.location.replace("/sign-in");
  }
};

const client = axios.create({
  baseURL: getEnvApiBaseUrl() || getDefaultApiBaseUrl(),

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  withCredentials: true,

  timeout: 15_000,
});

const isOnMaintenancePath = () => typeof window !== "undefined" && window.location.pathname === "/maintenance";

client.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    if (
      axios.isCancel(error) ||
      error.code === "ERR_CANCELED" ||
      (error as { name?: string })?.name === "CanceledError"
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = (error.response?.data as { message?: string })?.message;

    const originalRequest = error.config as | (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (typeof window !== "undefined" && status === MAINTENANCE_STATUS && message === "under_maintenance") {
      if (!originalRequest?.skipMaintenanceRedirect && !isOnMaintenancePath()) {
        window.location.replace("/maintenance");
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


let sessionFetchPromise: Promise<string | null> | null = null;

const fetchSessionToken = async (): Promise<string | null> => {
  if (sessionFetchPromise) return sessionFetchPromise;

  sessionFetchPromise = (async () => {
    try {
      const response = await fetch("/api/get-session");
      const data = await response.json();

      if (!data?.refreshToken) {
        await clearSessionAndRedirect();
        return null;
      }

      sessionStorage.setItem("refreshToken", data.refreshToken);

      if (!data.accessToken) {
        try {
          return await refreshAccessToken();
        } catch {
          await clearSessionAndRedirect();
          return null;
        }
      }

      sessionStorage.setItem("accessToken", data.accessToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      sessionFetchPromise = null;
    }
  })();

  return sessionFetchPromise;
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {

    await fetch("/api/fingerprint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ screen: buildScreenPayload() }),
    });

    const refreshRes = await client.post(
      ENDPOINTS.AUTH.REFRESH,
      { token: sessionStorage.getItem("refreshToken") },
      { skipAuthRefresh: true, publicEndpoint: true, timeout: 8_000 }
    );

    const refreshData = refreshRes.data;

    if (!refreshData?.status) {
      throw new Error("Refresh failed");
    }

    const token = refreshData.data.accessToken as string;
    persistAccessToken(token);

    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};


client.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;
    if (config.publicEndpoint) return config;

    /*
     * View mode takes precedence over any normal session.
     * The `view_token` is a read-only JWT signed with a separate
     * secret; the backend guard verifies it and rejects all non-GET.
     */
    const viewToken = getCookie("view_token");
    if (viewToken) {
      config.headers.Authorization = `Bearer ${viewToken}`;
      config.headers["X-View-Mode"] = "read-only";
      return config;
    }


    let accessToken = sessionStorage.getItem("accessToken");

    if (!accessToken) {
      accessToken = await fetchSessionToken();
      if (!accessToken) {
        return config;
      }
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.request.use((config) => {
  if (typeof document === "undefined") return config;

  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="));

  const csrfToken = csrfCookie
    ? decodeURIComponent(csrfCookie.substring("csrfToken=".length))
    : undefined;

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

client.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const fingerprint = await getFingerprint();

  if (fingerprint) {
    config.headers = config.headers ?? {};
    config.headers["x-fingerprint"] = fingerprint;
  }

  config.headers["X-Screen"] = JSON.stringify(buildScreenPayload());

  return config;
});

client.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (
      axios.isCancel(error) ||
      error.code === "ERR_CANCELED" ||
      (error as { name?: string })?.name === "CanceledError"
    ) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (typeof window === "undefined" || !originalRequest || !error.response) {
      return Promise.reject(error);
    }

    /*
     * View mode: the view token is short-lived and not refreshable.
     * Do NOT try to refresh — just surface the error. The view session
     * banner should show "session expired" and offer to close the tab.
     */
    if (isViewMode()) {
      // 401 from the backend means the view token expired or was revoked
      if (error.response.status === 401 || error.response.status === 403) {
        console.log(
          "[client] view session expired or rejected:",
          error.response.status
        );
      }
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh && originalRequest.fingerprintLogout) {
      return Promise.reject(error);
    }

    if (originalRequest.lastTry) {
      window.location.reload();
      return Promise.reject(error);
    }

    /* ---------------------- 403: Invalid Device Fingerprint ----------------- */

    if (
      error.response.status === 403 &&
      (error.response.data as { message?: string })?.message ===
      "Invalid Device Fingerprint!"
    ) {
      if (originalRequest.fingerprintLogout) {
        return Promise.reject(error);
      }

      try {
        await fetch("/api/fingerprint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ screen: buildScreenPayload() }),
        });

        if (originalRequest.url === ENDPOINTS.AUTH.MAIL_VERIFICATION) {
          return client(originalRequest);
        }

        const token = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return client(originalRequest);
      } catch (refreshError) {
        await clearSessionAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const data = error.response.data as { message?: string };
    if (data?.message !== "Token Expired") {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return client(originalRequest);
    } catch (refreshError) {
      await clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

export default client;
