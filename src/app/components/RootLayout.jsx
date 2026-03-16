import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

export function RootLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen">
      <Header />
      <main className={isHomePage ? "" : "pt-20"}>
        <Outlet />
      </main>
    </div>
  );
}
