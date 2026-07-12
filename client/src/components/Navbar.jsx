import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";

function Navbar() {
  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-6">

      {/* Left Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          TransitOps Dashboard
        </h2>
      </div>

      {/* Center Section */}
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-80">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className="relative">
          <FaBell size={22} className="text-gray-600 hover:text-blue-600" />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer">
          <FaUserCircle size={35} className="text-blue-600" />

          <div className="hidden md:block">
            <p className="font-semibold">Admin</p>
            <p className="text-sm text-gray-500">
              Fleet Manager
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Navbar;