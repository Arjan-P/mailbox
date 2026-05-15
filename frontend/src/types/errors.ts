export const ERROR_CODES = [
  // Auth
  "AUTHENTICATION_ERROR", // Clerk session not found / invalid
  "GOOGLE_AUTH_REQUIRED", // No Google account connected
  "GOOGLE_AUTH_EXPIRED", // Token expired, refresh failed

  // Google API
  "GOOGLE_FORBIDDEN", // 403 from Google
  "GOOGLE_RATE_LIMITED", // 429 from Google
  "GOOGLE_API_ERROR", // Other Google API failure

  // Generic
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "INTERNAL_SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTHENTICATION_ERROR: "You need to sign in again.",
  GOOGLE_AUTH_REQUIRED: "Connect your Google account first.",
  GOOGLE_AUTH_EXPIRED: "Your Google session expired. Reconnect it.",

  GOOGLE_FORBIDDEN: "Google denied the request.",
  GOOGLE_RATE_LIMITED: "Gmail rate limit hit. Wait a moment and refresh.",
  GOOGLE_API_ERROR: "Gmail is having issues. Try refreshing the page.",

  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Some fields are invalid.",
  INTERNAL_SERVER_ERROR: "Something went wrong on our end.",
};
