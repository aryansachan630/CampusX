# 🎓 CampusX — Next-Gen Campus Operating System & Student Network (with AI Copilot)

CampusX is a full-stack platform combining **College Campus Life & Social Networking** with an **Academic Campus Management ERP**, supercharged by **CampusGenie AI Copilot**.

---

## 🚀 Deployment Guide (Choose Any Platform)

CampusX is architected with a **unified production mode**: the Express server automatically serves the compiled React client from `client/dist` and handles all `/api/*` and `/api/ai/*` requests. This means **you only need to deploy 1 single web service!**

---

### 🌟 Option 1: Deploy on Render.com (Recommended & Free)

Render provides free hosting for full-stack Node.js web services.

1. **Push your code to GitHub**:
   ```bash
   cd C:\Users\aryan\.gemini\antigravity\scratch\campusx
   git init
   git add .
   git commit -m "Initial commit of CampusX full stack app with AI"
   git branch -M main
   # Create a repository on github.com, then:
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and log in.
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository.
   - Set the settings:
     * **Name**: `campusx`
     * **Environment**: `Node`
     * **Build Command**: `npm run build`
     * **Start Command**: `npm start`
     * **Plan**: `Free`
   - *(Optional)* In **Environment Variables**:
     * Add `GEMINI_API_KEY` (if you want live Gemini 2.5 Flash model generation; otherwise leave blank to use the built-in CampusX AI reasoning engine).
   - Click **Create Web Service**.
   - Render will build the Vite frontend, start the Express server, and give you a live URL like `https://campusx.onrender.com`!

---

### 🚂 Option 2: Deploy on Railway.app

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. Railway automatically detects the root `Procfile` (`web: node server/index.js`) and runs `npm run build` followed by `npm start`.
5. Under **Settings** → **Networking**, click **Generate Domain** to get your public live URL.

---

### 🐳 Option 3: Deploy with Docker (AWS ECS, Google Cloud Run, DigitalOcean, VPS)

The project includes an optimized multi-stage [Dockerfile](file:///C:/Users/aryan/.gemini/antigravity/scratch/campusx/Dockerfile) and [docker-compose.yml](file:///C:/Users/aryan/.gemini/antigravity/scratch/campusx/docker-compose.yml).

1. **Build and test locally with Docker**:
   ```bash
   docker build -t campusx-app .
   docker run -p 5000:5000 campusx-app
   ```
   Open `http://localhost:5000` to view the live containerized app.

2. **Deploy to Google Cloud Run**:
   ```bash
   gcloud run deploy campusx --source . --port 5000 --allow-unauthenticated
   ```

3. **Deploy to any Linux VPS (Ubuntu/Debian)**:
   ```bash
   git clone <your-repo-url>
   cd campusx
   docker compose up -d --build
   ```

---

### ▲ Option 4: Split Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React client on Vercel and the Express API on Render:
1. **Backend on Render**:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node index.js`
   - Note down your backend URL (e.g. `https://campusx-api.onrender.com`).
2. **Frontend on Vercel**:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_API_BASE=https://campusx-api.onrender.com/api`

---

## 🛠️ Local Development & Testing

```bash
# 1. Install dependencies across root, server, and client:
npm run install:all

# 2. Start both server (port 5000) and client (port 3000) concurrently:
npm run dev

# 3. Test production build locally:
npm run build
npm start
# Visit http://localhost:5000 to see the production build running!
```

---

## 🤖 CampusGenie AI Features

* **AI Copilot Floating Assistant**: Context-aware chat with real student profile, timetable, and attendance injection.
* **Attendance Doctor**: Mathematical recovery prescription for critical subjects (e.g., Computer Networks <75%).
* **1-Click Notice Summarizer**: Condenses circulars into Core Objectives, Deadlines, and Student Action Items.
* **Hackathon Idea Generator**: Produces winning problem statements, tech stacks, and pitch outlines.
* **Senior Mentor Resume Critique**: Google XYZ formula feedback.
* **Medical Leave Email Drafter**: Professional leave requests addressed to professors.

---

## 🎭 Multi-Persona Testing

Switch roles in the top navbar:
1. **Aarav Sharma (Student)**: 3rd Year B.Tech CSE (test bunk calculator, fee payments with confetti, book 1-on-1 mentor guidance).
2. **Dr. Ramesh Gupta (Faculty/HOD)**: Mark live lecture attendance, broadcast university notices.
3. **Priya Nair (Senior Mentor)**: Google SDE intern, view peer guidance requests.
