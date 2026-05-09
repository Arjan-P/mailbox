import { ThemeProvider } from "@/components/theme-provider";
import { ApiProvider } from "@/lib/api-provider";
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ReactNode } from "react";

const queryClient = new QueryClient();

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
