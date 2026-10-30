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
  BookOpen,
  Clock,
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  Check,
  Plus,
  X
} from "lucide-react";
import { api } from "../services/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function FacultyAdminPortal({
  attendanceData,
  onUpdateAttendance,
  timetableData,
  onUpdateTimetable,
  onNoticeCreated
}) {
  const { currentPersona } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance"); // "attendance", "timetable", "notices"

  // Attendance form
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

  // Timetable manager state
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotIdx, setEditingSlotIdx] = useState(null);
  const [ttSubmitting, setTtSubmitting] = useState(false);
  const [ttFeedback, setTtFeedback] = useState("");

  const [slotForm, setSlotForm] = useState({
    day: "Monday",
    time: "09:00 - 10:00",
    subject: "Advanced Algorithms",
    code: "CSE301",
    room: "LT-102",
    faculty: currentPersona?.name || "Dr. Ramesh Gupta",
    type: "Lecture"
  });

  const currentDaySchedule = timetableData?.find(
    (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
  ) || timetableData?.[0];

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

  const openSlotEdit = (slot, idx) => {
    setEditingSlotIdx(idx);
    setSlotForm({
      day: selectedDay,
      time: slot.time,
      subject: slot.subject,
      code: slot.code,
      room: slot.room,
      faculty: slot.faculty,
      type: slot.type
    });
    setIsSlotModalOpen(true);
  };

  const openAddSlot = () => {
    setEditingSlotIdx(null);
    setSlotForm({
      day: selectedDay,
      time: "09:00 - 10:00",
      subject: "",
      code: "CSE301",
      room: "LT-102",
      faculty: currentPersona?.name || "Dr. Ramesh Gupta",
      type: "Lecture"
    });
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    try {
      setTtSubmitting(true);
      if (editingSlotIdx !== null) {
        const res = await api.updateTimetableSlot({
          ...slotForm,
          slotIndex: editingSlotIdx
        });
        if (onUpdateTimetable && res.timetable) onUpdateTimetable(res.timetable);
        setTtFeedback("Lecture slot updated and rescheduled successfully!");
      } else {
        const res = await api.addTimetableSlot(slotForm);
        if (onUpdateTimetable && res.timetable) onUpdateTimetable(res.timetable);
        setTtFeedback("New lecture session added to timetable!");
      }
      setTimeout(() => {
        setIsSlotModalOpen(false);
        setTtFeedback("");
      }, 700);
    } catch (err) {
      console.error(err);
      alert("Failed to update timetable");
    } finally {
      setTtSubmitting(false);
    }
  };

  const handleDeleteSlot = async (idx) => {
    if (!window.confirm("Cancel this scheduled lecture?")) return;
    try {
      const res = await api.deleteTimetableSlot(selectedDay, idx);
      if (onUpdateTimetable && res.timetable) onUpdateTimetable(res.timetable);
    } catch (err) {
      console.error(err);
      alert("Failed to delete slot");
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Faculty & Administrative Suite
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                  Faculty Controls
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Logged in as: <strong className="text-white">{currentPersona?.name}</strong> ({currentPersona?.title || "Professor"}) • KCC ITM
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Attendance Marker
            </button>
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "timetable"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Timetable Rescheduler
            </button>
            <button
              onClick={() => setActiveTab("notices")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "notices"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Circulars & Notices
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE MARKER */}
      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Daily Lecture Attendance Punch</h3>
                <p className="text-xs text-slate-400">Mark student roll-call for today's session</p>
              </div>
            </div>

            {attFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{attFeedback}</span>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subject</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="CSE301">Data Structures & Algorithms (CSE301)</option>
                  <option value="CSE302">Operating Systems (CSE302)</option>
                  <option value="CSE304">Computer Networks (CSE304)</option>
                  <option value="CSE303">Database Management Systems (CSE303)</option>
                  <option value="CSE305">Artificial Intelligence & ML (CSE305)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Attendance Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMarkPresent(true)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      markPresent
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ✓ Present (Attended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkPresent(false)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !markPresent
                        ? "bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ✗ Absent (Bunked)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAtt}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAtt ? "Recording..." : "Record Attendance Punch"}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Live Attendance Stats (Aryan Sachan)</h3>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Lectures Held:</span>
                <span className="font-bold text-white font-mono">{attendanceData?.totalLectures || 50}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Attended:</span>
                <span className="font-bold text-emerald-400 font-mono">{attendanceData?.totalAttended || 42}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Overall Percentage:</span>
                <span className="font-bold text-white font-mono">{attendanceData?.overallPercentage || "84.5"}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              When faculty records attendance here, the student's 75% cutoff tracker updates automatically in real-time.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TIMETABLE RESCHEDULER (Teacher self-service!) */}
      {activeTab === "timetable" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Manage & Reschedule Class Timetable</h3>
                <p className="text-xs text-slate-400">Teachers can swap rooms, change timings, or add extra lectures</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Day Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedDay.toLowerCase() === d.toLowerCase()
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddSlot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class</span>
              </button>
            </div>
          </div>

          {/* Slots List for Selected Day */}
          <div className="space-y-3">
            {currentDaySchedule?.slots?.map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-28 shrink-0 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs font-bold text-indigo-400">
                    {slot.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {slot.code}
                      </span>
                      <h4 className="text-sm font-bold text-white">{slot.subject}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {slot.room}
                      </span>
                      <span>Faculty: {slot.faculty}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                        {slot.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openSlotEdit(slot, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(idx)}
                    className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 cursor-pointer transition-colors"
                    title="Cancel class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CIRCULARS & NOTICES */}
      {activeTab === "notices" && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Broadcast University Circular</h3>
              <p className="text-xs text-slate-400">Post an official notification visible to all students</p>
            </div>
          </div>

          {noticeFeedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{noticeFeedback}</span>
            </div>
          )}

          <form onSubmit={handlePublishNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Circular Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule for Mid-Term Examination 2026"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={noticeDept}
                  onChange={(e) => setNoticeDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency</label>
                <select
                  value={noticeUrgency}
                  onChange={(e) => setNoticeUrgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="High">High / Critical</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low / General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Summary & Details</label>
              <textarea
                rows={3}
                required
                placeholder="Details of the circular..."
                value={noticeSummary}
                onChange={(e) => setNoticeSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingNotice}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              {isSubmittingNotice ? "Publishing..." : "Publish Circular"}
            </button>
          </form>
        </div>
      )}

      {/* TIMETABLE EDIT / RESCHEDULE MODAL */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSlotIdx !== null ? "Reschedule Lecture Slot" : "Add Extra Class"}
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ttFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{ttFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Day</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={slotForm.time}
                    onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={slotForm.code}
                    onChange={(e) => setSlotForm({ ...slotForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ttSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                >
                  {ttSubmitting ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
