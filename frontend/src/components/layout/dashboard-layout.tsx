import { Outlet } from "react-router-dom";

import { UserButton } from "@clerk/react";

export function DashboardLayout() {
  return (
    <main className="min-h-screen">
      <header className="border-b p-4 flex justify-between">
        <h1 className="font-bold">Mail Dashboard</h1>

        <UserButton />
      </header>

      <div className="p-6">
        <Outlet />
      </div>
    </main>
  );
}
