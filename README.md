# LearnLens 🎓🔍
> **Smart, Inclusive, Personalized Education for Large Classrooms**

LearnLens is an EduTech web application engineered for a 24-hour hackathon. It tackles the core dilemma in modern education: **students receive a test score, but no diagnosis of why they struggled, which prerequisite caused the gap, or how to study within their available hours.**

---

## 🌟 Core Pillars

1. **Root-Cause Gap Finder**: Pinpoints not just what a student got wrong, but traverses the curriculum graph to flag the foundational prerequisite they missed (e.g., struggling with Quadratic Equations due to factoring in Class 8).
2. **Confidence-Weighted Quizzes**: Distinguishes between confident mastery, uncertainty, and guessing.
3. **Adaptive Study Planner**: Turns student free hours + weak prerequisites + exam dates into focused 25–30 minute study sessions.
4. **Responsible Gemini AI Assistant**: Explains misconceptions with safe fallbacks, server-side caching, and prominent verification tags.
5. **Four Role-Based Dashboards**: Student (priority), Teacher, Parent, and Admin over the same unified database.
6. **Tri-Lingual Inclusivity**: Fully translated UI in **English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ)** with zero hardcoded strings.

---

## 📁 Project Architecture

```
learnlens/
├── .env.example              # Placeholder environment variables
├── .gitignore                # Protects secrets and builds
├── README.md                 # Setup & documentation
├── docs/                     # Architecture & requirements specs
├── database/                 # PostgreSQL schema (RLS) & seed scripts
├── backend/                  # Node.js + Express REST API
│   └── src/
│       ├── config/           # Configuration & env management
│       ├── controllers/      # Route controllers
│       ├── middleware/       # Auth & role verification
│       ├── routes/           # API endpoints
│       ├── services/         # Gap finder, planner & Gemini AI logic
│       └── server.js         # Server entry point
└── frontend/                 # Vite + React (JavaScript) + Tailwind CSS
    └── src/
        ├── components/       # Reusable UI components & layouts
        ├── context/          # LanguageContext (EN / HI / KN)
        ├── translations/     # en.json, hi.json, kn.json
        ├── pages/            # Role dashboards & landing
        ├── modules/          # Quiz, LearningGap, StudyPlanner, AIChat
        └── services/         # API clients
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (LTS version 18+ or 20+)
- npm (comes with Node.js)
- Git

### 1. Clone & Setup Workspace
```cmd
cd "C:\Users\Mohitha G S\.gemini\antigravity\scratch\learnlens"
```

### 2. Backend Setup
```cmd
cd backend
npm install
npm run dev
```
The backend API starts on `http://localhost:5000`. Test health: `http://localhost:5000/api/health`.

### 3. Frontend Setup (New Terminal Window)
```cmd
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Core Logic
Unit tests for the Gap Finder and Study Planner run using Node's built-in test runner:
```cmd
cd backend
npm test
```

---

## 🔒 Security & Safe AI Notice
- All Gemini API calls happen on the backend server. API keys are never exposed in frontend bundles.
- Every AI response features a "⚠️ AI-generated, please verify" notice and a fallback message if the service is unreachable.
