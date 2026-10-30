import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initialData } from "./data/campusData.js";
import { generateCampusAIResponse } from "./services/aiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// In-Memory state clone
let db = JSON.parse(JSON.stringify(initialData));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "CampusX API",
    time: new Date().toISOString(),
    version: "1.0.0",
    aiEnabled: true
  });
});

// ----------------------------------------------------
// 1. AUTH & PERSONAS
// ----------------------------------------------------
app.get("/api/personas", (req, res) => {
  res.json(db.personas);
});

app.get("/api/personas/:id", (req, res) => {
  const persona = db.personas.find(p => p.id === req.params.id);
  if (!persona) return res.status(404).json({ error: "Persona not found" });
  res.json(persona);
});

// ----------------------------------------------------
// 2. CAMPUS COMMUNITY & BUZZ
// ----------------------------------------------------
app.get("/api/community/posts", (req, res) => {
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
  const { authorId, title, content, tag, pollQuestion, pollOptions } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const author = db.personas.find(p => p.id === authorId) || db.personas[0];

  const newPost = {
    id: `post-${Date.now()}`,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role === "student" ? "3rd Year CSE" : author.role === "faculty" ? "Faculty CSE" : "Senior Mentor",
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
  res.status(201).json(newPost);
});

app.post("/api/community/posts/:id/like", (req, res) => {
  const { userId } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const likedIndex = post.likedBy.indexOf(userId || "student-1");
  if (likedIndex > -1) {
    post.likedBy.splice(likedIndex, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(userId || "student-1");
    post.likesCount += 1;
  }

  res.json({
    likesCount: post.likesCount,
    isLiked: post.likedBy.includes(userId || "student-1")
  });
});

app.post("/api/community/posts/:id/comments", (req, res) => {
  const { authorName, authorRole, text } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!text) return res.status(400).json({ error: "Comment text is required" });

  const newComment = {
    id: `c-${Date.now()}`,
    authorName: authorName || "Aarav Sharma",
    authorRole: authorRole || "Student",
    text,
    time: "Just now"
  };

  post.comments.push(newComment);
  res.status(201).json(newComment);
});

app.post("/api/community/posts/:id/poll-vote", (req, res) => {
  const { optionId } = req.body;
  const post = db.communityPosts.find(p => p.id === req.params.id);
  if (!post || !post.poll) return res.status(404).json({ error: "Poll not found" });

  const option = post.poll.options.find(o => o.id === optionId);
  if (!option) return res.status(404).json({ error: "Option not found" });

  option.votes += 1;
  post.poll.userVoted = optionId;

  res.json(post.poll);
});

// ----------------------------------------------------
// 3. CLUBS & CAMPUS EVENTS
// ----------------------------------------------------
app.get("/api/clubs", (req, res) => {
  res.json(db.clubs);
});

app.get("/api/events", (req, res) => {
  res.json(db.events);
});

app.post("/api/events/:id/rsvp", (req, res) => {
  const evt = db.events.find(e => e.id === req.params.id);
  if (!evt) return res.status(404).json({ error: "Event not found" });

  evt.isUserRsvpd = !evt.isUserRsvpd;
  evt.rsvpsCount += evt.isUserRsvpd ? 1 : -1;

  res.json({
    id: evt.id,
    isUserRsvpd: evt.isUserRsvpd,
    rsvpsCount: evt.rsvpsCount
  });
});

app.post("/api/events", (req, res) => {
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
  res.status(201).json(newEvent);
});

// ----------------------------------------------------
// 4. SENIOR-JUNIOR MENTORSHIP
// ----------------------------------------------------
app.get("/api/mentors", (req, res) => {
  res.json(db.mentors);
});

app.get("/api/mentorship/bookings", (req, res) => {
  res.json(db.mentorBookings);
});

app.post("/api/mentorship/book", (req, res) => {
  const { mentorId, studentId, topic, slot } = req.body;
  const mentor = db.mentors.find(m => m.id === mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });

  const newBooking = {
    id: `mb-${Date.now()}`,
    mentorId: mentor.id,
    mentorName: mentor.name,
    studentId: studentId || "student-1",
    studentName: "Aryan Sachan",
    topic: topic || "Career and Code Guidance",
    slot: slot || mentor.availableSlots[0],
    status: "Confirmed",
    meetLink: `https://meet.google.com/cpx-${Math.random().toString(36).substring(2, 7)}`
  };

  db.mentorBookings.unshift(newBooking);
  mentor.reviewsCount += 1;

  res.status(201).json(newBooking);
});

// ----------------------------------------------------
// 5. ACADEMIC ERP - ATTENDANCE
// ----------------------------------------------------
app.get("/api/academic/attendance", (req, res) => {
  res.json(db.attendance);
});

app.post("/api/academic/attendance/mark", (req, res) => {
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

  res.json(db.attendance);
});

// ----------------------------------------------------
// 6. ACADEMIC ERP - TIMETABLE
// ----------------------------------------------------
app.get("/api/academic/timetable", (req, res) => {
  res.json(db.timetable);
});

// ----------------------------------------------------
// 7. ACADEMIC ERP - GRADES & TRANSCRIPT
// ----------------------------------------------------
app.get("/api/academic/grades", (req, res) => {
  res.json(db.grades);
});

// ----------------------------------------------------
// 8. ACADEMIC ERP - FEES & PAYMENT SIMULATION
// ----------------------------------------------------
app.get("/api/academic/fees", (req, res) => {
  res.json(db.fees);
});

app.post("/api/academic/fees/pay", (req, res) => {
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
  res.json(db.notices);
});

app.post("/api/notices", (req, res) => {
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
  res.status(201).json(newNotice);
});

// ----------------------------------------------------
// 10. CAMPUSGENIE AI ENDPOINTS
// ----------------------------------------------------
app.post("/api/ai/chat", async (req, res) => {
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
// RESET STATE HELPER (Useful for testing & demo)
// ----------------------------------------------------
app.post("/api/reset", (req, res) => {
  db = JSON.parse(JSON.stringify(initialData));
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
  console.log(`======================================================\n`);
});
