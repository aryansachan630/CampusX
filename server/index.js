// index.js - CampusX Express REST API Server with Persistent Database & Real Auth
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  initDb,
  getDb,
  saveDb,
  createUser,
  updateUser,
  findUserByEmailOrRoll,
  findUserById,
  verifyPassword,
  generateToken,
  verifyToken,
  resetDatabase
} from "./data/db.js";
import { generateCampusAIResponse } from "./services/aiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize persistent database
initDb();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please log in to continue" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
  req.user = decoded;
  next();
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "CampusX API",
    time: new Date().toISOString(),
    version: "2.0.0",
    aiEnabled: true,
    storage: "persistent-store.json"
  });
});

// ----------------------------------------------------
// 1. AUTHENTICATION & MULTI-USER SYSTEM
// ----------------------------------------------------
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, rollNo, department, semester, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const newUser = createUser({
      name,
      email,
      password,
      rollNo,
      department,
      semester,
      role: role || "student"
    });

    const token = generateToken(newUser);
    const { passwordHash, ...userClean } = newUser;

    res.status(201).json({
      message: "Registration successful! Welcome to CampusX.",
      token,
      user: userClean
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { emailOrRollNo, password } = req.body;
    if (!emailOrRollNo || !password) {
      return res.status(400).json({ error: "Email/Roll Number and password are required" });
    }

    const user = findUserByEmailOrRoll(emailOrRollNo);
    if (!user) {
      return res.status(404).json({ error: "No account found with this email or roll number" });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const token = generateToken(user);
    const { passwordHash, ...userClean } = user;

    res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: userClean
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...userClean } = user;
  res.json(userClean);
});

app.put("/api/auth/profile", authenticateToken, (req, res) => {
  try {
    const updated = updateUser(req.user.id, req.body);
    const { passwordHash, ...userClean } = updated;
    res.json({
      message: "Profile updated successfully!",
      user: userClean
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Personas list (for rapid persona switching)
app.get("/api/personas", (req, res) => {
  const db = getDb();
  const cleanList = db.personas.map(({ passwordHash, ...p }) => p);
  res.json(cleanList);
});

app.get("/api/personas/:id", (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "Persona not found" });
  const { passwordHash, ...userClean } = user;
  res.json(userClean);
});

// ----------------------------------------------------
// 2. CAMPUS COMMUNITY & BUZZ
// ----------------------------------------------------
app.get("/api/community/posts", (req, res) => {
  const db = getDb();
  const { tag, search } = req.query;
  let posts = [...db.communityPosts];

  if (tag && tag !== "All") {
    posts = posts.filter(p => p.tag.toLowerCase() === tag.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q)
    );
  }

  res.json(posts);
});

app.post("/api/community/posts", (req, res) => {
  const db = getDb();
  const { authorId, title, content, tag, pollQuestion, pollOptions } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const author = findUserById(authorId) || db.personas[0];

  const newPost = {
    id: `post-${Date.now()}`,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role === "student" ? "CSE Student" : author.role === "faculty" ? "Faculty CSE" : "Senior Mentor",
    authorAvatar: author.avatar,
    title,
    content,
    tag: tag || "Campus Life",
    timestamp: "Just now",
    likesCount: 0,
    likedBy: [],
    comments: []
  };

  if (pollQuestion && Array.isArray(pollOptions) && pollOptions.length > 0) {
    newPost.poll = {
      question: pollQuestion,
      options: pollOptions.map((opt, idx) => ({
        id: `opt-${idx + 1}`,
        text: opt,
        votes: 0
      })),
      userVoted: null
    };
  }

  db.communityPosts.unshift(newPost);
  saveDb();
  res.status(201).json(newPost);
});

app.post("/api/community/posts/:id/like", (req, res) => {
  const db = getDb();
  const { userId } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const currentUserId = userId || "student-1";
  const likedIndex = post.likedBy.indexOf(currentUserId);
  if (likedIndex > -1) {
    post.likedBy.splice(likedIndex, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(currentUserId);
    post.likesCount += 1;
  }

  saveDb();
  res.json({
    likesCount: post.likesCount,
    isLiked: post.likedBy.includes(currentUserId)
  });
});

app.post("/api/community/posts/:id/comments", (req, res) => {
  const db = getDb();
  const { authorName, authorRole, text } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!text) return res.status(400).json({ error: "Comment text is required" });

  const newComment = {
    id: `c-${Date.now()}`,
    authorName: authorName || "Aryan Sachan",
    authorRole: authorRole || "Student",
    text,
    time: "Just now"
  };

  post.comments.push(newComment);
  saveDb();
  res.status(201).json(newComment);
});

app.post("/api/community/posts/:id/poll-vote", (req, res) => {
  const db = getDb();
  const { optionId } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post || !post.poll) return res.status(404).json({ error: "Poll not found" });

  const option = post.poll.options.find(o => o.id === optionId);
  if (!option) return res.status(404).json({ error: "Option not found" });

  option.votes += 1;
  post.poll.userVoted = optionId;
  saveDb();

  res.json(post.poll);
});

// ----------------------------------------------------
// 3. CLUBS & CAMPUS EVENTS
// ----------------------------------------------------
app.get("/api/clubs", (req, res) => {
  const db = getDb();
  res.json(db.clubs);
});

app.get("/api/events", (req, res) => {
  const db = getDb();
  res.json(db.events);
});

app.post("/api/events/:id/rsvp", (req, res) => {
  const db = getDb();
  const evt = db.events.find(e => e.id === req.params.id);
  if (!evt) return res.status(404).json({ error: "Event not found" });

  evt.isUserRsvpd = !evt.isUserRsvpd;
  evt.rsvpsCount += evt.isUserRsvpd ? 1 : -1;
  saveDb();

  res.json({
    id: evt.id,
    isUserRsvpd: evt.isUserRsvpd,
    rsvpsCount: evt.rsvpsCount
  });
});

app.post("/api/events", (req, res) => {
  const db = getDb();
  const { title, clubName, date, time, venue, category, prizePool, capacity, description, image } = req.body;
  if (!title || !venue) {
    return res.status(400).json({ error: "Title and venue are required" });
  }

  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    clubId: "club-custom",
    clubName: clubName || "Campus Activity Cell",
    date: date || "Upcoming",
    time: time || "10:00 AM",
    venue,
    category: category || "General",
    prizePool: prizePool || "N/A",
    capacity: Number(capacity) || 100,
    rsvpsCount: 1,
    isUserRsvpd: true,
    image: image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
    description: description || "Join us for an exciting campus experience."
  };

  db.events.unshift(newEvent);
  saveDb();
  res.status(201).json(newEvent);
});

// ----------------------------------------------------
// 4. SENIOR-JUNIOR MENTORSHIP
// ----------------------------------------------------
app.get("/api/mentors", (req, res) => {
  const db = getDb();
  res.json(db.mentors);
});

app.get("/api/mentorship/bookings", (req, res) => {
  const db = getDb();
  res.json(db.mentorBookings);
});

app.post("/api/mentorship/book", (req, res) => {
  const db = getDb();
  const { mentorId, studentId, topic, slot } = req.body;
  const mentor = db.mentors.find(m => m.id === mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });

  const student = findUserById(studentId) || db.personas[0];

  const newBooking = {
    id: `mb-${Date.now()}`,
    mentorId: mentor.id,
    mentorName: mentor.name,
    studentId: student.id,
    studentName: student.name,
    topic: topic || "Career and Code Guidance",
    slot: slot || mentor.availableSlots[0],
    status: "Confirmed",
    meetLink: `https://meet.google.com/cpx-${Math.random().toString(36).substring(2, 7)}`
  };

  db.mentorBookings.unshift(newBooking);
  mentor.reviewsCount += 1;
  saveDb();

  res.status(201).json(newBooking);
});

// ----------------------------------------------------
// 5. ACADEMIC ERP - ATTENDANCE
// ----------------------------------------------------
app.get("/api/academic/attendance", (req, res) => {
  const db = getDb();
  res.json(db.attendance);
});

app.post("/api/academic/attendance/mark", (req, res) => {
  const db = getDb();
  const { code, attended } = req.body;
  const subject = db.attendance.subjects.find(s => s.code === code);
  if (!subject) return res.status(404).json({ error: "Subject not found" });

  subject.total += 1;
  if (attended) {
    subject.attended += 1;
  }
  subject.percentage = Number(((subject.attended / subject.total) * 100).toFixed(1));
  subject.status = subject.percentage >= 80 ? "Safe" : subject.percentage >= 75 ? "Warning" : "Critical";

  let totalAtt = 0;
  let totalCond = 0;
  db.attendance.subjects.forEach(s => {
    totalAtt += s.attended;
    totalCond += s.total;
  });
  db.attendance.totalClassesAttended = totalAtt;
  db.attendance.totalClassesConducted = totalCond;
  db.attendance.overallPercentage = Number(((totalAtt / totalCond) * 100).toFixed(1));

  db.attendance.recentLogs.unshift({
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    subject: `${subject.code} - ${subject.name.substring(0, 15)}...`,
    status: attended ? "Present" : "Absent",
    slot: "Live Updated"
  });

  saveDb();
  res.json(db.attendance);
});

// ----------------------------------------------------
// 6. ACADEMIC ERP - TIMETABLE
// ----------------------------------------------------
app.get("/api/academic/timetable", (req, res) => {
  const db = getDb();
  res.json(db.timetable);
});

// Update an existing timetable slot
app.put("/api/academic/timetable/slot", (req, res) => {
  try {
    const { day, slotIndex, time, subject, code, room, faculty, type } = req.body;
    const db = getDb();
    const dayObj = db.timetable.find((d) => d.day.toLowerCase() === (day || "").toLowerCase());

    if (!dayObj) {
      return res.status(404).json({ error: `Day '${day}' not found in timetable` });
    }

    if (slotIndex === undefined || slotIndex < 0 || slotIndex >= dayObj.slots.length) {
      return res.status(400).json({ error: "Invalid slotIndex" });
    }

    dayObj.slots[slotIndex] = {
      ...dayObj.slots[slotIndex],
      ...(time ? { time } : {}),
      ...(subject ? { subject } : {}),
      ...(code ? { code } : {}),
      ...(room ? { room } : {}),
      ...(faculty ? { faculty } : {}),
      ...(type ? { type } : {})
    };

    saveDb();
    res.json({
      message: `Timetable slot for ${day} updated successfully!`,
      timetable: db.timetable,
      updatedSlot: dayObj.slots[slotIndex]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update timetable slot" });
  }
});

// Add a new slot to a day's schedule
app.post("/api/academic/timetable/slot", (req, res) => {
  try {
    const { day, time, subject, code, room, faculty, type } = req.body;
    if (!day || !subject || !time) {
      return res.status(400).json({ error: "Day, subject, and time are required" });
    }

    const db = getDb();
    let dayObj = db.timetable.find((d) => d.day.toLowerCase() === day.toLowerCase());

    if (!dayObj) {
      dayObj = { day, slots: [] };
      db.timetable.push(dayObj);
    }

    const newSlot = {
      time,
      subject,
      code: code || "CSE300",
      room: room || "LT-102",
      faculty: faculty || "Faculty Member",
      type: type || "Lecture"
    };

    dayObj.slots.push(newSlot);
    saveDb();

    res.status(201).json({
      message: `New class '${subject}' added to ${day}'s timetable!`,
      timetable: db.timetable,
      newSlot
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add timetable slot" });
  }
});

// Delete a slot from a day's schedule
app.delete("/api/academic/timetable/slot", (req, res) => {
  try {
    const { day, slotIndex } = req.body;
    const db = getDb();
    const dayObj = db.timetable.find((d) => d.day.toLowerCase() === (day || "").toLowerCase());

    if (!dayObj) {
      return res.status(404).json({ error: `Day '${day}' not found in timetable` });
    }

    if (slotIndex === undefined || slotIndex < 0 || slotIndex >= dayObj.slots.length) {
      return res.status(400).json({ error: "Invalid slotIndex" });
    }

    const removed = dayObj.slots.splice(slotIndex, 1);
    saveDb();

    res.json({
      message: `Slot removed from ${day}`,
      timetable: db.timetable,
      removedSlot: removed[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete timetable slot" });
  }
});

// ----------------------------------------------------
// 7. ACADEMIC ERP - GRADES & TRANSCRIPT
// ----------------------------------------------------
app.get("/api/academic/grades", (req, res) => {
  const db = getDb();
  res.json(db.grades);
});

// ----------------------------------------------------
// 8. ACADEMIC ERP - FEES & PAYMENT SIMULATION
// ----------------------------------------------------
app.get("/api/academic/fees", (req, res) => {
  const db = getDb();
  res.json(db.fees);
});

app.post("/api/academic/fees/pay", (req, res) => {
  const db = getDb();
  const { receiptNo, paymentMethod } = req.body;
  const transaction = db.fees.transactions.find(t => t.receiptNo === receiptNo);
  if (!transaction) return res.status(404).json({ error: "Transaction invoice not found" });

  if (transaction.status === "Paid") {
    return res.status(400).json({ error: "Fee already paid for this transaction" });
  }

  transaction.status = "Paid";
  transaction.paidDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  transaction.mode = `${paymentMethod || "UPI Instant"} (Ref: TXN${Math.floor(10000000 + Math.random() * 90000000)})`;

  db.fees.totalPaid += transaction.amount;
  db.fees.pendingBalance = Math.max(0, db.fees.pendingBalance - transaction.amount);

  const student = db.personas.find(p => p.id === "student-1");
  if (student) {
    student.pendingFees = db.fees.pendingBalance;
  }

  saveDb();
  res.json({
    message: "Fee payment successful!",
    receipt: transaction,
    updatedFees: db.fees
  });
});

// ----------------------------------------------------
// 9. CAMPUS NOTICES & CIRCULARS
// ----------------------------------------------------
app.get("/api/notices", (req, res) => {
  const db = getDb();
  res.json(db.notices);
});

app.post("/api/notices", (req, res) => {
  const db = getDb();
  const { title, department, urgency, category, summary } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ error: "Title and summary are required" });
  }

  const newNotice = {
    id: `notif-${Date.now()}`,
    title,
    department: department || "Dean Academic Affairs",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    urgency: urgency || "Medium",
    category: category || "Academic",
    summary,
    pdfUrl: "#mock-download"
  };

  db.notices.unshift(newNotice);
  saveDb();
  res.status(201).json(newNotice);
});

// ----------------------------------------------------
// 10. CAMPUSGENIE AI ENDPOINTS
// ----------------------------------------------------
app.post("/api/ai/chat", async (req, res) => {
  const db = getDb();
  try {
    const { message, context, apiKey, task } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const aiResult = await generateCampusAIResponse({
      prompt: message,
      context: context || {
        studentName: "Aryan Sachan",
        rollNo: "2304920100148",
        collegeName: "KCC Institute of Technology and Management",
        department: "Computer Science & Engineering",
        attendance: db.attendance,
        grades: db.grades
      },
      apiKey: apiKey || req.headers["x-gemini-api-key"],
      task: task || "chat"
    });

    res.json(aiResult);
  } catch (err) {
    console.error("AI endpoint error:", err);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

app.post("/api/ai/summarize-notice", async (req, res) => {
  try {
    const { noticeTitle, noticeSummary, apiKey } = req.body;
    const prompt = `Summarize this official circular: "${noticeTitle}". Content: "${noticeSummary}"`;
    const aiResult = await generateCampusAIResponse({
      prompt,
      apiKey: apiKey || req.headers["x-gemini-api-key"],
      task: "summarize_notice"
    });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: "Failed to summarize notice" });
  }
});

app.post("/api/ai/attendance-plan", async (req, res) => {
  const db = getDb();
  try {
    const { apiKey } = req.body;
    const aiResult = await generateCampusAIResponse({
      prompt: "Analyze my course-wise attendance and generate a safe recovery plan.",
      context: { attendance: db.attendance },
      apiKey: apiKey || req.headers["x-gemini-api-key"],
      task: "attendance_plan"
    });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: "Failed to create attendance plan" });
  }
});

app.post("/api/ai/hackathon-ideas", async (req, res) => {
  try {
    const { track, apiKey } = req.body;
    const prompt = `Generate 3 innovative hackathon project ideas for track: ${track || "Smart Cities & AI"}`;
    const aiResult = await generateCampusAIResponse({
      prompt,
      apiKey: apiKey || req.headers["x-gemini-api-key"],
      task: "hackathon_ideas"
    });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate hackathon ideas" });
  }
});

app.post("/api/ai/polish-post", async (req, res) => {
  try {
    const { text, tag } = req.body;
    const prompt = `Rewrite and polish this student campus post for category #${tag || "Campus Life"}. Make it clear, engaging, and professional without changing the meaning:\n"${text}"`;
    const aiResult = await generateCampusAIResponse({
      prompt,
      apiKey: req.headers["x-gemini-api-key"],
      task: "polish_post"
    });
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: "Failed to polish post" });
  }
});

// ----------------------------------------------------
// RESET STATE HELPER
// ----------------------------------------------------
app.post("/api/reset", (req, res) => {
  resetDatabase();
  res.json({ message: "CampusX database restored to initial state." });
});

// ----------------------------------------------------
// PRODUCTION STATIC SERVING
// ----------------------------------------------------
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  console.log(`📦 Serving static client build from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎓 CampusX Server running on: http://localhost:${PORT}`);
  console.log(`✨ CampusGenie AI Copilot enabled & ready!`);
  console.log(`💾 Multi-User Database: server/data/store.json`);
  console.log(`======================================================\n`);
});
