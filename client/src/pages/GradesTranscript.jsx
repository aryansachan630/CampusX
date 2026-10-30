import React, { useState } from "react";
import {
  GraduationCap,
  Award,
  TrendingUp,
  FileCheck,
  Target,
  ArrowRight,
  BookOpen
} from "lucide-react";

export function GradesTranscript({ gradesData }) {
  const [targetCgpa, setTargetCgpa] = useState("9.0");

  const cgpa = gradesData?.cgpa || 8.84;
  const credits = gradesData?.totalCreditsEarned || 118;
  const semesters = gradesData?.semesters || [];
  const courses = gradesData?.currentCourses || [];

  // Simple calculation for needed SGPA in remaining semesters
  const completedCredits = 118;
  const remainingCredits = 48; // Sem 7 & 8
  const currentTotalGradePoints = cgpa * completedCredits;
  const targetTotal = Number(targetCgpa) * (completedCredits + remainingCredits);
  const neededSgpa = ((targetTotal - currentTotalGradePoints) / remainingCredits).toFixed(2);

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Grades & Academic Performance</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-4 h-4" />
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Official academic transcript, semester credit progression, and internal assessment records.
        </p>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Cumulative GPA (CGPA)
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{cgpa}</span>
            <span className="text-xs text-slate-400">/ 10.0 Scale</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-2">
            First Class with Distinction range (&gt; 8.5)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Credits Earned
            </span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{credits}</span>
            <span className="text-xs text-slate-400">/ 166 Total Degree Credits</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(credits / 166) * 100}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Sem 6 Forecast
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-400 tracking-tight">8.92</span>
            <span className="text-xs text-slate-400">Projected SGPA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Based on completed mid-terms and lab evaluations
          </p>
        </div>
      </div>

      {/* Semester by Semester Progression */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Semester SGPA Progression
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {semesters.map((sem, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-center transition-all ${
                sem.status.includes("Current")
                  ? "bg-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-500/20"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                {sem.sem}
              </span>
              <p className="text-xl font-black text-white mt-1.5">{sem.sgpa}</p>
              <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                {sem.credits} Credits
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Current Semester Course-Level Performance Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Current Semester Course Internal Evaluation
          </h3>
          <span className="text-xs text-slate-400 font-medium">Session Oct 2026</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl" tabIndex={0} role="region" aria-label="Course evaluation table">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Course Code</th>
                <th className="px-4 py-3 font-semibold">Course Title</th>
                <th className="px-4 py-3 font-semibold">Credits</th>
                <th className="px-4 py-3 font-semibold">Mid-Term (30)</th>
                <th className="px-4 py-3 font-semibold">Quiz/Lab (20)</th>
                <th className="px-4 py-3 font-semibold">Projected Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {courses.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-400">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-white">{c.title}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{c.credits}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-200">{c.midTerm}</span>
                    <span className="text-slate-500"> / {c.maxMidTerm}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-200">{c.internalQuiz}</span>
                    <span className="text-slate-500"> / {c.maxInternal}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {c.gradeProjected}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Graduation CGPA Target Goal Planner */}
      <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Graduation Target CGPA Calculator</h3>
        </div>
        <p className="text-xs text-slate-400">
          Find out what SGPA you need across remaining semesters to graduate with your dream honors cut-off.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <div className="sm:w-64">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target CGPA</label>
            <input
              type="number"
              step="0.05"
              min="7.0"
              max="10.0"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex-1 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Required average SGPA in Sem 7 & 8:</span>
              <p className="text-xl font-black text-indigo-400 mt-0.5">{neededSgpa} / 10</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              Number(neededSgpa) <= 9.5 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {Number(neededSgpa) <= 9.5 ? "Very Achievable" : "High Effort Required"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
