import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./app/pages/HomePage.jsx";
import { AdminPage } from "./app/pages/AdminPage.jsx";
import { ProjectDetailPage } from "./app/pages/ProjectDetailPage.jsx";
import { RootLayout } from "./app/components/RootLayout.jsx";
import { VerifyEmailPage } from "./app/pages/VerifyEmailPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "admin",
        Component: AdminPage,
      },
      {
        path: "/project/:slug",
        Component: ProjectDetailPage,
      },
      {
        path: "/verify-email",
        Component: VerifyEmailPage,
      },
    ],
  },
]);
