import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  Users,
  MapPin,
  Clock,
  Trophy,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Ticket,
  ChevronRight
} from "lucide-react";
import { Modal } from "../components/Modal";
import { api } from "../services/api";

export function ClubsEvents({ clubs, events, onUpdateEvents }) {
  const { currentPersona } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newClubName, setNewClubName] = useState("CodeX");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newCategory, setNewCategory] = useState("Technical");
  const [newPrize, setNewPrize] = useState("");
  const [newCapacity, setNewCapacity] = useState("100");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["All", "Technical", "Workshop", "Business", "Cultural"];

  const filteredEvents = events.filter((e) => {
    if (activeCategory === "All") return true;
    return e.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleToggleRsvp = async (eventId) => {
    try {
      const res = await api.toggleRsvp(eventId);
      onUpdateEvents((prev) =>
        prev.map((e) => {
          if (e.id === eventId) {
            return { ...e, isUserRsvpd: res.isUserRsvpd, rsvpsCount: res.rsvpsCount };
          }
          return e;
        })
      );
    } catch (err) {
      console.error("RSVP failed", err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVenue.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await api.createEvent({
        title: newTitle.trim(),
        clubName: newClubName,
        date: newDate || "Upcoming Nov 2026",
        time: newTime || "02:00 PM",
        venue: newVenue.trim(),
        category: newCategory,
        prizePool: newPrize || "Certificates & Swag",
        capacity: newCapacity,
        description: newDescription.trim()
      });

      onUpdateEvents((prev) => [created, ...prev]);
      setIsEventModalOpen(false);

      // Reset
      setNewTitle("");
      setNewVenue("");
      setNewPrize("");
      setNewDescription("");
    } catch (err) {
      console.error("Create event failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Clubs & Campus Events</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarDays className="w-4 h-4" />
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover student societies, register for national hackathons, workshops, and cultural fests.
          </p>
        </div>

        <button
          onClick={() => setIsEventModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Organize / Host Event</span>
        </button>
      </div>

      {/* Campus Clubs Showcase */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Official College Societies & Chapters
          </h3>
          <span className="text-xs text-indigo-400 font-medium">4 Active Clubs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 overflow-hidden transition-all shadow-lg flex flex-col"
            >
              <div className="h-28 overflow-hidden relative">
                <img
                  src={club.banner}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 text-indigo-300 backdrop-blur-md border border-indigo-500/20">
                  {club.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {club.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {club.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {club.membersCount} Members
                  </span>
                  <span className="text-slate-500 truncate max-w-[100px]">Lead: {club.lead}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Campus Events Board */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Upcoming Campus Events</h3>
            <p className="text-xs text-slate-400">RSVP to reserve seat & receive calendar reminders</p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const spotsLeft = Math.max(0, evt.capacity - evt.rsvpsCount);

            return (
              <div
                key={evt.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden transition-all shadow-xl flex flex-col"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow">
                      {evt.clubName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-200 backdrop-blur-md border border-slate-700">
                      {evt.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-400 font-mono">{evt.date}</p>
                      <h4 className="text-base font-bold text-white line-clamp-1">{evt.title}</h4>
                    </div>
                    {evt.prizePool !== "N/A" && (
                      <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {evt.prizePool}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 py-2 border-y border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-white">{evt.rsvpsCount}</span>
                      <span className="text-slate-400"> / {evt.capacity} attending</span>
                      <p className="text-[10px] text-emerald-400 font-medium">{spotsLeft} spots available</p>
                    </div>

                    <button
                      onClick={() => handleToggleRsvp(evt.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        evt.isUserRsvpd
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      }`}
                    >
                      {evt.isUserRsvpd ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RSVP Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="w-3.5 h-3.5" />
                          <span>RSVP Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Host Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Host / Propose a Campus Event"
        subtitle="Submit your event proposal to the Student Activity Center & Faculty Advisor"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Algorithmic Masterclass & Speed Run"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organizing Club</label>
              <select
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="CodeX">CodeX (Dev & DSA)</option>
                <option value="RobotiX">RobotiX & IoT</option>
                <option value="E-Cell">E-Cell (Startups)</option>
                <option value="Kalakriti">Kalakriti (Culture)</option>
                <option value="Student Council">Student Council</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Workshop">Workshop</option>
                <option value="Business">Business</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="text"
                placeholder="e.g. Nov 22, 2026"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time & Duration</label>
              <input
                type="text"
                placeholder="e.g. 03:00 PM - 06:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Venue</label>
              <input
                type="text"
                required
                placeholder="e.g. Audi 2 or CS Lab 4"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prize / Incentive</label>
              <input
                type="text"
                placeholder="e.g. ₹50,000 or Swag & Medals"
                value={newPrize}
                onChange={(e) => setNewPrize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Description</label>
            <textarea
              rows={3}
              placeholder="Explain the objectives, rules, and benefits for students..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Event Proposal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
