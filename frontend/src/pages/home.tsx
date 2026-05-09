import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mail Dashboard</h1>

        <div>
          <Show when={"signed-out"}>
            <SignInButton />
            <SignUpButton />
          </Show>

          <Show when={"signed-in"}>
            <UserButton />
          </Show>
        </div>
      </div>

      <div className="mt-10">
        <Show when={"signed-in"}>
          <Link to="/dashboard">Go to dashboard</Link>
        </Show>
      </div>
    </main>
  );
}
