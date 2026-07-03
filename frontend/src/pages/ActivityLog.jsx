import { useState, useEffect } from "react";
import api from "../api/client.js";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/activity");
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action === "Created") {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
      );
    }
    if (action === "Updated") {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
      );
    }
    if (action === "Deleted") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
      );
    }
  };

  if (loading) return <div className="text-slate-500">Loading activity...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-sm text-slate-500 mt-1">Global audit trail of all changes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-4">
          {logs.map((log) => (
            <div key={log._id} className="relative pl-8">
              <div className="absolute -left-4 top-0 bg-white">
                {getActionIcon(log.action)}
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-slate-800">{log.actor}</span>
                    <span className="text-slate-500 mx-2">{log.action.toLowerCase()}</span>
                    <span className="font-medium text-slate-700">{log.entityType}: {log.entityLabel}</span>
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(log.timestamp)}</span>
                </div>
                
                {log.action === "Updated" && log.changes && Object.keys(log.changes).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Object.entries(log.changes).map(([field, { from, to }]) => (
                      <div key={field} className="text-sm">
                        <span className="text-slate-500 font-medium capitalize">{field}: </span>
                        <span className="text-red-400 line-through mr-2">{String(from)}</span>
                        <span className="text-emerald-500">{String(to)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="pl-8 text-slate-500 text-sm">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
