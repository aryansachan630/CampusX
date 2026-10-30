import React, { useState } from "react";
import {
  Clock,
  Calendar,
  MapPin,
  User,
  BookOpen,
  LayoutGrid,
  List,
  Sparkles
} from "lucide-react";

export function TimetableView({ timetableData }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "weekly"

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDaySchedule = timetableData?.find((d) => d.day === selectedDay) || timetableData?.[0];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Class Timetable & Schedules</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section 6A • B.Tech Computer Science & Engineering (Autumn Session 2026)
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "daily" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Day View</span>
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "weekly" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Weekly Grid</span>
          </button>
        </div>
      </div>

      {/* Day Selector (for Day View) */}
      {viewMode === "daily" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDay === day
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Daily Timeline View */}
      {viewMode === "daily" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Schedule for <strong className="text-white font-bold">{selectedDay}</strong>
            </span>
            <span>{currentDaySchedule?.slots?.length || 0} Scheduled Sessions</span>
          </div>

          <div className="space-y-3">
            {currentDaySchedule?.slots?.map((slot, idx) => {
              const isOngoing = selectedDay === "Monday" && idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                    isOngoing
                      ? "bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Time block */}
                    <div className="w-32 shrink-0 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
                      <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">
                        Period {idx + 1}
                      </span>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">{slot.time}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                          {slot.code}
                        </span>
                        <h4 className="text-base font-bold text-white">{slot.subject}</h4>
                        {isOngoing && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                            Live Class
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {slot.faculty}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-slate-300">{slot.room}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {slot.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Matrix Grid */}
      {viewMode === "weekly" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl" tabIndex={0} role="region" aria-label="Weekly timetable matrix">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold w-28">Day</th>
                <th className="px-3 py-3 font-semibold">09:00 - 10:00</th>
                <th className="px-3 py-3 font-semibold">10:00 - 11:00</th>
                <th className="px-3 py-3 font-semibold">11:15 - 12:15</th>
                <th className="px-3 py-3 font-semibold">12:15 - 01:15</th>
                <th className="px-3 py-3 font-semibold">02:00 - 04:00 (Lab)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {timetableData?.map((dayObj) => (
                <tr key={dayObj.day} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-white bg-slate-950/40">
                    {dayObj.day}
                  </td>
                  {dayObj.slots?.map((slot, sIdx) => (
                    <td key={sIdx} className="px-3 py-3 align-top">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          {slot.code}
                        </span>
                        <p className="text-xs font-medium text-slate-200 line-clamp-1">{slot.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate">{slot.room}</p>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
