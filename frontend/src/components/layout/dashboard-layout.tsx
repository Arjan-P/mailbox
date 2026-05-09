import { Outlet } from "react-router-dom";

import { UserButton } from "@clerk/react";

import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardLayout() {
  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <h1 className="font-semibold">Mail Dashboard</h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <UserButton />
        </div>
      </header>

      <section className="h-[calc(100vh-56px)]">
        <Outlet />
      </section>
    </main>
  );
}
