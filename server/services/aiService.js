// aiService.js - CampusX AI Engine powered by Google Gemini with Contextual Fallback
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Executes an AI prompt using Google Gemini or the CampusX Contextual Reasoning Engine
 */
export async function generateCampusAIResponse({ prompt, context = {}, apiKey = null, task = "chat" }) {
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (effectiveApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const systemInstruction = `
You are CampusGenie, the official AI Academic Copilot & Student Mentor for "KCC Institute of Technology and Management".
You have full access to campus data, ERP records, university attendance rules, exam timetables, and career guidance.
Current Student Context:
- Student Name: ${context.studentName || "Aryan Sachan"}
- Roll Number: ${context.rollNo || "2304920100148"}
- College: KCC Institute of Technology and Management
- Branch: 3rd Year B.Tech Computer Science & Engineering (CSE)
- Current CGPA: 8.84 / 10
- Overall Attendance: 84.5% (Safe)
- Critical Attendance Alert: CSE304 Computer Networks (74.3% - below 75% cutoff threshold! Needs 2 classes to be safe).
- Upcoming Exams: Odd-Semester Theory Exams start Nov 28, 2026.
- Upcoming Hackathon: HackCampus 2026 (Nov 14-15, ₹2.5L Prize Pool).

Guidelines:
1. Be helpful, concise, academic yet friendly, encouraging, and technically sound.
2. When answering about attendance, always calculate exact numbers and safe bunk thresholds.
3. Use markdown formatting with bullet points and bold highlights for readability.
4. When writing code, provide clean, idiomatic snippets.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemInstruction}\n\nTask: ${task}\nUser Query: ${prompt}`
      });

      if (response && response.text) {
        return {
          source: "gemini-2.5-flash",
          reply: response.text
        };
      }
    } catch (err) {
      console.warn("Gemini live API call failed, switching to CampusX Contextual Engine:", err.message);
    }
  }

  // Built-in CampusX Intelligent Contextual Reasoning Engine
  return {
    source: "campusx-contextual-engine",
    reply: getContextualEngineResponse(prompt, context, task)
  };
}

/**
 * Intelligent domain-specific rule and template engine for CampusX
 */
function getContextualEngineResponse(prompt, context, task) {
  const p = prompt.toLowerCase();

  // 1. Notice Summarization Task
  if (task === "summarize_notice" || p.includes("summarize") && p.includes("notice")) {
    return `### 📋 CampusX AI Notice Summary

* **🎯 Core Announcement:** The Controller of Examinations has published the tentative schedule for the Odd-Semester End Examinations (Nov/Dec 2026).
* **📅 Critical Dates & Deadlines:**
  * **Theory Examinations Begin:** November 28, 2026 (for B.Tech Semesters 3, 5, and 7).
  * **Hall Ticket Download:** Commences on **November 18, 2026** upon 100% academic fee clearance.
* **⚡ Student Action Items:**
  1. Clear any pending fee balance (Semester 6 Examination & Lab Dues of ₹30,000) before **Nov 15** on the ERP Fee Portal.
  2. Verify that your course-wise attendance is at or above **75%** to avoid exam detainment.
  3. Report any paper overlap issues to your departmental academic coordinator by Nov 05.`;
  }

  // 2. Attendance Analysis & Recovery Plan
  if (task === "attendance_plan" || p.includes("attendance") || p.includes("bunk") || p.includes("eligib")) {
    return `### 🩺 CampusX AI Attendance Diagnosis & Recovery Plan

**Current Status Overview:**
* **Overall Attendance:** **84.5%** (Safe Zone — Minimum requirement is 75%).
* **Attended:** 165 out of 195 conducted classes.

**Subject-by-Subject Action Report:**
1. **🚨 CSE304: Computer Networks (74.3%) — CRITICAL DEFICIT!**
   * *Status:* 26 attended out of 35 classes.
   * *Prescription:* You **MUST attend the next 2 consecutive lectures** (Wednesday 10:00 AM & Thursday 10:00 AM). Attending 2 classes elevates your score to **75.68%**, escaping the detainment list.
2. **⚠️ CSE302: Operating Systems (77.5%) — BORDERLINE WARNING**
   * *Status:* 31 attended out of 40 classes.
   * *Prescription:* You can only bunk **1 class** before slipping into the red zone. Attend all classes this week to create a safety cushion.
3. **✅ CSE301 (DSA) & CSE303 (DBMS):** **90%+ (SAFE)**
   * You have a comfortable buffer of **4 safe bunks** in each of these courses for hackathons or project work.

**💡 Pro-Tip:** If you represented the college at *HackCampus 2026*, submit an OD (On-Duty) approval slip signed by HOD Dr. Ramesh Gupta within 48 hours for attendance compensation!`;
  }

  // 3. Hackathon Ideas Generator
  if (task === "hackathon_ideas" || p.includes("hackathon") || p.includes("sih") || p.includes("project idea")) {
    return `### 🚀 3 High-Impact Hackathon Project Ideas for CampusX Teams

#### 1. "AgriPulse" — Autonomous Edge-AI Crop Disease & Yield Predictor
* **Theme:** Smart Agriculture & Rural Logistics (Smart India Hackathon track).
* **Tech Stack:** React + Vite, FastAPI, PyTorch Mobile / ONNX, SQLite offline sync.
* **Why it Wins:** Most rural farms lack high-speed 5G. AgriPulse runs offline lightweight vision models directly in browser via WebAssembly to detect leaf blight and calculates micro-credit risk for farmers.

#### 2. "ZeroLag Health" — Decentralized Multi-Hospital Bed & Plasma Mesh
* **Theme:** Healthcare & Emergency Logistics.
* **Tech Stack:** Node.js, WebSockets, Redis pub/sub, Tailwind CSS, Leaflet/OpenStreetMap.
* **Key Innovation:** Real-time verifiable hospital telemetry that eliminates ambulances being turned away from emergency ICUs.

#### 3. "CampusChain" — Verifiable Peer Credential & Micro-Skill Protocol
* **Theme:** EdTech & Decentralized Identity.
* **Tech Stack:** Next.js / React, Solidity / Polygon ID, Express REST API.
* **Key Innovation:** Verified student peer reviews and hackathon badges stored as cryptographic proofs that recruiters can authenticate in 1 second.`;
  }

  // 4. Resume & Project Review
  if (task === "resume_review" || p.includes("resume") || p.includes("portfolio") || p.includes("interview")) {
    return `### 🎯 Senior Mentor AI Resume & Portfolio Feedback

**Google XYZ Formula Review:**
Your project bullets should follow: *"Accomplished [X], as measured by [Y], by doing [Z]"*.

* **❌ Before (Weak):** "Built a full stack campus portal with React and Node.js for students and teachers."
* **✅ After (FAANG-Ready):** *"Architected a high-throughput Campus ERP & Social Network in React 19 and Express, optimizing response latencies by 35% through in-memory indexing, supporting real-time attendance analytics and 1-click UPI fee settlements."*

**3 Critical Portfolio Must-Haves:**
1. **Include Live Deployments & Test Accounts:** Recruiters spend 45 seconds per resume. Provide 1-click test credentials (e.g. Student vs Faculty persona).
2. **Highlight Edge Cases:** Mention offline fallback, optimistic UI updates, or sticky header responsive tables.
3. **System Architecture Diagram:** Add a clean Mermaid or PNG diagram in your GitHub README!`;
  }

  // 5. Formal Leave / Email Drafter
  if (task === "draft_email" || p.includes("email") || p.includes("leave") || p.includes("letter") || p.includes("permission")) {
    return `### ✉️ Formal Academic Leave Application Draft

**Subject:** Request for Medical Leave Approval & Attendance Regularization — Aarav Sharma (Roll: 22CSE042)

**Respected Dr. Ramesh Gupta,**
Head of the Department, Computer Science & Engineering,
CampusX Institute of Technology.

Dear Sir,

I am writing to formally request leave of absence from **October 28, 2026 to October 29, 2026** on account of acute viral fever. During this period, I was unable to attend the lectures for CSE304 (Computer Networks) and CSE302 (Operating Systems).

I have consulted our campus medical center physician, and my medical fitness certificate and prescription are attached herewith for your verification.

I have proactively reviewed the lecture notes and practical lab assignments from my peers to ensure no academic lag. I kindly request your authorization to grant leave and regularize my attendance records as per university medical guidelines.

Thank you very much for your kind understanding and support.

Yours sincerely,  
**Aryan Sachan**  
B.Tech CSE (3rd Year, Section A)  
Roll No: **2304920100148**  
KCC Institute of Technology and Management  
Contact: +91 98765 43210`;
  }

  // 6. CGPA & Academic Goals
  if (p.includes("cgpa") || p.includes("gpa") || p.includes("sgpa") || p.includes("grades")) {
    return `### 🎓 CampusX AI Academic Performance & Target Planner

**Current Standing:**
* **Completed Credits:** 118 Credits (Semesters 1 to 5).
* **Current Cumulative GPA:** **8.84 / 10.0** (Top 5% of CSE batch).
* **Current Semester 6 Projected SGPA:** **8.92** (Outstanding in DSA and DBMS practicals).

**Strategy to Hit 9.0+ Cumulative Graduation Honors:**
* To achieve an overall **9.00 CGPA** across the full 166-credit B.Tech degree:
  * You need an average SGPA of **9.38** across your remaining 48 credits (Semesters 7 & 8).
  * *Tip:* Choose elective courses with strong project weightages (e.g., Cloud Computing CSE309 and Advanced AI CSE305) where continuous internal evaluations award high practical marks!`;
  }

  // 7. General Academic / Coding Doubts
  if (p.includes("dijkstra") || p.includes("algorithm") || p.includes("dsa") || p.includes("code")) {
    return `### 💡 Dijkstra's Shortest Path Algorithm (O((V + E) log V))

Dijkstra finds the shortest path from a single source vertex to all other vertices in a weighted graph with **non-negative edge weights** using a min-heap (Priority Queue).

\`\`\`javascript
// Dijkstra Implementation in JavaScript / Node.js
function dijkstra(graph, source, numVertices) {
  const distances = Array(numVertices).fill(Infinity);
  distances[source] = 0;

  // Min-Priority Queue tracking [distance, vertex]
  const pq = [[0, source]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]); // pop minimum
    const [currentDist, u] = pq.shift();

    if (currentDist > distances[u]) continue;

    for (const neighbor of graph[u] || []) {
      const { node: v, weight } = neighbor;
      if (distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
        pq.push([distances[v], v]);
      }
    }
  }

  return distances;
}
\`\`\`

**Key Complexity Analysis:**
* **Time Complexity:** $O((V + E) \\log V)$ when using a binary heap.
* **Space Complexity:** $O(V)$ for distance arrays and priority queue.
* *Note:* For graphs with negative edge weights, use the **Bellman-Ford Algorithm** ($O(V \\cdot E)$).`;
  }

  // Default Fallback
  return `### 🎓 CampusGenie AI Assistant

Hello **${context.studentName || "Aarav"}**! I am your AI Academic Copilot at CampusX.

Here is what I can assist you with right now:
* 🩺 **Attendance Doctor:** Say *"Analyze my attendance"* to calculate safe bunks and recovery targets.
* 📋 **Notice Summarizer:** Ask *"Summarize the latest exam circular"*.
* 🚀 **Hackathon Ideation:** Ask *"Give me 3 winning AI project ideas for HackCampus 2026"*.
* ✉️ **Formal Drafts:** Ask *"Write a leave request email to Prof. Ramesh Gupta"*.
* 🎯 **CGPA Goal Planner:** Ask *"How do I raise my CGPA to 9.0?"*.
* 💡 **Coding & Algorithms:** Ask any concept in DSA, Operating Systems, DBMS, or Networks!`;
}
