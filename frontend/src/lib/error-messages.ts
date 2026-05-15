import { ERROR_MESSAGES, type ErrorCode } from "../types/errors.js";

export function getErrorMessage(
  code?: string | null,
  fallback = "Something went wrong.",
) {
  if (!code) return fallback;

  return ERROR_MESSAGES[code as ErrorCode] ?? fallback;
}
