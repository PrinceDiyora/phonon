import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";

const SEVERITY_COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#f97316", Critical: "#ef4444" };
const CONTROL_COLORS = { Implemented: "#10b981", "In Progress": "#f59e0b", Gap: "#ef4444", "Not Applicable": "#94a3b8" };

function StatCard({ label, value, sub, accent, primary, to }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
  };

  if (primary) {
    return (
      <div onClick={handleClick} className={`bg-brand-700 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between ${to ? 'cursor-pointer hover:bg-brand-600 transition-colors' : ''}`}>
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium text-white/90">{label}</div>
          <div className="w-8 h-8 rounded-full bg-white text-brand-700 flex items-center justify-center">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </div>
        </div>
        <div>
          <div className="text-4xl font-bold mt-4">{value}</div>
          {sub && <div className="text-xs text-brand-100 mt-3 flex items-center"><span className="w-4 h-4 mr-1 bg-white/20 rounded flex items-center justify-center text-[10px] text-white">↗</span>{sub}</div>}
        </div>
      </div>
    );
  }
  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between group transition-colors duration-300 ${to ? 'cursor-pointer hover:bg-brand-700 hover:border-brand-700' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="text-sm font-medium text-slate-600 group-hover:text-white/90 transition-colors duration-300">{label}</div>
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:border-transparent group-hover:text-brand-700 transition-colors duration-300">
           <svg className="w-4 h-4 transform rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </div>
      </div>
      <div>
        <div className={`text-4xl font-bold mt-4 ${accent || "text-slate-900"} group-hover:text-white transition-colors duration-300`}>{value}</div>
        {sub && <div className="text-xs text-slate-400 mt-3 flex items-center group-hover:text-brand-100 transition-colors duration-300"><span className="w-4 h-4 mr-1 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-500 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">↗</span>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([
      client.get("/dashboard/summary"),
      client.get("/activity")
    ])
      .then(([summaryRes, activityRes]) => {
        setSummary(summaryRes.data);
        setActivities(activityRes.data.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading dashboard…</div>;
  if (error)
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Failed to load dashboard: {error}. Is the backend running on port 5000?
      </div>
    );

  const severityData = Object.entries(summary.risksBySeverity)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const controlData = Object.entries(summary.controlsByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await client.get("/reports/snapshot");
                const data = res.data;
                const rows = [
                  ["Section", "ID/Name", "Status", "Owner/Submitter"],
                ];
                data.risks.forEach(r => rows.push(["Risk", r.title, r.status, r.owner]));
                data.controls.forEach(c => rows.push(["Control", c.name, c.status, c.owner]));
                data.evidence.forEach(e => rows.push(["Evidence", e.title, e.reviewStatus, e.submittedBy]));
                data.obligations.forEach(o => rows.push(["Obligation", o.title, o.status, o.owner]));

                const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `compliance_snapshot_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              } catch (err) {
                alert("Failed to generate CSV: " + err.message);
              }
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg"
          >
            Download CSV
          </button>
          <button
            onClick={() => navigate("/report")}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            View Printable Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard primary={true} to="/risks" label="Total Risks" value={summary.openRisks} sub={`${summary.totals.risks} total tracked`} />
        <StatCard
          label="Control Readiness"
          value={`${summary.controlReadinessPct}%`}
          sub={`${summary.totals.controls} mapped`}
          accent="text-slate-900"
          to="/controls"
        />
        <StatCard label="Pending Review" value={summary.pendingEvidenceReview} sub={`${summary.totals.evidence} total`} accent="text-slate-900" to="/evidence" />
        <StatCard label="Overdue Obli." value={summary.overdueObligations} sub={`${summary.totals.obligations} total`} accent="text-slate-900" to="/obligations" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Risks by Severity</h2>
          {severityData.length === 0 ? (
            <div className="text-slate-400 text-sm">No risks logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Controls by Status</h2>
          {controlData.length === 0 ? (
            <div className="text-slate-400 text-sm">No controls mapped yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={controlData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {controlData.map((entry) => (
                    <Cell key={entry.name} fill={CONTROL_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Upcoming Privacy Obligations</h2>
          {summary.upcomingObligations.length === 0 ? (
            <div className="text-slate-400 text-sm">Nothing upcoming — all obligations are compliant.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2">Obligation</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.upcomingObligations.map((o) => (
                  <tr key={o._id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-medium text-slate-800">{o.title}</td>
                    <td className="py-2.5 text-slate-500">{new Date(o.dueDate).toLocaleDateString()}</td>
                    <td className="py-2.5"><StatusBadge value={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Recent Activity</h2>
            <button onClick={() => navigate("/activity")} className="text-xs font-medium text-brand-700 hover:text-brand-800">View All →</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-slate-400 text-sm">No activity recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {activities.map((log) => (
                  <div key={log._id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 text-xs font-medium">
                      {log.action === "Created" ? "+" : log.action === "Updated" ? "✎" : "-"}
                    </div>
                    <div className="text-sm">
                      <div className="text-slate-800">
                        <span className="font-medium">{log.actor}</span> {log.action.toLowerCase()} {log.entityType}
                      </div>
                      <div className="text-slate-500 font-medium">{log.entityLabel}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
