import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  Calendar,
  MapPin,
  User,
  BookOpen,
  LayoutGrid,
  List,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  X,
  ShieldCheck,
  Check,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import { api } from "../services/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri"
};

export function TimetableView({ timetableData, onUpdateTimetable, attendanceData, onOpenAI }) {
  const { currentPersona } = useAuth();
  const isFacultyOrAdmin = currentPersona?.role === "faculty" || currentPersona?.role === "admin";

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "weekly"

  // Teacher edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); // "edit" or "add"
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);

  // Form state
  const [slotForm, setSlotForm] = useState({
    day: "Monday",
    time: "09:00 - 10:00",
    subject: "",
    code: "",
    room: "",
    faculty: "",
    type: "Lecture"
  });

  const currentDaySchedule = timetableData?.find(
    (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
  ) || timetableData?.[0];

  const openAddModal = () => {
    setModalMode("add");
    setEditingSlotIndex(null);
    setSlotForm({
      day: selectedDay,
      time: "09:00 - 10:00",
      subject: "",
      code: "CSE305",
      room: "402B (Lecture Hall)",
      faculty: currentPersona?.name || "Dr. Ramesh Gupta",
      type: "Lecture"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slot, index) => {
    setModalMode("edit");
    setEditingSlotIndex(index);
    setSlotForm({
      day: selectedDay,
      time: slot.time,
      subject: slot.subject,
      code: slot.code,
      room: slot.room,
      faculty: slot.faculty,
      type: slot.type
    });
    setActiveMenuIndex(null);
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (modalMode === "add") {
        const res = await api.addTimetableSlot(slotForm);
        if (onUpdateTimetable && res.timetable) {
          onUpdateTimetable(res.timetable);
        }
        setFeedback("New class scheduled successfully!");
      } else {
        const res = await api.updateTimetableSlot({
          ...slotForm,
          slotIndex: editingSlotIndex
        });
        if (onUpdateTimetable && res.timetable) {
          onUpdateTimetable(res.timetable);
        }
        setFeedback("Timetable updated in real time!");
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback("");
      }, 700);
    } catch (err) {
      console.error(err);
      alert("Failed to save timetable change: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (index) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled lecture?")) return;
    try {
      const res = await api.deleteTimetableSlot(selectedDay, index);
      if (onUpdateTimetable && res.timetable) {
        onUpdateTimetable(res.timetable);
      }
      setActiveMenuIndex(null);
    } catch (err) {
      console.error(err);
      alert("Failed to remove lecture slot");
    }
  };

  // Attendance stats for the side overview ring
  const overallPct = attendanceData?.overallPercentage || 84.5;
  const attendedClasses = attendanceData?.totalAttended || 42;
  const totalClasses = attendanceData?.totalLectures || 50;
  const isSafe = overallPct >= 75;

  // SVG Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Autumn Session 2026 • KCC ITM
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Section 6A (CSE)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Weekly Schedule: Nov 02 - Nov 06, 2026
          </h1>
        </div>

        {/* Day Pills & Teacher Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Pills matching classy mockup */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            {DAYS.map((day) => {
              const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {DAY_SHORT[day]}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode("daily")}
              title="Daily Cards View"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "daily" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              title="Weekly Grid Matrix"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "weekly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Teacher: Add/Edit Timetable Slot button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout (Matching Sample Photo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Classes (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                {selectedDay}, November 2026
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {currentDaySchedule?.slots?.length || 0} Lectures Scheduled
            </span>
          </div>

          {/* Lecture Cards List */}
          <div className="space-y-3.5">
            {currentDaySchedule?.slots?.map((slot, idx) => {
              const isLive = selectedDay === "Monday" && idx === 0;

              return (
                <div
                  key={idx}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 shadow-xl overflow-hidden ${
                    isLive
                      ? "bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-slate-900/90 border-indigo-500/40 ring-1 ring-indigo-500/30"
                      : "bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Time pill & Period */}
                    <div className="sm:w-36 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-slate-800/80 pb-3 sm:pb-0 sm:pr-4">
                      <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
                        Period {idx + 1}
                      </span>
                      <p className="text-sm font-mono font-bold text-white mt-0.5">{slot.time}</p>
                    </div>

                    {/* Subject info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                          {slot.code}
                        </span>
                        <h4 className="text-base font-bold text-white truncate group-hover:text-indigo-200 transition-colors">
                          {slot.subject}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        {/* Room */}
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-medium">{slot.room}</span>
                        </div>

                        {/* Faculty */}
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-300 font-medium">{slot.faculty}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Faculty
                          </span>
                        </div>

                        {/* Type badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                          {slot.type}
                        </span>
                      </div>
                    </div>

                    {/* Status & Options */}
                    <div className="shrink-0 flex items-center gap-3 justify-between sm:justify-end">
                      {isLive ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse shadow-lg shadow-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Live Class Now</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs font-medium border border-slate-700/50">
                          Upcoming
                        </span>
                      )}

                      {/* Edit menu / Teacher controls */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuIndex(activeMenuIndex === idx ? null : idx)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          aria-label="Slot options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Actions dropdown */}
                        {activeMenuIndex === idx && (
                          <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => openEditModal(slot, idx)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer text-left"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Lecture / Room</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(idx)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Cancel Class</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!currentDaySchedule?.slots || currentDaySchedule.slots.length === 0) && (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No classes scheduled for {selectedDay}</p>
                <p className="text-xs text-slate-500 mt-1">Teachers can add a lecture using the button above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Overview & Cutoff Ring (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Attendance Overview</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Target: 75%
              </span>
            </div>

            {/* Circular Progress Ring matching mockup */}
            <div className="relative flex items-center justify-center py-4">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Glowing Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inside Text */}
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white tracking-tight">{overallPct}%</span>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                  Target: 75%
                </p>
              </div>
            </div>

            {/* Stats Breakdown List matching mockup */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Classes Attended:</span>
                <span className="font-bold text-white font-mono">
                  {attendedClasses} / {totalClasses}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Current Status:</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isSafe ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isSafe ? "Safe Zone (Good)" : "Warning (<75%)"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Below 75% Cutoff:</span>
                <span className="font-bold text-emerald-400 font-mono">0 Classes</span>
              </div>
            </div>

            {/* Quick AI Doctor Advice button */}
            <button
              onClick={() => onOpenAI && onOpenAI("Generate an attendance recovery plan for this semester")}
              className="w-full py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Stethoscope className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>CampusGenie Attendance Doctor</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEACHER SLOT EDIT / ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === "add" ? "Schedule New Class" : "Edit Lecture Slot"}
                  </h3>
                  <p className="text-xs text-slate-400">Teacher & Admin Live Timetable Manager</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Day</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                    placeholder="09:00 - 10:00"
                    value={slotForm.time}
                    onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Algorithms"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS401"
                    value={slotForm.code}
                    onChange={(e) => setSlotForm({ ...slotForm, code: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 402B (Lecture Hall)"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Faculty In-Charge</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={slotForm.faculty}
                    onChange={(e) => setSlotForm({ ...slotForm, faculty: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Session Type</label>
                  <select
                    value={slotForm.type}
                    onChange={(e) => setSlotForm({ ...slotForm, type: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical">Practical (Lab)</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : modalMode === "add" ? "Schedule Lecture" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
