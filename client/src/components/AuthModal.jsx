import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  GraduationCap,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register
  } = useAuth();

  const [isLoginTab, setIsLoginTab] = useState(authModalMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login form state
  const [loginCreds, setLoginCreds] = useState({
    emailOrRollNo: "",
    password: ""
  });

  // Register form state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    rollNo: "",
    password: "",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    role: "student"
  });

  // Keep tab synced with modal mode when opened
  React.useEffect(() => {
    setIsLoginTab(authModalMode === "login");
    setError("");
    setSuccessMsg("");
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!loginCreds.emailOrRollNo || !loginCreds.password) {
      setError("Please enter your roll number / email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(loginCreds.emailOrRollNo, loginCreds.password);
      setSuccessMsg("Signed in successfully!");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regData.name || !regData.email || !regData.password) {
      setError("Name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);
      await register(regData);
      setSuccessMsg("Account created and signed in successfully!");
    } catch (err) {
      setError(err.message || "Failed to create account. Email or roll number may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (emailOrRoll, pass) => {
    setLoginCreds({
      emailOrRollNo: emailOrRoll,
      password: pass
    });
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Campus<span className="text-indigo-400">X</span> Authentication
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  KCC ITM
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                KCC Institute of Technology and Management Portal
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isLoginTab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                !isLoginTab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register New Student
            </button>
          </div>
        </div>

        {/* Feedback message alerts */}
        {error && (
          <div className="mx-6 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab contents (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoginTab ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Roll Number or College Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2304920100148 or student@kccitm.edu.in"
                    value={loginCreds.emailOrRollNo}
                    onChange={(e) =>
                      setLoginCreds({ ...loginCreds, emailOrRollNo: e.target.value })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={loginCreds.password}
                    onChange={(e) =>
                      setLoginCreds({ ...loginCreds, password: e.target.value })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to KCC CampusX"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-medium mb-2.5">
                  🚀 Quick 1-Click Institutional Demo Logins:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickFill("2304920100148", "password123")}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-semibold text-white group-hover:text-indigo-300">
                      Aryan Sachan
                    </div>
                    <div className="text-[9px] text-emerald-400">Student • CSE</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill("r.gupta@kccitm.edu.in", "password123")}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-semibold text-white group-hover:text-amber-300">
                      Dr. R. Gupta
                    </div>
                    <div className="text-[9px] text-amber-400">Faculty • HOD</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill("priya.nair@kccitm.edu.in", "password123")}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-semibold text-white group-hover:text-purple-300">
                      Priya Nair
                    </div>
                    <div className="text-[9px] text-purple-400">Senior Mentor</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER NEW STUDENT FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sachan"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Roll Number / ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2304920100148"
                    value={regData.rollNo}
                    onChange={(e) => setRegData({ ...regData, rollNo: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aryansachan630@gmail.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimum 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Eng (CSE)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Electronics & Communication">Electronics & Comm (ECE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Applied Sciences">Applied Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={regData.semester}
                    onChange={(e) => setRegData({ ...regData, semester: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "student", label: "Student" },
                    { id: "faculty", label: "Faculty" },
                    { id: "mentor", label: "Mentor" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegData({ ...regData, role: r.id })}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        regData.role === r.id
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? "Registering Student..." : "Create KCC CampusX Account"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Connected to KCC Institute of Technology & Management Unified Database
          </p>
        </div>
      </div>
    </div>
  );
}
