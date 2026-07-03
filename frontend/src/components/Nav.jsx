import { NavLink } from "react-router-dom";
import { useRole } from "../context/RoleContext.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/risks", label: "Risk Register" },
  { to: "/controls", label: "Controls" },
  { to: "/evidence", label: "Audit Evidence" },
  { to: "/obligations", label: "Privacy Obligations" },
  { to: "/activity", label: "Activity Log" },
];

export default function Nav() {
  const { role, setRole } = useRole();

  return (
    <div className="w-64 shrink-0 bg-white text-slate-900 min-h-screen flex flex-col m-4 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <div className="text-xl font-bold tracking-tight">ComplianceHub</div>
        </div>
        <div className="text-xs text-slate-400 mt-6 font-semibold tracking-wider text-slate-500">MENU</div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                isActive ? "bg-brand-700 text-white shadow-md shadow-brand-700/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-400 block mb-2">VIEWING AS:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-brand-500"
        >
          <option>Compliance Admin</option>
          <option>Auditor (Read-only)</option>
        </select>
      </div>

      <div className="px-6 py-6 m-4 bg-[#111c16] rounded-2xl text-white">
        <div className="text-sm font-semibold mb-1">SOC 2 & DPDP Readiness</div>
        <div className="text-xs text-white/70 mb-4">22North Product Engineering</div>
        <button className="w-full py-2 bg-brand-700 rounded-xl text-xs font-medium hover:bg-brand-600 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
