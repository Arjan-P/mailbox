import { Inbox, Pencil, Send, Trash2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGmailStore, type MailboxType } from "../store";

import type { GmailMailItem, GmailProfile } from "../types";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  profile: GmailProfile;
  messages: GmailMailItem[];
  onCompose: () => void;
}

const links: {
  title: string;
  icon: LucideIcon;
  mailbox: MailboxType;
  showCount: boolean;
}[] = [
  { title: "Inbox", icon: Inbox, mailbox: "inbox", showCount: true },
  { title: "Sent", icon: Send, mailbox: "sent", showCount: false },
  { title: "Trash", icon: Trash2, mailbox: "trash", showCount: false },
];

export function Sidebar({ profile, messages, onCompose }: SidebarProps) {
  const collapsed = useGmailStore((s) => s.sidebarCollapsed);
  const selectedMailbox = useGmailStore((s) => s.selectedMailbox);
  const setSelectedMailbox = useGmailStore((s) => s.setSelectedMailbox);

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="flex h-full flex-col border-r">
      {/* Account section */}
      <div className={cn("border-b", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {profile.emailAddress[0]?.toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="truncate font-semibold">{profile.emailAddress}</div>
        )}
      </div>

      {/* Compose */}
      <div className={cn("p-2", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCompose}
            title="Compose"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Compose</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onCompose}
          >
            <Pencil className="h-4 w-4" />
            Compose
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = selectedMailbox === link.mailbox;
          const count = link.showCount ? unreadCount : undefined;

          return (
            <button
              key={link.title}
              onClick={() => setSelectedMailbox(link.mailbox)}
              className={cn(
                "flex rounded-md py-2 text-sm transition-colors hover:bg-muted",
                collapsed ? "justify-center px-2" : "items-center gap-2 px-3",
                isActive && "bg-muted font-medium",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {!collapsed && (
                <>
                  <span>{link.title}</span>
                  {count !== undefined && count > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
