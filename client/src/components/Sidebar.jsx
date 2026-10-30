import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  MessageSquareShare,
  CalendarDays,
  Users2,
  CheckCircle2,
  Clock,
  GraduationCap,
  CreditCard,
  FileText,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export function Sidebar({ currentTab, onTabChange }) {
  const { currentPersona } = useAuth();
  const isFaculty = currentPersona?.role === "faculty";

  const socialLinks = [
    { id: "buzz", label: "Campus Buzz", icon: MessageSquareShare, badge: "Trending" },
    { id: "clubs", label: "Clubs & Events", icon: CalendarDays, badge: "2 New" },
    { id: "mentorship", label: "Senior Mentors", icon: Users2, badge: "Active" }
  ];

  const erpLinks = [
    { id: "attendance", label: "Attendance Portal", icon: CheckCircle2, badge: "84.5%" },
    { id: "timetable", label: "Class Timetable", icon: Clock },
    { id: "grades", label: "Grades & CGPA", icon: GraduationCap, badge: "8.84" },
    { id: "fees", label: "Fees & Receipts", icon: CreditCard, alert: currentPersona?.pendingFees > 0 },
    { id: "notices", label: "Official Circulars", icon: FileText }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      {/* Student/User mini badge */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900 border border-indigo-500/10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={currentPersona?.avatar}
              alt={currentPersona?.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">{currentPersona?.name}</h4>
            <p className="text-[11px] text-indigo-300/80 truncate">
              {currentPersona?.role === "student" ? `${currentPersona.semester} • ${currentPersona.rollNo}` : currentPersona?.department}
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-6 flex-1 text-xs">
        {/* Main Dashboard */}
        <div>
          <button
            onClick={() => onTabChange("dashboard")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
              currentTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Campus Dashboard</span>
            </div>
          </button>
        </div>

        {/* Section 1: Campus Life & Social */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Student Network</span>
          </div>
          <div className="space-y-1">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Academic ERP */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Academic ERP</span>
          </div>
          <div className="space-y-1">
            {erpLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Fee due soon" />
                  )}
                  {item.badge && !item.alert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-emerald-500/20 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Faculty / Admin Controls */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Administration</span>
            {isFaculty && (
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 rounded border border-amber-500/20">Active</span>
            )}
          </div>
          <button
            onClick={() => onTabChange("admin")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              currentTab === "admin"
                ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                : isFaculty
                ? "text-amber-400 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Faculty Admin Suite</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </nav>

      {/* Footer system status */}
      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Campus Server Online
        </span>
        <span className="font-mono text-[10px]">v1.0.0</span>
      </div>
    </aside>
  );
}
