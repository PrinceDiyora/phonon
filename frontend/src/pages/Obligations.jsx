import { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useSearchAndSort } from "../hooks/useSearchAndSort.js";
import { useRole } from "../context/RoleContext.jsx";

const EMPTY_FORM = { title: "", obligationType: "Consent Management", description: "", status: "Not Started", dueDate: "", owner: "" };
const TYPES = ["Consent Management", "Data Retention", "Breach Notification", "Data Subject Request", "Data Localization"];
const STATUSES = ["Compliant", "In Progress", "Not Started"];

export default function Obligations() {
  const { role } = useRole();
  const isAuditor = role === "Auditor (Read-only)";

  const [obligations, setObligations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, handleSort, processedData } = useSearchAndSort(
    obligations,
    ['title', 'obligationType', 'owner']
  );

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-transparent group-hover:text-slate-300">▼</span>;
    return <span className="ml-1 text-slate-500">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const load = () => {
    setLoading(true);
    client.get("/obligations").then((res) => setObligations(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post("/obligations", form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await client.put(`/obligations/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this obligation?")) return;
    await client.delete(`/obligations/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Privacy Obligations</h1>
          <p className="text-slate-500 mt-1">Track compliance with GDPR, CCPA, and DPDP Act</p>
        </div>
        {!isAuditor && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "+ Add Obligation"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-80">
        <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text"
          placeholder="Search obligations..."
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
              placeholder="Obligation title"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.obligationType}
              onChange={(e) => setForm({ ...form, obligationType: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <input
              placeholder="Owner"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
          </div>
          <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Save Obligation
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('title')}>Obligation <SortIndicator column="title" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('obligationType')}>Type <SortIndicator column="obligationType" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('dueDate')}>Due Date <SortIndicator column="dueDate" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('status')}>Status <SortIndicator column="status" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('owner')}>Owner <SortIndicator column="owner" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : processedData.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No obligations found.</td></tr>
            ) : (
              processedData.map((o) => (
                <tr key={o._id} className={`border-t border-slate-100 ${o.status === 'Overdue' ? 'border-l-4 border-l-red-500' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.title}</td>
                  <td className="px-4 py-3 text-slate-500">{o.obligationType}</td>
                  <td className="px-4 py-3 text-slate-500">{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    {isAuditor || o.status === "Overdue" ? (
                      <StatusBadge value={o.status} />
                    ) : (
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="border border-slate-200 rounded-md text-xs px-2 py-1"
                      >
                        {["Not Started", "In Progress", "Compliant"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    {o.status === "Overdue" && <div className="text-[10px] text-red-500 mt-1">Calculated from due date</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{o.owner}</td>
                  <td className="px-4 py-3 text-right">
                    {!isAuditor && (
                      <button onClick={() => remove(o._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
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
