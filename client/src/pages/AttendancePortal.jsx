import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calculator,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Info,
  Calendar,
  Sparkles
} from "lucide-react";

export function AttendancePortal({ attendanceData, onOpenAI }) {
  const { currentPersona } = useAuth();
  const [simulatedSubject, setSimulatedSubject] = useState("");
  const [simulateMiss, setSimulateMiss] = useState(0);
  const [simulateAttend, setSimulateAttend] = useState(0);

  const subjects = attendanceData?.subjects || [];
  const overallPercentage = attendanceData?.overallPercentage || 84.5;
  const minimumRequired = attendanceData?.minimumRequired || 75;

  // Selected subject for simulation or default to first
  const currentSubjectObj = subjects.find((s) => s.code === simulatedSubject) || subjects[0] || {};

  // Calculate simulated percentage
  const simAttended = (currentSubjectObj.attended || 0) + Number(simulateAttend);
  const simTotal = (currentSubjectObj.total || 0) + Number(simulateAttend) + Number(simulateMiss);
  const simPercentage = simTotal > 0 ? Number(((simAttended / simTotal) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Attendance & Eligibility Portal</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            University regulation requires a minimum of <strong className="text-slate-200">75% attendance</strong> per course to be eligible for end-semester examinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAI && (
            <button
              onClick={() => onOpenAI("Analyze my course attendance & calculate a recovery plan to cross 75%")}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Attendance Doctor</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Semester 6</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Overall Percentage Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Overall Academic Attendance
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              SAFE
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {overallPercentage}%
            </span>
            <span className="text-xs text-slate-400">
              ({attendanceData?.totalClassesAttended} / {attendanceData?.totalClassesConducted} Classes)
            </span>
          </div>

          <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Minimum required: {minimumRequired}%</span>
            <span className="text-emerald-400 font-semibold">+{(overallPercentage - minimumRequired).toFixed(1)}% buffer</span>
          </div>
        </div>

        {/* Attendance Status Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subject Health Breakdown
            </span>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4 Safe Subjects
                </span>
                <span className="text-slate-400">&gt; 75%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> 1 Warning Subject
                </span>
                <span className="text-slate-400">75% - 78%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-400 flex items-center gap-1.5 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> 1 Critical Shortage
                </span>
                <span className="text-slate-400">Networks (74.3%)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Attend 2 consecutive classes in Computer Networks to cross the 75% cutoff threshold.
          </p>
        </div>

        {/* Quick Advice / Rule */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Attendance Policies</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Medical leaves require approval from the Department HOD within 7 days of absence. Condonation penalty applies if attendance is between 65% - 75%.
          </p>
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-indigo-300 font-medium">
            Next attendance audit: Nov 15, 2026
          </div>
        </div>
      </div>

      {/* Interactive Subject-Wise Attendance Cards */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Course-By-Course Attendance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const isSafe = sub.percentage >= 80;
            const isWarning = sub.percentage >= 75 && sub.percentage < 80;
            const isCritical = sub.percentage < 75;

            return (
              <div
                key={sub.code}
                className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between ${
                  isCritical
                    ? "bg-red-950/20 border-red-500/40 ring-1 ring-red-500/20"
                    : isWarning
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      {sub.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSafe
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{sub.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{sub.faculty}</p>
                </div>

                <div className="my-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-white">{sub.percentage}%</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {sub.attended} / {sub.total} classes
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Bunk / Attendance margin */}
                <div className="pt-3 border-t border-slate-800/80 text-[11px]">
                  {isCritical ? (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Must attend next {sub.needToAttend} classes to reach 75%
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      You can safely bunk{" "}
                      <strong className="text-emerald-400 font-bold">{sub.canBunk}</strong> more classes
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Attendance Bunk & Recovery Simulator */}
      <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Attendance What-If Simulator</h3>
        </div>
        <p className="text-xs text-slate-400">
          Simulate how attending or skipping upcoming classes will impact your exam eligibility percentage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Course</label>
            <select
              value={simulatedSubject || currentSubjectObj.code}
              onChange={(e) => setSimulatedSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name} ({s.percentage}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Upcoming Classes to Attend ({simulateAttend})
            </label>
            <input
              type="range"
              min="0"
              max="15"
              value={simulateAttend}
              onChange={(e) => setSimulateAttend(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Upcoming Classes to Skip ({simulateMiss})
            </label>
            <input
              type="range"
              min="0"
              max="15"
              value={simulateMiss}
              onChange={(e) => setSimulateMiss(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>
        </div>

        {/* Simulation Output Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-center p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">Current</span>
              <p className="text-sm font-bold text-slate-200">{currentSubjectObj.percentage}%</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="text-center p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-[10px] text-indigo-300">Projected</span>
              <p className={`text-base font-extrabold ${simPercentage >= 75 ? "text-emerald-400" : "text-red-400"}`}>
                {simPercentage}%
              </p>
            </div>
            <span className="text-xs text-slate-300">
              After {simulateAttend + simulateMiss} more sessions: {simAttended} / {simTotal} attended
            </span>
          </div>

          <span className={`text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto ${
            simPercentage >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {simPercentage >= 75 ? "Eligible for Exams" : "Exam Detainment Risk"}
          </span>
        </div>
      </section>

      {/* Recent Class Logs Table (conforming to modern-web-guidance responsive table with sticky headers) */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Recent Lecture Attendance Logs
        </h3>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl" tabIndex={0} role="region" aria-label="Recent attendance logs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Time Slot</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {attendanceData?.recentLogs?.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{log.date}</td>
                  <td className="px-4 py-3 font-medium text-white">{log.subject}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{log.slot}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        log.status === "Present"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {log.status === "Present" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
