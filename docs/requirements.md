# LearnLens Requirements Specification

## 1. Problem Statement
In conventional educational environments with high student-to-teacher ratios:
- Students receive single composite grades with no topic-level diagnostic feedback.
- Foundational gaps in prerequisite concepts compound over time, hindering future academic progress.
- Study time is unstructured and misaligned with individual weaknesses.
- Teachers, parents, and school administrators operate in informational silos with conflicting or delayed reports.

## 2. Target Personas & User Roles
1. **Student (Primary Persona):**
   - Take diagnostic quizzes with confidence indicators (*Sure, Not Sure, Guessing*).
   - Review diagnostic reports showing weak topics and the earliest prerequisite root causes.
   - Generate a personalized study schedule based on available daily free hours.
   - Practice weak topics with an AI tutor backed by strict fallbacks.
2. **Teacher:**
   - Inspect class-wide topic performance heatmaps.
   - Drill into individual student diagnostic gaps.
   - Assign quizzes and deliver encouraging written feedback.
3. **Parent:**
   - Review simple, non-technical progress summaries of their child.
   - Monitor active study plans and teacher notes.
4. **School Administrator:**
   - Manage classes, teachers, student rosters, and parent links.
   - Monitor high-level academic metrics across all cohorts.

## 3. Non-Functional Requirements
- **Inclusivity:** Tri-lingual support (English, Hindi, Kannada) from dictionary files.
- **Offline Reliability:** Core gap detection and schedule generation must function 100% deterministically without external AI APIs.
- **Data Privacy:** PostgreSQL Row Level Security (RLS) ensures role isolation.
- **Responsiveness:** Mobile-first layout compliant with standard mobile viewport sizes (360px+).
