import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Bell,
  Search,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Award,
  LogIn,
  UserPlus,
  Edit3,
  LogOut,
  User
} from "lucide-react";
import { api } from "../services/api";

export function Navbar({ onResetData, onSearch }) {
  const {
    currentPersona,
    currentUser,
    personas,
    switchPersona,
    isAuthenticated,
    logout,
    openAuthModal,
    openProfileModal
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const activeUser = currentUser || currentPersona;

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await api.resetDb();
      if (onResetData) onResetData();
      alert("CampusX demo database has been reset to initial state!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "faculty":
        return { label: "Faculty / Admin", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: ShieldCheck };
      case "mentor":
        return { label: "Senior Mentor", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Award };
      default:
        return { label: "Student", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: UserCheck };
    }
  };

  const roleInfo = activeUser ? getRoleBadge(activeUser.role) : getRoleBadge("student");
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Campus<span className="text-indigo-400 font-black">X</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wide uppercase">
                KCC Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">KCC Institute of Technology and Management</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search posts, mentors, events, courses (e.g. 'DSA', 'Hackathon')..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sign In / Register Button (Visible if not authenticated) */}
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          ) : (
            <button
              onClick={openProfileModal}
              title="Edit Profile"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Profile</span>
            </button>
          )}

          {/* Reset Demo Data button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset sample data"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-indigo-400" : ""}`} />
            <span>Reset</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
              aria-label="Campus notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white">Live Notifications</span>
                  <span className="text-[10px] text-indigo-400 font-medium">3 unread</span>
                </div>
                <div className="divide-y divide-slate-800/60 mt-1">
                  <div className="py-2 text-xs">
                    <p className="font-medium text-slate-200">Exam schedule circular published</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Odd-semester theory exams begin Nov 28.</p>
                  </div>
                  <div className="py-2 text-xs">
                    <p className="font-medium text-slate-200">Attendance Alert: Networks (74.3%)</p>
                    <p className="text-[11px] text-amber-400 mt-0.5">Need 2 more classes to hit 75% cutoff.</p>
                  </div>
                  <div className="py-2 text-xs">
                    <p className="font-medium text-slate-200">HackCampus 2026: 55 spots left</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">RSVP deadline is this Friday.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Persona / User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer group"
            >
              <img
                src={activeUser?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"}
                alt={activeUser?.name || "User"}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {activeUser?.name || "Aryan Sachan"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium flex items-center gap-1 ${roleInfo.bg}`}>
                    <RoleIcon className="w-2.5 h-2.5" />
                    {roleInfo.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors ml-1" />
            </button>

            {/* Profile & Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User card header */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeUser?.avatar}
                      alt={activeUser?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/50"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{activeUser?.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {activeUser?.rollNo || activeUser?.facultyId || "Roll: 2304920100148"}
                      </p>
                      <p className="text-[10px] text-indigo-400 truncate mt-0.5">
                        {activeUser?.collegeName || "KCC Institute of Technology and Management"}
                      </p>
                    </div>
                  </div>

                  {/* Actions inside card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openProfileModal();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Profile
                    </button>

                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          openAuthModal("login");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3 h-3" />
                        Sign In
                      </button>
                    )}
                  </div>
                </div>

                {/* Persona Switcher Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between px-1 mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Demo Personas / Switch Roles
                    </p>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openAuthModal("register");
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      New Student
                    </button>
                  </div>

                  <div className="space-y-1">
                    {personas.map((p) => {
                      const badge = getRoleBadge(p.role);
                      const isSelected = p.id === activeUser?.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchPersona(p.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected ? "bg-indigo-600/15 border border-indigo-500/30 text-white" : "hover:bg-slate-800/70 text-slate-300"
                          }`}
                        >
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold truncate text-white">{p.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{p.title || p.department}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
