import { Button } from "@/components/ui/button";

import { useGmailProfile, useMessages } from "@/features/gmail/hooks";

export function DashboardPage() {
  const profile = useGmailProfile();

  const messages = useMessages();

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gmail Profile</h2>

        <pre className="mt-2 rounded border p-4 text-sm overflow-auto">
          {JSON.stringify(profile.data, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Messages</h2>

        <pre className="mt-2 rounded border p-4 text-sm overflow-auto">
          {JSON.stringify(messages.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
