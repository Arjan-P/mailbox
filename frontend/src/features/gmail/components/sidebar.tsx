import { Inbox, Send, Trash2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGmailStore } from "../store";

import type { GmailProfile } from "../types";

interface SidebarProps {
  profile: GmailProfile;
}

const links: {
  title: string;
  icon: LucideIcon;
  count?: number;
}[] = [
  {
    title: "Inbox",
    icon: Inbox,
    count: 128,
  },
  {
    title: "Sent",
    icon: Send,
  },
  {
    title: "Trash",
    icon: Trash2,
  },
];

export function Sidebar({ profile }: SidebarProps) {
  const collapsed = useGmailStore((s) => s.sidebarCollapsed);

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

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <button
              key={link.title}
              className={cn(
                "flex rounded-md py-2 text-sm hover:bg-muted",
                collapsed ? "justify-center px-2" : "items-center gap-2 px-3",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {!collapsed && (
                <>
                  <span>{link.title}</span>

                  {link.count && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {profile.messagesTotal ?? link.count}
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
