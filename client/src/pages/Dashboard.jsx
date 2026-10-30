import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Sparkles,
  MapPin,
  ExternalLink
} from "lucide-react";

export function Dashboard({ onTabChange, attendanceData, timetableData, postsData, noticesData, eventsData }) {
  const { currentPersona } = useAuth();
  const isStudent = currentPersona?.role === "student";

  // Today's classes (default Monday/Tuesday schedule)
  const todayClasses = timetableData && timetableData.length > 0 ? timetableData[0].slots : [];
  const latestPosts = postsData ? postsData.slice(0, 2) : [];
  const urgentNotices = noticesData ? noticesData.filter(n => n.urgency === "High") : [];
  const featuredEvent = eventsData && eventsData.length > 0 ? eventsData[0] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>CampusX Portal • Semester 6 Academic Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentPersona?.name}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {isStudent
                ? `You have 4 classes today in Block B. Your overall attendance is in the safe zone at 84.5%.`
                : `Faculty workspace for CSE Department. 2 pending circulars and 1 club event awaiting approval.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onTabChange("attendance")}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Attendance</span>
            </button>
            <button
              onClick={() => onTabChange("buzz")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Campus Buzz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Metric */}
        <div
          onClick={() => onTabChange("attendance")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Overall Attendance</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {attendanceData?.overallPercentage || "84.5"}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">+2.1% this week</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
              style={{ width: `${attendanceData?.overallPercentage || 84.5}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">75% cutoff threshold safe</p>
        </div>

        {/* CGPA Metric */}
        <div
          onClick={() => onTabChange("grades")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cumulative GPA</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">8.84</span>
            <span className="text-xs text-indigo-300 font-medium">Top 5% of batch</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sem 6 internal projected: 8.92</span>
          </div>
        </div>

        {/* Pending Fees Metric */}
        <div
          onClick={() => onTabChange("fees")}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Semester 6 Dues</span>
            <span className={`p-2 rounded-xl ${currentPersona?.pendingFees > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              ₹{(currentPersona?.pendingFees ?? 30000).toLocaleString("en-IN")}
            </span>
            {currentPersona?.pendingFees > 0 ? (
              <span className="text-xs text-amber-400 font-medium">Due Nov 15</span>
            ) : (
              <span className="text-xs text-emerald-400 font-medium">All Clear</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
            <span>{currentPersona?.pendingFees > 0 ? "Pay via UPI / Card" : "View receipt"}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Featured Campus Event */}
        <div
          onClick={() => onTabChange("clubs")}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-300">Next Big Event</span>
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              HackCampus 2026
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">36hr National Hackathon</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Nov 14 - 15</span>
            <span className="text-emerald-400 font-medium">₹2.5L Prize Pool</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Schedule + Alerts & Buzz */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Today's Class Schedule</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Monday (Current)
              </span>
            </div>
            <button
              onClick={() => onTabChange("timetable")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Full Weekly View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {todayClasses.map((item, idx) => {
              const isOngoing = idx === 0; // First slot highlighted as live
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOngoing
                      ? "bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl text-center shrink-0 ${
                      isOngoing ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
                    }`}>
                      <p className="text-[10px] font-mono uppercase tracking-wider">{item.type}</p>
                      <p className="text-xs font-bold">{item.code}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{item.subject}</h4>
                        {isOngoing && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                            Live Now
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>{item.faculty}</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {item.room}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right text-xs font-mono font-medium text-slate-300 shrink-0">
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Campus Buzz & Urgent Circulars */}
        <div className="space-y-6">
          {/* Urgent Circulars Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Urgent Campus Circulars</h3>
              </div>
              <button
                onClick={() => onTabChange("notices")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {urgentNotices.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onTabChange("notices")}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold mb-1">
                    <span>{notice.category}</span>
                    <span className="text-slate-500 font-normal">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {notice.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Buzz Snippet */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Trending on Campus</h3>
              </div>
              <button
                onClick={() => onTabChange("buzz")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Open Buzz
              </button>
            </div>

            <div className="space-y-3">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onTabChange("buzz")}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <img src={post.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-[11px] font-semibold text-slate-300">{post.authorName}</span>
                    <span className="text-[10px] text-indigo-400 px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                      #{post.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 line-clamp-1">
                    {post.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                    <span>❤️ {post.likesCount} upvotes</span>
                    <span>💬 {post.comments.length} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
