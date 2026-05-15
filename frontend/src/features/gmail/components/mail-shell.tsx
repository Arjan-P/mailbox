import { useMemo } from "react";

import { ResizableHandle } from "@/components/ui/resizable";
import { ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";

import { Sidebar } from "./sidebar";
import { MessageList } from "./message-list";
import { MessageDisplay } from "./message-display";
import { SearchBar } from "./search-bar";
import { MailboxTabs } from "./mailbox-tabs";

import { useGmailStore } from "../store";

import type { GmailMailItem, GmailProfile } from "../types";
import { cn } from "@/lib/utils";
import type { ErrorResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-messages";
import { Button } from "@/components/ui/button";

interface MailShellProps {
  profile: GmailProfile;

  messages: GmailMailItem[];

  messagesError: ErrorResponse["error"] | null;
}

const COLLAPSED_SIZE = 4;
const GMAIL_AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/api/gmail/auth`;

export function MailShell({
  profile,
  messages,
  messagesError,
}: MailShellProps) {
  const selectedMailbox = useGmailStore((s) => s.selectedMailbox);

  const search = useGmailStore((s) => s.search);

  const sidebarCollapsed = useGmailStore((s) => s.sidebarCollapsed);

  const setSidebarCollapsed = useGmailStore((s) => s.setSidebarCollapsed);

  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    if (selectedMailbox === "unread") {
      filtered = filtered.filter((m) => m.unread);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.snippet.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [messages, selectedMailbox, search]);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel
        defaultSize={"18%"}
        minSize="15%"
        maxSize="20%"
        collapsible
        collapsedSize={`${COLLAPSED_SIZE}%`}
        onResize={(size) => {
          setSidebarCollapsed(size.asPercentage <= COLLAPSED_SIZE);
        }}
        className={cn(
          sidebarCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        <Sidebar profile={profile} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={"32%"} minSize="30%">
        <div className="flex h-full flex-col">
          <MailboxTabs />

          <SearchBar />

          {messagesError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
              <p className="text-center text-sm text-muted-foreground">
                {getErrorMessage(messagesError.code, messagesError.message)}
              </p>
              {(messagesError.code === "AUTHENTICATION_ERROR" ||
                messagesError.code === "GOOGLE_AUTH_REQUIRED" ||
                messagesError.code === "GOOGLE_AUTH_EXPIRED") && (
                <a href={GMAIL_AUTH_URL}>
                  <Button variant="outline" size="sm">
                    Reconnect Gmail
                  </Button>
                </a>
              )}
            </div>
          ) : (
            <MessageList messages={filteredMessages} />
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={"50%"} minSize="30%">
        <MessageDisplay />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
