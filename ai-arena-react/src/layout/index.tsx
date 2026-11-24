import { Outlet } from "react-router";

import Footer from "./Footer";
import Header from "./Header";

export const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
