import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Key,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  Stethoscope,
  FileText,
  Lightbulb,
  Mail,
  GraduationCap,
  Code
} from "lucide-react";
import { api } from "../services/api";

export function CampusAICopilot({ isOpen, onClose, initialPrompt = "" }) {
  const { currentPersona } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `👋 Hi **${currentPersona?.name || "Student"}**! I am **CampusGenie**, your official AI Copilot at CampusX.\n\nI have live context on your courses, attendance, exam notices, and campus events. How can I help you today?`,
      source: "campusx-contextual-engine",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("cx_gemini_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [isCopied, setIsCopied] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend = input) => {
    const text = (textToSend || "").trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.askAI(text, {
        studentName: currentPersona?.name,
        rollNo: currentPersona?.rollNo,
        role: currentPersona?.role
      }, apiKey || null);

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: res.reply,
        source: res.source,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: "Sorry, I ran into an issue connecting to the AI service. Please try again.",
          time: "Just now"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setIsCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem("cx_gemini_key", apiKey.trim());
    setShowSettings(false);
    alert("Gemini API Key saved! Live model 'gemini-2.5-flash' will be used for responses.");
  };

  const quickPrompts = [
    { label: "Attendance Doctor", prompt: "Analyze my course attendance & calculate a recovery plan to cross 75%", icon: Stethoscope },
    { label: "Summarize Exams Notice", prompt: "Summarize the upcoming odd-semester theory exam schedule circular", icon: FileText },
    { label: "Hackathon Project Ideas", prompt: "Give me 3 winning AI project ideas for HackCampus 2026", icon: Lightbulb },
    { label: "Draft Medical Leave Email", prompt: "Draft a formal medical leave request to HOD Dr. Ramesh Gupta", icon: Mail },
    { label: "Hit 9.0 CGPA Strategy", prompt: "Calculate how to raise my CGPA from 8.84 to 9.0 in remaining semesters", icon: GraduationCap },
    { label: "Explain Dijkstra DSA", prompt: "Explain Dijkstra's Algorithm in DSA with code and time complexity", icon: Code }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[480px] sm:h-[680px] z-50 flex flex-col bg-slate-900 border border-indigo-500/30 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">CampusGenie AI</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                {apiKey ? "Gemini 2.5 Flash" : "Campus AI"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Context-aware academic & career mentor</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel Toggle */}
      {showSettings && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 text-xs">
          <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Gemini API Key (Optional)</span>
          </h4>
          <p className="text-[11px] text-slate-400 mb-2">
            Leave blank to use the built-in CampusX Intelligent Engine, or paste your own Gemini key for live model generation.
          </p>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-lg ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed text-xs">
                  {m.content}
                </div>

                {!isUser && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="font-mono">
                      {m.source === "gemini-2.5-flash" ? "⚡ Gemini 2.5 Flash" : "🎓 CampusX Engine"}
                    </span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied[m.id] ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-indigo-400 animate-pulse">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            </div>
            <span>CampusGenie is analyzing campus data & writing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Icon className="w-3 h-3 text-indigo-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about attendance, courses, exams, code, hackathons..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
