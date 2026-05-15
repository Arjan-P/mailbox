import { ThemeProvider } from "@/components/theme-provider";
import { ApiProvider } from "@/lib/api-provider";
import type { ErrorResponse } from "@/types/api";
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ReactNode } from "react";

function isApiError(error: unknown): error is ErrorResponse["error"] {
  return typeof error === "object" && error !== null && "code" in error;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          const noRetry = new Set([
            "GOOGLE_AUTH_REQUIRED",
            "GOOGLE_AUTH_EXPIRED",
            "AUTHENTICATION_ERROR",
            "GOOGLE_FORBIDDEN",
            "NOT_FOUND",
          ]);

          if (noRetry.has(error.code)) {
            return false;
          }
        }

        return failureCount < 2;
      },
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ApiProvider>{children}</ApiProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
