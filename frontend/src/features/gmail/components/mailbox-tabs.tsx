import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGmailStore } from "../store";

export function MailboxTabs() {
  const mailbox = useGmailStore((s) => s.selectedMailbox);

  const setMailbox = useGmailStore((s) => s.setSelectedMailbox);

  return (
    <div className="flex items-center px-4 py-1.5">
      <h1 className="text-foreground text-xl font-bold">Inbox</h1>
      <Tabs
        value={mailbox}
        onValueChange={(v) => setMailbox(v as any)}
        className="ml-auto"
      >
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
