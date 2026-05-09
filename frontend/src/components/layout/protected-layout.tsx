import {
  ClerkLoaded,
  ClerkLoading,
  RedirectToSignIn,
  Show,
} from "@clerk/react";

import { Outlet } from "react-router-dom";

export function ProtectedLayout() {
  return (
    <>
      <ClerkLoading>
        <div>Loading...</div>
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-out">
          <RedirectToSignIn />
        </Show>

        <Show when="signed-in">
          <Outlet />
        </Show>
      </ClerkLoaded>
    </>
  );
}
