-- =====================================================================
-- LearnLens Database Schema
-- Multi-Role EduTech Platform: Student, Teacher, Parent, Admin
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- =====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES (Users across all 4 roles)
-- Links optionally to auth.users if Supabase Auth is active
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  avatar_url TEXT,
  phone TEXT, -- optional contact, no sensitive data collected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. CLASSES & MEMBERSHIPS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "Class 9-A"
  grade_level TEXT NOT NULL, -- e.g. "9"
  section TEXT DEFAULT 'A',
  academic_year TEXT NOT NULL DEFAULT '2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, user_id)
);

-- ---------------------------------------------------------------------
-- 3. PARENT-CHILD RELATIONSHIPS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent', -- parent, guardian
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_id, student_id)
);

-- ---------------------------------------------------------------------
-- 4. CURRICULUM: SUBJECTS, TOPICS & PREREQUISITES GRAPH
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "Mathematics"
  code TEXT UNIQUE NOT NULL, -- e.g. "MATH-09"
  grade_level TEXT NOT NULL, -- e.g. "9"
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Quadratic Equations"
  description TEXT,
  order_index INT NOT NULL DEFAULT 1,
  grade_level TEXT NOT NULL DEFAULT '9',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prerequisite Directed Graph (A requires B as prerequisite)
CREATE TABLE IF NOT EXISTS topic_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE, -- Target topic
  prerequisite_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE, -- Required topic
  relationship_type TEXT NOT NULL DEFAULT 'strict' CHECK (relationship_type IN ('strict', 'recommended')),
  UNIQUE (topic_id, prerequisite_topic_id)
);

-- ---------------------------------------------------------------------
-- 5. QUESTIONS & QUIZZES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL, -- Pre-written deterministic explanation (safe offline fallback)
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  time_limit_minutes INT NOT NULL DEFAULT 15,
  total_questions INT NOT NULL DEFAULT 10,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_diagnostic BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. QUIZ ATTEMPTS & CONFIDENCE-WEIGHTED ANSWERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  total_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('sure', 'not_sure', 'guessing')),
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. DIAGNOSED LEARNING GAPS (Evidence-Backed Root Cause Analysis)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE, -- Weak topic (< 60%)
  root_prerequisite_id UUID REFERENCES topics(id) ON DELETE SET NULL, -- Root foundational gap identified
  accuracy NUMERIC(5, 2) NOT NULL, -- Accuracy percentage on this topic
  confidence_score NUMERIC(5, 2) NOT NULL, -- Confidence-weighted score
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'resolved')),
  reason TEXT NOT NULL, -- Human-readable evidence (e.g. "Low accuracy in Factoring explains struggle in Quadratics")
  diagnosed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 8. ADAPTIVE STUDY SESSIONS (25-30 Minute Time-Blocked Planner)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 25 CHECK (duration_minutes BETWEEN 15 AND 60),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'missed')),
  focus_notes TEXT, -- e.g. "Focus on prerequisite factoring rules before test"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 9. HISTORICAL PROGRESS & MASTERY TRACKING
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  attempts_count INT NOT NULL DEFAULT 1,
  last_evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, topic_id)
);

-- ---------------------------------------------------------------------
-- 10. TEACHER FEEDBACK
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'encouragement' CHECK (feedback_type IN ('encouragement', 'revision_focus', 'milestone')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current authenticated user's role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------
-- RLS: Public / Shared Curriculum Tables (Subjects, Topics, Prerequisites, Questions)
-- All authenticated users can view curriculum, admins & teachers can manage
-- ---------------------------------------------------------------------
CREATE POLICY "Curriculum readable by all" ON subjects FOR SELECT USING (true);
CREATE POLICY "Topics readable by all" ON topics FOR SELECT USING (true);
CREATE POLICY "Prerequisites readable by all" ON topic_prerequisites FOR SELECT USING (true);
CREATE POLICY "Questions readable by all" ON questions FOR SELECT USING (true);
CREATE POLICY "Quizzes readable by all" ON quizzes FOR SELECT USING (true);

-- ---------------------------------------------------------------------
-- RLS: Profiles
-- ---------------------------------------------------------------------
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR get_auth_role() = 'admin');

CREATE POLICY "Teachers can view class students" ON profiles
  FOR SELECT USING (
    get_auth_role() = 'teacher' AND id IN (
      SELECT cm.user_id FROM class_members cm
      WHERE cm.class_id IN (
        SELECT class_id FROM class_members WHERE user_id = auth.uid() AND role = 'teacher'
      )
    )
  );

CREATE POLICY "Parents can view linked child profile" ON profiles
  FOR SELECT USING (
    get_auth_role() = 'parent' AND id IN (
      SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- RLS: Quiz Attempts & Answers
-- ---------------------------------------------------------------------
CREATE POLICY "Students see own quiz attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = student_id OR get_auth_role() = 'admin');

CREATE POLICY "Teachers see quiz attempts in their classes" ON quiz_attempts
  FOR SELECT USING (
    get_auth_role() = 'teacher' AND student_id IN (
      SELECT cm.user_id FROM class_members cm
      WHERE cm.class_id IN (
        SELECT class_id FROM class_members WHERE user_id = auth.uid() AND role = 'teacher'
      )
    )
  );

CREATE POLICY "Parents see child quiz attempts" ON quiz_attempts
  FOR SELECT USING (
    get_auth_role() = 'parent' AND student_id IN (
      SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Answers visible to attempt owner or privileged roles" ON student_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa 
      WHERE qa.id = student_answers.attempt_id 
      AND (
        qa.student_id = auth.uid() 
        OR get_auth_role() IN ('teacher', 'admin')
        OR (get_auth_role() = 'parent' AND qa.student_id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()))
      )
    )
  );

-- ---------------------------------------------------------------------
-- RLS: Learning Gaps & Study Sessions
-- ---------------------------------------------------------------------
CREATE POLICY "Students manage own gaps" ON learning_gaps
  FOR ALL USING (auth.uid() = student_id OR get_auth_role() IN ('teacher', 'admin'));

CREATE POLICY "Parents read child learning gaps" ON learning_gaps
  FOR SELECT USING (
    get_auth_role() = 'parent' AND student_id IN (
      SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Students manage own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = student_id OR get_auth_role() = 'admin');

CREATE POLICY "Teachers and Parents read study sessions" ON study_sessions
  FOR SELECT USING (
    (get_auth_role() = 'parent' AND student_id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()))
    OR
    (get_auth_role() = 'teacher' AND student_id IN (
      SELECT cm.user_id FROM class_members cm
      WHERE cm.class_id IN (SELECT class_id FROM class_members WHERE user_id = auth.uid() AND role = 'teacher')
    ))
  );

-- ---------------------------------------------------------------------
-- RLS: Feedback
-- ---------------------------------------------------------------------
CREATE POLICY "Feedback access" ON feedback
  FOR SELECT USING (
    student_id = auth.uid()
    OR teacher_id = auth.uid()
    OR get_auth_role() = 'admin'
    OR (get_auth_role() = 'parent' AND student_id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()))
  );

CREATE POLICY "Teachers create feedback" ON feedback
  FOR INSERT WITH CHECK (teacher_id = auth.uid() OR get_auth_role() = 'admin');
