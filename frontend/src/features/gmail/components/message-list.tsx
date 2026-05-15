import { formatDistanceToNow } from "date-fns";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useGmailStore } from "../store";
import type { GmailMailItem } from "../types";

interface MessageListProps {
  messages: GmailMailItem[];
}

export function MessageList({ messages }: MessageListProps) {
  const selectedMessageId = useGmailStore((s) => s.selectedMessageId);

  const setSelectedMessageId = useGmailStore((s) => s.setSelectedMessageId);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => setSelectedMessageId(message.id)}
            className={`rounded-lg border p-3 text-left ${
              selectedMessageId === message.id ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-center">
              <div className="font-medium">{message.from}</div>

              <div className="ml-auto text-xs text-muted-foreground">
                {message.date &&
                  formatDistanceToNow(new Date(message.date), {
                    addSuffix: true,
                  })}
              </div>
            </div>

            <div className="mt-1 text-sm font-semibold">{message.subject}</div>

            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {message.snippet}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
