// api.js - Centralized API Service for CampusX Frontend with Auth & AI Service

const API_BASE = import.meta.env.VITE_API_URL || "/api";

let authToken = typeof window !== "undefined" ? localStorage.getItem("campusx_token") : null;

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("campusx_token", token);
    } else {
      localStorage.removeItem("campusx_token");
    }
  }
};

export const getAuthToken = () => authToken;

async function request(endpoint, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API request error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication & Multi-User Profile
  register: (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  getMe: () => request("/auth/me"),
  updateProfile: (profileData) => request("/auth/profile", { method: "PUT", body: JSON.stringify(profileData) }),

  // Personas
  getPersonas: () => request("/personas"),
  getPersona: (id) => request(`/personas/${id}`),

  // Community
  getPosts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.tag) query.append("tag", params.tag);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/community/posts${qs ? `?${qs}` : ""}`);
  },
  createPost: (postData) => request("/community/posts", { method: "POST", body: JSON.stringify(postData) }),
  likePost: (postId, userId) => request(`/community/posts/${postId}/like`, { method: "POST", body: JSON.stringify({ userId }) }),
  addComment: (postId, commentData) => request(`/community/posts/${postId}/comments`, { method: "POST", body: JSON.stringify(commentData) }),
  votePoll: (postId, optionId) => request(`/community/posts/${postId}/poll-vote`, { method: "POST", body: JSON.stringify({ optionId }) }),

  // Clubs & Events
  getClubs: () => request("/clubs"),
  getEvents: () => request("/events"),
  toggleRsvp: (eventId) => request(`/events/${eventId}/rsvp`, { method: "POST" }),
  createEvent: (eventData) => request("/events", { method: "POST", body: JSON.stringify(eventData) }),

  // Mentorship
  getMentors: () => request("/mentors"),
  getBookings: () => request("/mentorship/bookings"),
  bookMentor: (bookingData) => request("/mentorship/book", { method: "POST", body: JSON.stringify(bookingData) }),

  // Academic ERP
  getAttendance: () => request("/academic/attendance"),
  markAttendance: (attendanceData) => request("/academic/attendance/mark", { method: "POST", body: JSON.stringify(attendanceData) }),
  getTimetable: () => request("/academic/timetable"),
  updateTimetableSlot: (slotData) => request("/academic/timetable/slot", { method: "PUT", body: JSON.stringify(slotData) }),
  addTimetableSlot: (slotData) => request("/academic/timetable/slot", { method: "POST", body: JSON.stringify(slotData) }),
  deleteTimetableSlot: (day, slotIndex) => request("/academic/timetable/slot", { method: "DELETE", body: JSON.stringify({ day, slotIndex }) }),
  getGrades: () => request("/academic/grades"),
  getFees: () => request("/academic/fees"),
  payFee: (paymentData) => request("/academic/fees/pay", { method: "POST", body: JSON.stringify(paymentData) }),

  // Notices
  getNotices: () => request("/notices"),
  createNotice: (noticeData) => request("/notices", { method: "POST", body: JSON.stringify(noticeData) }),

  // CampusGenie AI Copilot Endpoints
  askAI: (message, context = {}, apiKey = null, task = "chat") =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, context, apiKey, task })
    }),

  summarizeNotice: (noticeTitle, noticeSummary, apiKey = null) =>
    request("/ai/summarize-notice", {
      method: "POST",
      body: JSON.stringify({ noticeTitle, noticeSummary, apiKey })
    }),

  getAttendancePlan: (apiKey = null) =>
    request("/ai/attendance-plan", {
      method: "POST",
      body: JSON.stringify({ apiKey })
    }),

  getHackathonIdeas: (track = "AI & Smart Cities", apiKey = null) =>
    request("/ai/hackathon-ideas", {
      method: "POST",
      body: JSON.stringify({ track, apiKey })
    }),

  polishPost: (text, tag = "Campus Life") =>
    request("/ai/polish-post", {
      method: "POST",
      body: JSON.stringify({ text, tag })
    }),

  // Reset
  resetDb: () => request("/reset", { method: "POST" })
};
