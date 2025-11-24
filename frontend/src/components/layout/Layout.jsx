import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-full min-w-full">
      <Navbar />
      <main className="mx-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
