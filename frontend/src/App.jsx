import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Risks from "./pages/Risks.jsx";
import Controls from "./pages/Controls.jsx";
import Evidence from "./pages/Evidence.jsx";
import Obligations from "./pages/Obligations.jsx";
import ActivityLog from "./pages/ActivityLog.jsx";
import ReportPreview from "./pages/ReportPreview.jsx";
import { useRole } from "./context/RoleContext.jsx";

export default function App() {
  const { role } = useRole();
  return (
    <div className="flex min-h-screen bg-[#f2f4f7] font-sans">
      <Nav />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 px-8 flex items-center justify-between border-b border-transparent mt-2">
          <div className="flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm w-[400px]">
            <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search task" className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400" />
            <div className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200 font-medium">⌘F</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
            <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <img src="https://ui-avatars.com/api/?name=Totok+Michael&background=fca5a5&color=fff&rounded=true" alt="User" className="w-11 h-11 rounded-full shadow-sm" />
              <div className="text-sm">
                <div className="font-semibold text-slate-800">Totok Michael</div>
                <div className="text-slate-500 text-xs">tmichael20@mail.com</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 w-full max-w-[1400px] mx-auto">
          {role === "Auditor (Read-only)" && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Viewing as Auditor (Read-only). Edit controls are disabled.
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/controls" element={<Controls />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/obligations" element={<Obligations />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/report" element={<ReportPreview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
