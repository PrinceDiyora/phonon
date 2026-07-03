import { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useSearchAndSort } from "../hooks/useSearchAndSort.js";
import { useRole } from "../context/RoleContext.jsx";

const EMPTY_FORM = { title: "", description: "", category: "Operational", severity: "Medium", status: "Open", owner: "" };

export default function Risks() {
  const { role } = useRole();
  const isAuditor = role === "Auditor (Read-only)";

  const [risks, setRisks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, handleSort, processedData } = useSearchAndSort(
    risks,
    ['title', 'description', 'owner', 'category']
  );

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-transparent group-hover:text-slate-300">▼</span>;
    return <span className="ml-1 text-slate-500">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const load = () => {
    setLoading(true);
    client.get("/risks").then((res) => setRisks(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post("/risks", form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await client.put(`/risks/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;
    await client.delete(`/risks/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk Register</h1>
          <p className="text-slate-500 mt-1">Track and mitigate organizational risk</p>
        </div>
        {!isAuditor && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "+ Add Risk"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-80">
        <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text"
          placeholder="Search risks..."
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
              placeholder="Risk title"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {["Access Control", "Data Security", "Availability", "Vendor", "Privacy", "Operational"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              {["Low", "Medium", "High", "Critical"].map((s) => (
                <option key={s}>{s}</option>
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
            Save Risk
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('title')}>Title <SortIndicator column="title" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('category')}>Category <SortIndicator column="category" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('severity')}>Severity <SortIndicator column="severity" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('status')}>Status <SortIndicator column="status" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('owner')}>Owner <SortIndicator column="owner" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : processedData.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No risks found.</td></tr>
            ) : (
              processedData.map((r) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.title}</td>
                  <td className="px-4 py-3 text-slate-500">{r.category}</td>
                  <td className="px-4 py-3"><StatusBadge value={r.severity} /></td>
                  <td className="px-4 py-3">
                    {isAuditor ? (
                      <StatusBadge value={r.status} />
                    ) : (
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                        className="border border-slate-200 rounded-md text-xs px-2 py-1"
                      >
                        {["Open", "Mitigating", "Closed", "Accepted"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.owner}</td>
                  <td className="px-4 py-3 text-right">
                    {!isAuditor && (
                      <button onClick={() => remove(r._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
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
