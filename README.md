# LearnLens 🎓🔍
> **Smart, Inclusive, Personalized Education for Large Classrooms**  
> *Built for a 24-Hour Hackathon • Clean Pure-JS Architecture • Unified Single-Server Mode*

---

## 🏆 Executive Summary & Pitch

In modern high-enrollment classrooms (40–60+ students per teacher), exams report **what** a student scored (e.g. *50% on Quadratic Equations*), but fail to answer:
1. **Why** did they struggle? (Is it truly quadratic equations, or an unresolved 8th-grade prerequisite like factoring?)
2. **How** should they study? (Students don't have endless hours; generic advice like "study more" causes burnout.)
3. **Who** is keeping track? (Teachers lack class-wide prerequisite bottleneck heatmaps; parents receive impenetrable technical marks cards.)

**LearnLens solves all three with five core pillars:**
- 🔍 **Root-Cause Prerequisite Gap Finder**: Traverses the curriculum Directed Acyclic Graph (DAG) to find the foundational ancestor concept holding the student back.
- 🎯 **Confidence-Weighted Diagnostics**: Students tag every answer as *Sure*, *Not Sure*, or *Guessing*. Correct guesses are down-weighted ($0.5\times$) because guessing isn't genuine mastery.
- ⏱️ **Adaptive Free-Hour Study Planner**: Dynamically converts available study hours and target exam dates into strict, science-backed **25–30 minute focused sessions**, scheduling root prerequisites chronologically first.
- 🤖 **Responsible Gemini AI Tutor**: Provides step-by-step misconception coaching with server-side caching, strict offline curriculum fallbacks, bad-question reporting, and mandatory AI-verification tags.
- 🌐 **Four Unified Dashboards with Tri-Lingual Support**: One unified PostgreSQL (Supabase) schema serves **Students, Teachers, Parents, and Administrators** in **English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ)** with zero hardcoded UI strings.

---

## 🚀 How to Run (Single Unified Server)

LearnLens runs on **one single server** serving both the API routes (`/api/*`) and the compiled React production frontend from **`http://localhost:5000`**.

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Quick Setup & Build
From the project root directory:
```bash
# 1. Build the frontend (installs frontend packages and compiles to frontend/dist)
npm run build
```

### 3. Start the Single Server
```bash
# Starts the unified server serving both the REST API and the React frontend
npm start
```

### 4. Open the App in Your Browser
Visit: **[http://localhost:5000](http://localhost:5000)**

### 5. Health & Database Verification Endpoints
- **API Health:** `http://localhost:5000/api/health`
- **Database Connection & Topic Count:** `http://localhost:5000/api/health/db`

---

## 🛠️ Troubleshooting Guide

| Issue | Plain-English Explanation | How to Fix |
| :--- | :--- | :--- |
| **Port 5000 is busy (`EADDRINUSE`)** | Another application or an earlier instance of Node.js is already running on port 5000. | 1. Stop the existing process using port 5000.<br>2. On Windows PowerShell, find and kill it: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process`<br>3. Or change the port in your `.env` file (e.g., `PORT=5001`). |
| **Old server still running in background** | A background daemon was started in an earlier terminal session and never terminated. | Stop all background Node instances or restart your terminal. |
| **"Frontend Build Required" / Missing `frontend/dist`** | The Express server started, but the React frontend has not been compiled yet. | Run `npm run build` in the root folder, then refresh the page. |
| **Missing or Default `.env` values** | Supabase or Gemini keys are empty or using default template placeholders. | Copy `.env.example` to `.env` and fill in your actual credentials. The app gracefully falls back to mock data if offline. |

---

## 🧪 Running Automated Tests

```bash
# Runs the deterministic test suite for Gap Finder and Study Planner (10/10 passing)
npm test
```

---

## 👥 Role Portals & Demo Accounts

LearnLens features an interactive login screen at `/login` with 4 instant demo autofill buttons:

| Role | Demo Credentials | Route | Scope & Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@learnlens.demo`<br>pw: `Student@123` | `/student` | Summary dashboard, untimed multi-level diagnostic quiz, confidence ratings, root-cause prerequisite display, 25-30 min study planner, AI Coach with report & fallback, and 3-room Escape the Library game. |
| **Teacher** | `teacher@learnlens.demo`<br>pw: `Teacher@123` | `/teacher` | Class overview, filterable roster, detailed student modal/report with feedback, live 15s incoming quiz submissions feed, question review queue. |
| **Parent** | `parent@learnlens.demo`<br>pw: `Parent@123` | `/parent` | Child selector, jargon-free summaries, subject levels, progress chart, teacher note reply. |
| **Admin** | `admin@learnlens.demo`<br>pw: `Admin@123` | `/admin` | Single-page console (Logout only, no Home button), student/teacher/parent counts, user table with enable/disable toggle, forms for creating users, cohorts, and parent-child links. |

---

*Built with ❤️ for inclusive, smart education that leaves no student behind.*
