// db.js - Persistent Multi-User Database Manager for CampusX
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { initialData } from "./campusData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "store.json");
const JWT_SECRET = process.env.JWT_SECRET || "campusx-super-secret-jwt-key-2026";

// In-Memory cache
let database = null;

// Initialize or load database from disk
export function initDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      database = JSON.parse(content);
      console.log(`💾 Loaded persistent database from: ${DB_FILE}`);
    } else {
      console.log(`🌱 Initializing new persistent database with seed data...`);
      database = JSON.parse(JSON.stringify(initialData));
      
      // Seed default passwords for existing personas (default: 'password123')
      const defaultHash = hashPassword("password123");
      database.personas.forEach(p => {
        p.passwordHash = defaultHash;
        p.bio = p.bio || "Student at KCC Institute of Technology and Management passionate about technology & problem solving.";
        p.skills = p.skills || ["C++", "DSA", "Web Development", "Python"];
        p.github = p.github || "https://github.com/aryansachan630";
        p.linkedin = p.linkedin || "https://linkedin.com/in/aryan-sachan";
      });

      // Save to disk
      saveDb();
    }
  } catch (err) {
    console.error("Failed to load store.json, falling back to initial data:", err);
    database = JSON.parse(JSON.stringify(initialData));
  }
  return database;
}

export function getDb() {
  if (!database) {
    initDb();
  }
  return database;
}

export function saveDb() {
  try {
    if (!database) return;
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to store.json:", err);
  }
}

// ----------------------------------------------------
// AUTH & PASSWORD HELPERS
// ----------------------------------------------------
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  // Fallback for simple demo passwords
  if (!storedHash.includes(":")) {
    return password === storedHash || password === "password123";
  }
  const [salt, key] = storedHash.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return key === testHash;
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
      rollNo: user.rollNo,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ----------------------------------------------------
// USER CRUD OPERATIONS
// ----------------------------------------------------
export function findUserByEmailOrRoll(query) {
  const db = getDb();
  const q = (query || "").trim().toLowerCase();
  return db.personas.find(p =>
    (p.email && p.email.toLowerCase() === q) ||
    (p.rollNo && p.rollNo.toLowerCase() === q) ||
    (p.name && p.name.toLowerCase() === q)
  );
}

export function findUserById(id) {
  const db = getDb();
  return db.personas.find(p => p.id === id);
}

export function createUser({ name, email, password, rollNo, department, semester, role }) {
  const db = getDb();
  const existing = findUserByEmailOrRoll(email) || findUserByEmailOrRoll(rollNo);
  if (existing) {
    throw new Error("A student or user with this email or roll number already exists!");
  }

  const userId = `user-${Date.now()}`;
  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    rollNo: rollNo || `2304920100${Math.floor(100 + Math.random() * 899)}`,
    role: role || "student",
    title: `B.Tech ${department || "Computer Science & Engineering"} (${semester || "6th Semester"})`,
    department: department || "Computer Science & Engineering",
    semester: semester || "6th Semester",
    section: "Section A",
    collegeName: "KCC Institute of Technology and Management",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5,6366f1,3b82f6`,
    cgpa: 8.50,
    attendancePercentage: 85.0,
    pendingFees: 30000,
    bio: "Passionate engineering student at KCC Institute of Technology and Management.",
    skills: ["Programming", "DSA", "Web Tech"],
    github: "",
    linkedin: "",
    createdAt: new Date().toISOString()
  };

  db.personas.push(newUser);
  saveDb();
  return newUser;
}

export function updateUser(id, updates) {
  const db = getDb();
  const user = db.personas.find(p => p.id === id);
  if (!user) throw new Error("User not found");

  const allowedFields = ["name", "avatar", "bio", "skills", "github", "linkedin", "department", "semester", "section"];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  saveDb();
  return user;
}

export function resetDatabase() {
  database = JSON.parse(JSON.stringify(initialData));
  saveDb();
  return database;
}
