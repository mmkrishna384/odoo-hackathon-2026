import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-6 overflow-auto flex-1">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;