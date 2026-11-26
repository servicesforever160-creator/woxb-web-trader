const ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/clients/auth/login",
    REGISTER: "/clients/auth/register",
    SIGN_OUT: "/clients/auth/sign-out",
    REFRESH: "/clients/auth/refresh",
    RESEND_MAIL_VERIFICATION: "/clients/auth/resend-email-verification",
    MAIL_VERIFICATION: "/clients/auth/verify-email",
    RESET_PASSWORD: "/clients/auth/reset-password",
    CONFIRM_PASSWORD: "/clients/auth/confirm-password",
    PROFILE: "/clients/auth/profile",
    ME: "/clients/auth/me",
    TRUST_DEVICE: "/clients/auth/device-trust",
    EXCHANGE_VIEW_CODE: "/clients/auth/exchange-view-code",
  },
  TRADING_CENTER: {
    HISTORY: "clients/trading-center/history"
  },
} as const;

export default ENDPOINTS;
