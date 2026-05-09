import { createBrowserRouter } from "react-router-dom";

import { DashboardPage } from "../pages/dashboard";
import { HomePage } from "../pages/home";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },

  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]);
