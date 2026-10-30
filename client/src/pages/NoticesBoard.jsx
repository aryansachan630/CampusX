import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  Download,
  Calendar,
  Building,
  Search,
  Filter,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Modal } from "../components/Modal";

export function NoticesBoard({ notices, onOpenAI }) {
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNotice, setActiveNotice] = useState(null);

  const filteredNotices = notices.filter((n) => {
    const matchesUrgency = filterUrgency === "All" || n.urgency.toLowerCase() === filterUrgency.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Official Circulars & Notices</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Authorized university circulars released by the Dean's office, Examination branch, and Training & Placement cell.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "High", "Medium", "Low"].map((urg) => (
            <button
              key={urg}
              onClick={() => setFilterUrgency(urg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filterUrgency === urg
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {urg === "All" ? "All Priorities" : `${urg} Priority`}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => {
          const isHigh = notice.urgency === "High";

          return (
            <div
              key={notice.id}
              onClick={() => setActiveNotice(notice)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isHigh
                  ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60 ring-1 ring-amber-500/20"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isHigh
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {notice.urgency.toUpperCase()} PRIORITY
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    {notice.department}
                  </span>
                  <span className="text-[11px] text-slate-500">• {notice.date}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">{notice.summary}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
                {onOpenAI && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAI(`Summarize this circular: "${notice.title}". Department: ${notice.department}. Content: ${notice.summary}`);
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Summarize</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNotice(notice);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Read Notice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Detail Reader Modal */}
      {activeNotice && (
        <Modal
          isOpen={!!activeNotice}
          onClose={() => setActiveNotice(null)}
          title={activeNotice.title}
          subtitle={`Issued by: ${activeNotice.department} • Date: ${activeNotice.date}`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">
                Category: {activeNotice.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                Urgency: {activeNotice.urgency}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-200">
              {activeNotice.summary}
              <p className="mt-3 text-slate-400">
                All concerned heads of departments and faculty advisors are requested to disseminate this information to registered students. Hall tickets and gate clearances must be validated on the portal.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">Ref: CX-NOTIF-2026-OCT</span>
              <button
                onClick={() => {
                  alert("Downloading official university signed PDF circular...");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Circular PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
