# LearnLens Technical Architecture

## System Diagram

```
+--------------------------------------------------------------+
|                     Client Browser / Mobile                  |
|          React 18 (Vite) + Tailwind CSS + Lucide React       |
|    LanguageContext (EN / HI / KN) + React Router v7          |
+------------------------------+-------------------------------+
                               |
                               | REST (JSON)
                               v
+--------------------------------------------------------------+
|                   Node.js + Express Backend                  |
|                 (Port 5000 / api routes)                     |
|                                                              |
|  +---------------------+  +-------------------------------+  |
|  | Deterministic Logic |  |      Gemini AI Service        |  |
|  | - Gap Finder Graph  |  | - Explanation / Practice Gen  |  |
|  | - Study Planner     |  | - In-Memory Cache + Fallbacks |  |
|  +---------------------+  +-------------------------------+  |
+------------------------------+-------------------------------+
                               |
                               | Supabase Client / SQL
                               v
+--------------------------------------------------------------+
|                  Supabase PostgreSQL + Auth                  |
|  - Row Level Security (RLS) Policies                         |
|  - Profiles, Classes, Topics, Prerequisites, Quizzes, Gaps   |
+--------------------------------------------------------------+
```

## Data Flow: Core Diagnostic Loop
1. **Quiz Submission**: Student submits responses with confidence ratings.
2. **Deterministic Evaluation**:
   - Scores calculated per topic.
   - Threshold check: $< 60\%$ marked as weak.
   - Prerequisite DAG traversal: BFS/DFS identifies earliest unmastered foundational topic.
3. **Study Plan Synthesis**:
   - Student inputs available weekly free hours and optional exam date.
   - Algorithm allocates 25–30 minute blocks prioritizing root prerequisite gaps first.
4. **AI Enrichment**:
   - Optional targeted practice questions and concept explanations generated on-demand via Gemini API with fallback strings.
