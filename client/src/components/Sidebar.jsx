import {
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen">

      <div className="text-center text-3xl font-bold py-6 border-b border-slate-700">
        TransitOps
      </div>

      <nav className="mt-6">

        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link
          to="/vehicles"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaTruck />
          Vehicles
        </Link>

        <Link
          to="/drivers"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaUserTie />
          Drivers
        </Link>

        <Link
          to="/trips"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaRoute />
          Trips
        </Link>

        <Link
          to="/maintenance"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaTools />
          Maintenance
        </Link>

        <Link
          to="/fuel"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaGasPump />
          Fuel
        </Link>

        <Link
          to="/reports"
          className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700"
        >
          <FaChartBar />
          Reports
        </Link>

      </nav>

      <div className="absolute bottom-5 w-64">

        <button className="flex items-center gap-3 px-6 py-3 hover:bg-red-600 w-full">
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;