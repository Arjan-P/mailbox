import { RedirectToSignIn, Show } from "@clerk/react";
import { Outlet } from "react-router-dom";

export function ProtectedLayout() {
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>

      <Show when="signed-in">
        <Outlet />
      </Show>
    </>
  );
}
