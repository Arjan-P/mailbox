import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { useSendMessage } from "../hooks";

interface ComposeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ComposeForm {
  to: string;
  subject: string;
  body: string;
}

const EMPTY_FORM: ComposeForm = { to: "", subject: "", body: "" };

export function ComposeDrawer({ open, onOpenChange }: ComposeDrawerProps) {
  const [form, setForm] = useState<ComposeForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ComposeForm>>({});

  const send = useSendMessage();

  function validate(): boolean {
    const next: Partial<ComposeForm> = {};

    const toAddresses = form.to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (toAddresses.length === 0) {
      next.to = "At least one recipient is required";
    } else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalid = toAddresses.filter((a) => !emailRe.test(a));
      if (invalid.length > 0) {
        next.to = `Invalid email${invalid.length > 1 ? "s" : ""}: ${invalid.join(", ")}`;
      }
    }

    if (!form.subject.trim()) next.subject = "Subject is required";
    if (!form.body.trim()) next.body = "Body is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSend() {
    if (!validate()) return;

    const to = form.to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    send.mutate(
      { to, subject: form.subject, body: form.body },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setErrors({});
          onOpenChange(false);
        },
      },
    );
  }

  function handleClose() {
    if (send.isPending) return;
    setForm(EMPTY_FORM);
    setErrors({});
    send.reset();
    onOpenChange(false);
  }

  function field(key: keyof ComposeForm) {
    return {
      value: form[key],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
      },
    };
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base">New message</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClose}
            disabled={send.isPending}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* To */}
          <div className="px-4 py-2">
            <Label htmlFor="compose-to" className="sr-only">
              To
            </Label>
            <Input
              id="compose-to"
              placeholder="To"
              className="border-0 px-0 shadow-none focus-visible:ring-0"
              disabled={send.isPending}
              {...field("to")}
            />
            {errors.to && (
              <p className="mt-1 text-xs text-destructive">{errors.to}</p>
            )}
          </div>

          <Separator />

          {/* Subject */}
          <div className="px-4 py-2">
            <Label htmlFor="compose-subject" className="sr-only">
              Subject
            </Label>
            <Input
              id="compose-subject"
              placeholder="Subject"
              className="border-0 px-0 shadow-none focus-visible:ring-0"
              disabled={send.isPending}
              {...field("subject")}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-destructive">{errors.subject}</p>
            )}
          </div>

          <Separator />

          {/* Body */}
          <div className="flex flex-1 flex-col px-4 py-2">
            <Label htmlFor="compose-body" className="sr-only">
              Message
            </Label>
            <Textarea
              id="compose-body"
              placeholder="Write your message..."
              className="flex-1 resize-none border-0 p-0 shadow-none focus-visible:ring-0"
              disabled={send.isPending}
              {...field("body")}
            />
            {errors.body && (
              <p className="mt-1 text-xs text-destructive">{errors.body}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          {send.isError && (
            <p className="text-xs text-destructive">
              Failed to send. Please try again.
            </p>
          )}
          <div className="ml-auto">
            <Button onClick={handleSend} disabled={send.isPending} size="sm">
              {send.isPending && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Send
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
