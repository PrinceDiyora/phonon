import { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useNavigate } from "react-router-dom";

export default function ReportPreview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/reports/snapshot")
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Generating report...</div>;
  if (error) return <div className="p-8 text-red-500">Error generating report: {error}</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto p-8">
        
        {/* Controls - Hidden in print */}
        <div className="print:hidden flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Save as PDF
          </button>
        </div>

        {/* Report Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Snapshot</h1>
          <div className="text-slate-500 text-sm">Generated on {new Date(data.generatedAt).toLocaleString()}</div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="border border-slate-200 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase font-semibold">Open Risks</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{data.summary.openRisks}</div>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase font-semibold">Control Readiness</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{data.summary.controlReadinessPct}%</div>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase font-semibold">Pending Review</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{data.summary.pendingEvidenceReview}</div>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase font-semibold">Overdue Obligations</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{data.summary.overdueObligations}</div>
          </div>
        </div>

        {/* Risks Section */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Risk Register</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-3 border-b border-slate-200">Title</th>
                <th className="p-3 border-b border-slate-200">Category</th>
                <th className="p-3 border-b border-slate-200">Severity</th>
                <th className="p-3 border-b border-slate-200">Status</th>
                <th className="p-3 border-b border-slate-200">Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.risks.map(r => (
                <tr key={r._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3 text-slate-600">{r.category}</td>
                  <td className="p-3"><StatusBadge value={r.severity} /></td>
                  <td className="p-3"><StatusBadge value={r.status} /></td>
                  <td className="p-3 text-slate-600">{r.owner}</td>
                </tr>
              ))}
              {data.risks.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">No risks documented.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Controls Section */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Control Library</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-3 border-b border-slate-200">Name</th>
                <th className="p-3 border-b border-slate-200">Framework</th>
                <th className="p-3 border-b border-slate-200">Status</th>
                <th className="p-3 border-b border-slate-200">Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.controls.map(c => (
                <tr key={c._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.framework}</td>
                  <td className="p-3"><StatusBadge value={c.status} /></td>
                  <td className="p-3 text-slate-600">{c.owner}</td>
                </tr>
              ))}
              {data.controls.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-500">No controls documented.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Evidence Section */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Audit Evidence</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-3 border-b border-slate-200">Evidence Title</th>
                <th className="p-3 border-b border-slate-200">Control mapped</th>
                <th className="p-3 border-b border-slate-200">Submitted By</th>
                <th className="p-3 border-b border-slate-200">Review Status</th>
              </tr>
            </thead>
            <tbody>
              {data.evidence.map(e => (
                <tr key={e._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-medium">{e.title} {e.fileName && <span className="text-slate-400 block text-xs">{e.fileName}</span>}</td>
                  <td className="p-3 text-slate-600">{e.control?.name || "—"}</td>
                  <td className="p-3 text-slate-600">{e.submittedBy}</td>
                  <td className="p-3"><StatusBadge value={e.reviewStatus} /></td>
                </tr>
              ))}
              {data.evidence.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-500">No evidence documented.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Obligations Section */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Privacy Obligations</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-3 border-b border-slate-200">Obligation</th>
                <th className="p-3 border-b border-slate-200">Type</th>
                <th className="p-3 border-b border-slate-200">Due Date</th>
                <th className="p-3 border-b border-slate-200">Status</th>
                <th className="p-3 border-b border-slate-200">Owner</th>
              </tr>
            </thead>
            <tbody>
              {data.obligations.map(o => (
                <tr key={o._id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-medium">{o.title}</td>
                  <td className="p-3 text-slate-600">{o.obligationType}</td>
                  <td className="p-3 text-slate-600">{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="p-3"><StatusBadge value={o.status} /></td>
                  <td className="p-3 text-slate-600">{o.owner}</td>
                </tr>
              ))}
              {data.obligations.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">No privacy obligations documented.</td></tr>}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
