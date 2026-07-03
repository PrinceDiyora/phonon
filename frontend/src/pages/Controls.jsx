import { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useSearchAndSort } from "../hooks/useSearchAndSort.js";
import { useRole } from "../context/RoleContext.jsx";

const EMPTY_FORM = { name: "", description: "", framework: "SOC 2 - Security", status: "Gap", owner: "" };
const FRAMEWORKS = ["SOC 2 - Security", "SOC 2 - Availability", "SOC 2 - Confidentiality", "DPDP Act"];
const STATUSES = ["Implemented", "In Progress", "Gap", "Not Applicable"];

export default function Controls() {
  const { role } = useRole();
  const isAuditor = role === "Auditor (Read-only)";

  const [controls, setControls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    client.get("/controls").then((res) => setControls(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post("/controls", form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await client.put(`/controls/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this control?")) return;
    await client.delete(`/controls/${id}`);
    load();
  };

  const filtered = filter === "All" ? controls : controls.filter((c) => c.framework === filter);

  const { searchTerm, setSearchTerm, sortConfig, handleSort, processedData } = useSearchAndSort(
    filtered,
    ['name', 'description', 'owner']
  );

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-transparent group-hover:text-slate-300">▼</span>;
    return <span className="ml-1 text-slate-500">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control Library</h1>
          <p className="text-slate-500 mt-1">SOC 2 &amp; DPDP control implementation tracking</p>
        </div>
        {!isAuditor && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "+ Add Control"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {["All", ...FRAMEWORKS].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              filter === f ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-80">
        <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text"
          placeholder="Search controls..."
          className="bg-transparent border-none outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Control name"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.framework}
              onChange={(e) => setForm({ ...form, framework: e.target.value })}
            >
              {FRAMEWORKS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <input
              placeholder="Owner"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
          </div>
          <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Save Control
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('name')}>Control <SortIndicator column="name" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('framework')}>Framework <SortIndicator column="framework" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('status')}>Status <SortIndicator column="status" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('owner')}>Owner <SortIndicator column="owner" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : processedData.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No controls found.</td></tr>
            ) : (
              processedData.map((c) => (
                <tr key={c._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.framework}</td>
                  <td className="px-4 py-3">
                    {isAuditor ? (
                      <StatusBadge value={c.status} />
                    ) : (
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className="border border-slate-200 rounded-md text-xs px-2 py-1"
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.owner}</td>
                  <td className="px-4 py-3 text-right">
                    {!isAuditor && (
                      <button onClick={() => remove(c._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
