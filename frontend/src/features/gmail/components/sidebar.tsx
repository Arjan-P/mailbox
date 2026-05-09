import { Inbox, Send, Trash2 } from "lucide-react";

import type { GmailProfile } from "../types";

interface SidebarProps {
  profile: GmailProfile;
}

export function Sidebar({ profile }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r">
      <div className="border-b p-4">
        <div className="font-semibold">{profile.emailAddress}</div>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <button className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
          <Inbox className="h-4 w-4" />
          Inbox
        </button>

        <button className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
          <Send className="h-4 w-4" />
          Sent
        </button>

        <button className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
          <Trash2 className="h-4 w-4" />
          Trash
        </button>
      </nav>
    </div>
  );
}
