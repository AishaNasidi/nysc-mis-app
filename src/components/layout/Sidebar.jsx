import {
  BarChart2,
  LayoutDashboard,
  LogOut,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import nyscLogo from "../../assets/NYSC-LOGO.png";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/applicants/register",
    label: "Register Corps Member",
    icon: UserPlus,
  },
  { to: "/applicants", label: "All Records", icon: Users, exact: true },
  { to: "/reports", label: "Reports", icon: BarChart2 },
];

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fullName = userProfile?.full_name || userProfile?.fullName || "Officer";
  const role = userProfile?.role || "officer";
  const rank = userProfile?.rank || "";
  const statePosted =
    userProfile?.state_posted || userProfile?.statePosted || "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col w-[260px] min-h-screen bg-green-900 flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-green-800">
        <div className="flex items-center gap-2">
          <img
            src={nyscLogo}
            alt="NYSC Logo"
            className="object-cover w-12 h-12"
          />
          <div>
            <p className="text-sm font-bold leading-tight text-white">
              NYSC MIS
            </p>
            <p className="text-xs text-green-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
                isActive
                  ? "bg-green-700 text-white border-l-[3px] border-yellow-400 pl-[calc(0.75rem-3px)]"
                  : "text-green-200 hover:bg-green-800 hover:text-white"
              }`
            }
          >
            <Icon className="flex-shrink-0 w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {role === "admin" && (
          <NavLink
            to="/officers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? "bg-green-700 text-white border-l-[3px] border-yellow-400 pl-[calc(0.75rem-3px)]"
                  : "text-green-200 hover:bg-green-800 hover:text-white"
              }`
            }
          >
            <Shield className="flex-shrink-0 w-4 h-4" />
            Manage Officers
          </NavLink>
        )}
      </nav>

      {/* Profile card + logout */}
      <div className="px-3 py-4 border-t border-green-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white bg-yellow-500 rounded-full select-none w-9 h-9">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight text-white truncate">
              {fullName}
            </p>
            <p className="text-xs text-green-400 truncate">
              {rank || statePosted}
            </p>
            <span
              className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${role === "admin" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-700 text-green-300"}`}
            >
              {role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-300 transition-colors rounded-lg hover:bg-red-900/40 hover:text-red-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
