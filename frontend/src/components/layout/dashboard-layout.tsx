import { Outlet } from "react-router-dom";

import { UserButton } from "@clerk/react";

export function DashboardLayout() {
  return (
    <main className="h-screen overflow-hidden">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <h1 className="font-semibold">Mail Dashboard</h1>

        <UserButton />
      </header>

      <section className="h-[calc(100vh-56px)]">
        <Outlet />
      </section>
    </main>
  );
}
