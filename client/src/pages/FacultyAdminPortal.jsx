import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Send,
  PlusCircle,
  FileCheck,
  Users,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { api } from "../services/api";

export function FacultyAdminPortal({ attendanceData, onUpdateAttendance, onNoticeCreated }) {
  const { currentPersona } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("CSE301");
  const [markPresent, setMarkPresent] = useState(true);
  const [isSubmittingAtt, setIsSubmittingAtt] = useState(false);
  const [attFeedback, setAttFeedback] = useState("");

  // Notice form
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDept, setNoticeDept] = useState("Department of CSE");
  const [noticeUrgency, setNoticeUrgency] = useState("High");
  const [noticeCategory, setNoticeCategory] = useState("Academic");
  const [noticeSummary, setNoticeSummary] = useState("");
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState("");

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingAtt(true);
      const updated = await api.markAttendance({
        code: selectedCourse,
        attended: markPresent
      });

      if (onUpdateAttendance) onUpdateAttendance(updated);
      setAttFeedback(`Successfully recorded lecture session for ${selectedCourse}! Student marked as ${markPresent ? "Present" : "Absent"}.`);
      setTimeout(() => setAttFeedback(""), 4000);
    } catch (err) {
      console.error(err);
      setAttFeedback("Failed to update attendance.");
    } finally {
      setIsSubmittingAtt(false);
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeSummary.trim()) return;

    try {
      setIsSubmittingNotice(true);
      const newNotice = await api.createNotice({
        title: noticeTitle.trim(),
        department: noticeDept,
        urgency: noticeUrgency,
        category: noticeCategory,
        summary: noticeSummary.trim()
      });

      if (onNoticeCreated) onNoticeCreated(newNotice);
      setNoticeFeedback("Official university circular published across campus portal!");
      setNoticeTitle("");
      setNoticeSummary("");
      setTimeout(() => setNoticeFeedback(""), 4000);
    } catch (err) {
      console.error(err);
      setNoticeFeedback("Failed to broadcast circular.");
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Faculty & Administrative Suite</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                FACULTY PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Logged in as: <strong className="text-white">{currentPersona?.name}</strong> ({currentPersona?.title || currentPersona?.role})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Lecture Attendance Marking */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Record Lecture Attendance</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select course and mark lecture attendance for student batch (Section 6A).
          </p>

          {attFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              {attFeedback}
            </div>
          )}

          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course & Section</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="CSE301">CSE301 - Data Structures & Algorithms</option>
                <option value="CSE302">CSE302 - Operating Systems</option>
                <option value="CSE303">CSE303 - Database Management Systems</option>
                <option value="CSE304">CSE304 - Computer Networks</option>
                <option value="CSE305">CSE305 - Artificial Intelligence & ML</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mark Student Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMarkPresent(true)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    markPresent
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 ring-1 ring-emerald-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  ✓ Mark Present
                </button>
                <button
                  type="button"
                  onClick={() => setMarkPresent(false)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !markPresent
                      ? "bg-red-500/20 text-red-400 border-red-500/50 ring-1 ring-red-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  ✕ Mark Absent
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingAtt}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isSubmittingAtt ? "Submitting..." : "Submit Lecture Attendance"}
              </button>
            </div>
          </form>
        </div>

        {/* Module 2: Broadcast Official Circular */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Broadcast Campus Circular</h3>
          </div>
          <p className="text-xs text-slate-400">
            Publish official departmental notice visible on all student dashboards.
          </p>

          {noticeFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              {noticeFeedback}
            </div>
          )}

          <form onSubmit={handlePublishNotice} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Circular Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule for Mid-Term Lab Exam Retakes"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={noticeDept}
                  onChange={(e) => setNoticeDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency</label>
                <select
                  value={noticeUrgency}
                  onChange={(e) => setNoticeUrgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="High">High / Critical</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low / General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Summary & Instructions</label>
              <textarea
                rows={3}
                required
                placeholder="Detail the circular requirements, deadlines, and eligibility..."
                value={noticeSummary}
                onChange={(e) => setNoticeSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmittingNotice}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                {isSubmittingNotice ? "Publishing..." : "Publish Official Circular"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
