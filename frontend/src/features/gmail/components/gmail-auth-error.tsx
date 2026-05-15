import { Button } from "@/components/ui/button";
import type { ErrorResponse } from "@/types/api";
import type { ErrorCode } from "@/types/errors";

const GMAIL_AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/gmail/auth`;
const AUTH_COPY: Partial<Record<ErrorCode, { title: string; cta: string }>> = {
  GOOGLE_AUTH_REQUIRED: {
    title: "Connect your Gmail account to get started.",
    cta: "Connect Gmail",
  },
  GOOGLE_AUTH_EXPIRED: {
    title: "Your Gmail session expired.",
    cta: "Reconnect Gmail",
  },
  AUTHENTICATION_ERROR: {
    title: "Your session is invalid.",
    cta: "Sign in",
  },
};

export function GmailAuthError({ error }: { error: ErrorResponse["error"] }) {
  const copy = AUTH_COPY[error.code] ?? {
    title: error.message,
    cta: "Reconnect",
  };
  const href =
    error.code === "AUTHENTICATION_ERROR" ? "/sign-in" : GMAIL_AUTH_URL;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">{copy.title}</p>
      <a href={href}>
        <Button>{copy.cta}</Button>
      </a>
    </div>
  );
}
