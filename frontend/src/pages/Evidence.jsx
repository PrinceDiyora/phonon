import { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useSearchAndSort } from "../hooks/useSearchAndSort.js";
import { useRole } from "../context/RoleContext.jsx";

const EMPTY_FORM = { control: "", title: "", description: "", fileName: "", submittedBy: "" };

export default function Evidence() {
  const { role } = useRole();
  const isAuditor = role === "Auditor (Read-only)";

  const [evidence, setEvidence] = useState([]);
  const [controls, setControls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, handleSort, processedData } = useSearchAndSort(
    evidence,
    ['title', 'control.name', 'submittedBy']
  );

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-transparent group-hover:text-slate-300">▼</span>;
    return <span className="ml-1 text-slate-500">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  const load = () => {
    setLoading(true);
    Promise.all([client.get("/evidence"), client.get("/controls")])
      .then(([evRes, ctrlRes]) => {
        setEvidence(evRes.data);
        setControls(ctrlRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post("/evidence", form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  const review = async (id, reviewStatus) => {
    if (!window.confirm(`Are you sure you want to ${reviewStatus.toLowerCase()} this evidence?`)) return;
    await client.put(`/evidence/${id}/review`, { reviewStatus });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Evidence</h1>
          <p className="text-slate-500 mt-1">Submit and review evidence supporting control implementation</p>
        </div>
        {!isAuditor && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showForm ? "Cancel" : "+ Submit Evidence"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-80">
        <svg className="w-4 h-4 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text"
          placeholder="Search evidence..."
          className="bg-transparent border-none outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.control}
              onChange={(e) => setForm({ ...form, control: e.target.value })}
            >
              <option value="">Select control…</option>
              {controls.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Evidence title"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="File name (e.g. access-review.pdf)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
            />
            <input
              placeholder="Submitted by"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.submittedBy}
              onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
            />
          </div>
          <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Submit Evidence
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('title')}>Evidence <SortIndicator column="title" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('control.name')}>Control <SortIndicator column="control.name" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('submittedBy')}>Submitted By <SortIndicator column="submittedBy" /></th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('reviewStatus')}>Review Status <SortIndicator column="reviewStatus" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : processedData.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No evidence found.</td></tr>
            ) : (
              processedData.map((e) => (
                <tr key={e._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{e.title}</div>
                    {e.fileName && <div className="text-xs text-slate-400">{e.fileName}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{e.control?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{e.submittedBy}</td>
                  <td className="px-4 py-3"><StatusBadge value={e.reviewStatus} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {!isAuditor && e.reviewStatus !== "Approved" && (
                      <button onClick={() => review(e._id, "Approved")} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">
                        Approve
                      </button>
                    )}
                    {!isAuditor && e.reviewStatus !== "Rejected" && (
                      <button onClick={() => review(e._id, "Rejected")} className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Reject
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
