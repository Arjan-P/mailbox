import { Spinner } from "@/components/ui/spinner";
import { MailShell } from "../components/mail-shell";

import { useGmailProfile, useMessages } from "../hooks";
import { ProfileError } from "../components/profile-error";
import { GmailAuthError } from "../components/gmail-auth-error";

export function GmailDashboardRoute() {
  const profile = useGmailProfile();
  const messages = useMessages({ maxResults: 25 });

  if (profile.isLoading || messages.isLoading) {
    return <Spinner />;
  }

  if (profile.isError) {
    if (
      profile.error.code === "AUTHENTICATION_ERROR" ||
      profile.error.code === "GOOGLE_AUTH_REQUIRED" ||
      profile.error.code === "GOOGLE_AUTH_EXPIRED"
    ) {
      return <GmailAuthError error={profile.error} />;
    }
    return <ProfileError error={profile.error} />;
  }

  if (!profile.data) {
    return;
  }

  return (
    <MailShell
      profile={profile.data}
      messages={messages.data?.messages ?? []}
      messagesError={messages.isError ? messages.error : null}
    />
  );
}
