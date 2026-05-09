import { Button } from "@/components/ui/button";

import { MailShell } from "../components/mail-shell";

import { useGmailProfile, useMessages } from "../hooks";

export function GmailDashboardRoute() {
  const profile = useGmailProfile();

  const messages = useMessages({
    maxResults: 25,
  });

  if (profile.isLoading || messages.isLoading) {
    return <div>Loading...</div>;
  }

  if (profile.isError) {
    return (
      <a href={`${import.meta.env.VITE_BACKEND_URL}/api/gmail/auth`}>
        <Button>Connect Gmail</Button>
      </a>
    );
  }

  return (
    <MailShell
      profile={profile.data}
      messages={messages.data?.messages ?? []}
    />
  );
}
