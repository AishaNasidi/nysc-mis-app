import { useAuth } from "../../context/AuthContext";

export default function Navbar({ title }) {
  const { userProfile } = useAuth();
  const fullName = userProfile?.full_name || userProfile?.fullName || "Officer";
  const role = userProfile?.role || "";
  const initials = fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700 leading-tight">{fullName}</p>
          <p className="text-xs text-slate-500 capitalize">{role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white font-bold text-sm ring-2 ring-green-100 select-none">
          {initials || "U"}
        </div>
      </div>
    </header>
  );
}
