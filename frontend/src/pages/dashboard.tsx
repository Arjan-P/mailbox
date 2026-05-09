import { UserButton } from "@clerk/react";

import { Button } from "../components/ui/button";

export function DashboardPage() {
  return (
    <>
      <main className="min-h-screen p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <UserButton />
        </div>

        <div className="mt-8">
          <a href={`${import.meta.env.VITE_BACKEND_URL}/api/gmail/auth`}>
            <Button>Connect Gmail</Button>
          </a>
        </div>
      </main>
    </>
  );
}
