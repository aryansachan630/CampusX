import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CommunityFeed } from "./pages/CommunityFeed";
import { ClubsEvents } from "./pages/ClubsEvents";
import { MentorshipHub } from "./pages/MentorshipHub";
import { AttendancePortal } from "./pages/AttendancePortal";
import { TimetableView } from "./pages/TimetableView";
import { GradesTranscript } from "./pages/GradesTranscript";
import { FeePayments } from "./pages/FeePayments";
import { NoticesBoard } from "./pages/NoticesBoard";
import { FacultyAdminPortal } from "./pages/FacultyAdminPortal";
import { CampusAICopilot } from "./components/CampusAICopilot";
import { api } from "./services/api";
import { Loader2, Sparkles } from "lucide-react";

function MainApp() {
  const { currentPersona } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState("");

  const handleOpenAI = (prompt = "") => {
    setAiInitialPrompt(prompt);
    setIsAIOpen(true);
  };

  // Data states
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [grades, setGrades] = useState(null);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        postsRes,
        clubsRes,
        eventsRes,
        mentorsRes,
        bookingsRes,
        attRes,
        ttRes,
        gradesRes,
        feesRes,
        noticesRes
      ] = await Promise.all([
        api.getPosts().catch(() => []),
        api.getClubs().catch(() => []),
        api.getEvents().catch(() => []),
        api.getMentors().catch(() => []),
        api.getBookings().catch(() => []),
        api.getAttendance().catch(() => null),
        api.getTimetable().catch(() => []),
        api.getGrades().catch(() => null),
        api.getFees().catch(() => null),
        api.getNotices().catch(() => [])
      ]);

      setPosts(postsRes);
      setClubs(clubsRes);
      setEvents(eventsRes);
      setMentors(mentorsRes);
      setBookings(bookingsRes);
      setAttendance(attRes);
      setTimetable(ttRes);
      setGrades(gradesRes);
      setFees(feesRes);
      setNotices(noticesRes);
    } catch (err) {
      console.error("Data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // When persona switches to faculty, we can suggest or support switching view
  useEffect(() => {
    if (currentPersona?.role === "faculty" && currentTab === "attendance") {
      // Keep on current tab or allow them to use faculty tools
    }
  }, [currentPersona]);

  const handleGlobalSearch = (query) => {
    if (!query) return;
    const q = query.toLowerCase();
    if (q.includes("attend") || q.includes("bunk")) {
      setCurrentTab("attendance");
    } else if (q.includes("time") || q.includes("class") || q.includes("schedule")) {
      setCurrentTab("timetable");
    } else if (q.includes("grade") || q.includes("cgpa") || q.includes("gpa")) {
      setCurrentTab("grades");
    } else if (q.includes("fee") || q.includes("pay") || q.includes("due")) {
      setCurrentTab("fees");
    } else if (q.includes("mentor") || q.includes("priya") || q.includes("interview")) {
      setCurrentTab("mentorship");
    } else if (q.includes("club") || q.includes("event") || q.includes("hackathon")) {
      setCurrentTab("clubs");
    } else if (q.includes("notice") || q.includes("exam")) {
      setCurrentTab("notices");
    } else {
      setCurrentTab("buzz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center">
          <p className="text-base font-bold text-white">CampusX Operating System</p>
          <p className="text-xs text-slate-400 mt-1">Connecting to campus API & syncing database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <Navbar onResetData={loadAllData} onSearch={handleGlobalSearch} />

      {/* Main Workspace */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Mobile Tab Quick Selector */}
          <div className="md:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-1.5 border-b border-slate-800">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "buzz", label: "Buzz" },
              { id: "clubs", label: "Clubs" },
              { id: "mentorship", label: "Mentors" },
              { id: "attendance", label: "Attendance" },
              { id: "timetable", label: "Timetable" },
              { id: "grades", label: "Grades" },
              { id: "fees", label: "Fees" },
              { id: "notices", label: "Notices" },
              { id: "admin", label: "Faculty" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  currentTab === t.id ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tab Component */}
          {currentTab === "dashboard" && (
            <Dashboard
              onTabChange={setCurrentTab}
              attendanceData={attendance}
              timetableData={timetable}
              postsData={posts}
              noticesData={notices}
              eventsData={events}
            />
          )}

          {currentTab === "buzz" && (
            <CommunityFeed posts={posts} onUpdatePosts={setPosts} />
          )}

          {currentTab === "clubs" && (
            <ClubsEvents
              clubs={clubs}
              events={events}
              onUpdateEvents={setEvents}
            />
          )}

          {currentTab === "mentorship" && (
            <MentorshipHub
              mentors={mentors}
              bookings={bookings}
              onUpdateBookings={setBookings}
            />
          )}

          {currentTab === "attendance" && (
            <AttendancePortal attendanceData={attendance} onOpenAI={handleOpenAI} />
          )}

          {currentTab === "timetable" && (
            <TimetableView timetableData={timetable} />
          )}

          {currentTab === "grades" && (
            <GradesTranscript gradesData={grades} />
          )}

          {currentTab === "fees" && (
            <FeePayments
              feesData={fees}
              onUpdateFees={setFees}
            />
          )}

          {currentTab === "notices" && (
            <NoticesBoard notices={notices} onOpenAI={handleOpenAI} />
          )}

          {currentTab === "admin" && (
            <FacultyAdminPortal
              attendanceData={attendance}
              onUpdateAttendance={setAttendance}
              onNoticeCreated={(newNotice) => setNotices((prev) => [newNotice, ...prev])}
            />
          )}
        </main>
      </div>

      {/* Floating AI Copilot Trigger */}
      <button
        onClick={() => handleOpenAI()}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer border border-white/20"
        aria-label="Open CampusGenie AI Copilot"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        <span className="text-xs font-bold hidden sm:inline">Ask CampusGenie AI</span>
      </button>

      {/* CampusGenie AI Copilot Modal */}
      <CampusAICopilot
        isOpen={isAIOpen}
        onClose={() => {
          setIsAIOpen(false);
          setAiInitialPrompt("");
        }}
        initialPrompt={aiInitialPrompt}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
