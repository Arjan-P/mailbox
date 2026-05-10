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

interface MailShellProps {
  profile: GmailProfile;

  messages: GmailMailItem[];
}

const COLLAPSED_SIZE = 4;

export function MailShell({ profile, messages }: MailShellProps) {
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

          <MessageList messages={filteredMessages} />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={"50%"} minSize="30%">
        <MessageDisplay />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
