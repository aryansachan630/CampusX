import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users2,
  Star,
  Calendar,
  CheckCircle,
  Video,
  Award,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Clock,
  BookOpen
} from "lucide-react";
import { Modal } from "../components/Modal";
import { api } from "../services/api";

export function MentorshipHub({ mentors, bookings, onUpdateBookings }) {
  const { currentPersona } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [latestBooking, setLatestBooking] = useState(null);

  const handleOpenBookModal = (mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot(mentor.availableSlots[0] || "");
    setBookingTopic("");
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;

    try {
      setIsSubmitting(true);
      const newBooking = await api.bookMentor({
        mentorId: selectedMentor.id,
        studentId: currentPersona?.id || "student-1",
        topic: bookingTopic || "1-on-1 Portfolio & DSA Guidance",
        slot: selectedSlot
      });

      onUpdateBookings((prev) => [newBooking, ...prev]);
      setLatestBooking(newBooking);
      setSelectedMentor(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studyCircles = [
    { name: "LeetCode 75 Grind Group", members: 86, topic: "Arrays, Trees, Graphs & DP", lead: "Priya Nair" },
    { name: "GATE CSE 2027 Study Room", members: 42, topic: "Theory of Computation & OS", lead: "Rohan Mehta" },
    { name: "Full-Stack & Open Source Circle", members: 64, topic: "React, Node.js & Docker", lead: "Sneha Reddy" }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Senior-Junior Mentorship Hub</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users2 className="w-4 h-4" />
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Connect with verified seniors and alumni placed at top tech companies for resume reviews, mock interviews, and research guidance.
        </p>
      </div>

      {/* Active Bookings (if any) */}
      {bookings && bookings.length > 0 && (
        <section className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Your Active 1-on-1 Guidance Sessions</span>
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{b.mentorName}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">• {b.slot}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{b.topic}</p>
                </div>

                <a
                  href={b.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Session</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mentors Directory */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Featured Senior Mentors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-white truncate">{m.name}</h4>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{m.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5">{m.role}</p>
                  <p className="text-[11px] text-slate-400">{m.year}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {m.bio}
              </p>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-1.5">
                {m.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action & Availability */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Next slot: {m.availableSlots[0] || "Available"}</span>
                </div>

                <button
                  onClick={() => handleOpenBookModal(m)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Book 1-on-1
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Peer Study Circles */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Campus Study & Prep Circles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {studyCircles.map((circle, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-[11px] font-semibold">{circle.members} Students Active</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{circle.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{circle.topic}</p>
              <span className="text-[11px] text-indigo-300 font-medium">Circle Lead: {circle.lead}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedMentor && (
        <Modal
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          title={`Book 1-on-1 Guidance with ${selectedMentor.name}`}
          subtitle={`${selectedMentor.role} • Rating ${selectedMentor.rating} ⭐`}
        >
          <form onSubmit={handleBookSession} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select What You'd Like Help With
              </label>
              <select
                value={bookingTopic}
                onChange={(e) => setBookingTopic(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Choose Discussion Focus --</option>
                <option value="Resume & Portfolio Review for Top Product Firms">Resume & Portfolio Review</option>
                <option value="Data Structures & Algorithms Mock Coding Round">DSA Mock Coding Round</option>
                <option value="System Design & Full Stack Project Feedback">System Design / Project Review</option>
                <option value="Research Paper Writing & Higher Studies (MS/PhD)">Research & Higher Studies Guidance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Choose an Available Slot
              </label>
              <div className="space-y-2">
                {selectedMentor.availableSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSlot === slot
                        ? "bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-medium">{slot}</span>
                    <input
                      type="radio"
                      name="slot"
                      value={slot}
                      checked={selectedSlot === slot}
                      onChange={() => setSelectedSlot(slot)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !bookingTopic}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Confirming..." : "Confirm 1-on-1 Booking"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Booking Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Guidance Session Confirmed!"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Your session is scheduled!</h4>
            <p className="text-xs text-slate-300 mt-1">
              Slot: <span className="text-indigo-400 font-semibold">{latestBooking?.slot}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Topic: {latestBooking?.topic}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            A calendar invite and Google Meet link have been added to your dashboard.
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
