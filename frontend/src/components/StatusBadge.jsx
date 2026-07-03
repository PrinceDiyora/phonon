const COLOR_MAP = {
  // Risk severities
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
  // Generic statuses
  Open: "bg-red-100 text-red-700",
  Mitigating: "bg-amber-100 text-amber-700",
  Closed: "bg-emerald-100 text-emerald-700",
  Accepted: "bg-slate-100 text-slate-600",
  Implemented: "bg-emerald-100 text-emerald-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Gap: "bg-red-100 text-red-700",
  "Not Applicable": "bg-slate-100 text-slate-600",
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Compliant: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-red-100 text-red-700",
  "Not Started": "bg-slate-100 text-slate-600",
};

export default function StatusBadge({ value }) {
  const classes = COLOR_MAP[value] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {value}
    </span>
  );
}
