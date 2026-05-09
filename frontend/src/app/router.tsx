import { createBrowserRouter } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtectedLayout } from "@/components/layout/protected-layout";

import { DashboardPage } from "@/pages/dashboard";
import { HomePage } from "@/pages/home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },

  {
    element: <ProtectedLayout />,

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
]);
