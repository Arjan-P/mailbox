import { useState } from "react";

import { addDays, addHours, format, nextSaturday } from "date-fns";

import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import { useMessage } from "../hooks";
import { useGmailStore } from "../store";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function MessageDisplay() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedMessageId = useGmailStore((s) => s.selectedMessageId);

  const { data: message, isLoading } = useMessage(selectedMessageId);

  if (!selectedMessageId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No message selected
      </div>
    );
  }

  if (isLoading || !message) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading message...
      </div>
    );
  }

  const initials = message.from
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Archive">
            <Archive className="h-4 w-4" />
            <span className="sr-only">Archive</span>
          </Button>

          <Button variant="ghost" size="icon" title="Move to junk">
            <ArchiveX className="h-4 w-4" />
            <span className="sr-only">Move to junk</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Move to trash"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Move to trash</span>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" title="Snooze">
                <Clock className="h-4 w-4" />
                <span className="sr-only">Snooze</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="flex w-auto p-0">
              <div className="flex flex-col gap-2 border-r px-2 py-4">
                <div className="px-4 text-sm font-medium">Snooze until</div>

                <div className="grid min-w-[250px] gap-1">
                  <Button variant="ghost" className="justify-start font-normal">
                    Later today
                    <span className="ml-auto text-muted-foreground">
                      {format(addHours(selectedDate, 4), "E, h:mm b")}
                    </span>
                  </Button>

                  <Button variant="ghost" className="justify-start font-normal">
                    Tomorrow
                    <span className="ml-auto text-muted-foreground">
                      {format(addDays(selectedDate, 1), "E, h:mm b")}
                    </span>
                  </Button>

                  <Button variant="ghost" className="justify-start font-normal">
                    This weekend
                    <span className="ml-auto text-muted-foreground">
                      {format(nextSaturday(selectedDate), "E, h:mm b")}
                    </span>
                  </Button>

                  <Button variant="ghost" className="justify-start font-normal">
                    Next week
                    <span className="ml-auto text-muted-foreground">
                      {format(addDays(selectedDate, 7), "E, h:mm b")}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  required
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Reply">
            <Reply className="h-4 w-4" />
            <span className="sr-only">Reply</span>
          </Button>

          <Button variant="ghost" size="icon" title="Reply all">
            <ReplyAll className="h-4 w-4" />
            <span className="sr-only">Reply all</span>
          </Button>

          <Button variant="ghost" size="icon" title="Forward">
            <Forward className="h-4 w-4" />
            <span className="sr-only">Forward</span>
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Message */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start p-4">
          <div className="flex items-start gap-4 text-sm">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="grid gap-1">
              <div className="font-semibold">{message.from}</div>

              <div className="text-xs font-medium">{message.subject}</div>

              <div className="text-xs text-muted-foreground">
                To: {message.to.join(", ")}
              </div>

              {message.cc.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Cc: {message.cc.join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto text-xs text-muted-foreground">
            {message.date && format(new Date(message.date), "PPpp")}
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="whitespace-pre-wrap text-sm">{message.body}</div>
        </div>

        <Separator />

        {/* Reply */}
        <div className="p-4">
          <form>
            <div className="grid gap-4">
              <Textarea
                className="min-h-32 p-4"
                placeholder={`Reply to ${message.from}...`}
              />

              <div className="flex items-center">
                <Label
                  htmlFor="mute"
                  className="flex items-center gap-2 text-xs font-normal"
                >
                  <Switch id="mute" aria-label="Mute thread" />
                  Mute this thread
                </Label>

                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={(e) => e.preventDefault()}
                >
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
