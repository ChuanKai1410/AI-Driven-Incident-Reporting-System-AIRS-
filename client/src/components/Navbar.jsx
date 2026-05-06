import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div className="font-bold text-red-600">AIRS Dashboard</div>

      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-red-600">
          Dashboard
        </Link>

        <Link to="/incidents" className="text-sm font-medium text-slate-600 hover:text-red-600">
          Incidents
        </Link>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
