import { ResizableHandle } from "@/components/ui/resizable";
import { ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";

import { Sidebar } from "./sidebar";
import { MessageList } from "./message-list";
import { MessageDisplay } from "./message-display";

import type { GmailMailItem, GmailProfile } from "../types";

interface MailShellProps {
  profile: GmailProfile;

  messages: GmailMailItem[];
}

export function MailShell({ profile, messages }: MailShellProps) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[calc(100vh-4rem)]"
    >
      <ResizablePanel defaultSize={18} minSize={12}>
        <Sidebar profile={profile} />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={32} minSize={25}>
        <MessageList messages={messages} />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={50} minSize={30}>
        <MessageDisplay />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
