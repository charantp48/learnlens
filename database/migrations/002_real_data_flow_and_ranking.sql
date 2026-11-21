-- =====================================================================
-- Migration 002: Real Data Flow, Grading, Clarifications, Activity Log & Ranking
-- Safe & Idempotent (Preserves all existing data)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENHANCE PROFILES TABLE
-- ---------------------------------------------------------------------
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS roll_number TEXT;

-- Flag existing mock/demo users as demo accounts
UPDATE profiles 
SET is_demo = true 
WHERE email IN (
  'priya.student@learnlens.demo', 
  'student@learnlens.demo', 
  'priya.sharma@learnlens.edu',
  'rajesh.teacher@learnlens.demo', 
  'teacher@learnlens.demo', 
  'rajesh.rao@learnlens.edu',
  'sunita.parent@learnlens.demo', 
  'parent@learnlens.demo', 
  'sunita.sharma@learnlens.edu',
  'admin@learnlens.demo', 
  'admin@learnlens.edu'
);

-- ---------------------------------------------------------------------
-- 2. TEACHER CLASSES MAPPING TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject TEXT DEFAULT 'General',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, class_id)
);

-- ---------------------------------------------------------------------
-- 3. ENHANCE QUESTIONS & QUIZ ATTEMPTS FOR LEVEL-BASED MARKS
-- Level 1 = 1 mark, Level 2 = 2 marks, Level 3 = 3 marks
-- ---------------------------------------------------------------------
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1 CHECK (level IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 1;

-- Update marks based on level
UPDATE questions SET marks = level WHERE marks <> level;

ALTER TABLE quiz_attempts 
  ADD COLUMN IF NOT EXISTS marks_earned NUMERIC(6, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marks_possible NUMERIC(6, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT false;

-- Unique constraint ensuring an attempt cannot be submitted twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_completed_attempt 
  ON quiz_attempts (id) WHERE is_completed = true;

-- ---------------------------------------------------------------------
-- 4. STUDENT REPORTS TABLE
-- One report per completed attempt
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_id UUID UNIQUE NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  marks_earned NUMERIC(6, 2) NOT NULL DEFAULT 0,
  marks_possible NUMERIC(6, 2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  level_achieved TEXT NOT NULL DEFAULT 'Level 1: Foundational Review',
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  class_rank_snapshot INT,
  school_rank_snapshot INT,
  review_status TEXT NOT NULL DEFAULT 'new' CHECK (review_status IN ('new', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. TEACHER CLARIFICATIONS TABLE
-- Clarifications given by teachers on student diagnostic reports
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_clarifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES student_reports(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('needs_extra_help', 'improve_focus', 'doing_well')),
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  comment VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. ACTIVITY LOG TABLE
-- Simple audit trail for administrative tracking
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. REAL-TIME RANKING VIEW
-- Total marks earned / Total marks possible across all completed attempts.
-- Uses standard competition RANK() so ties share rank.
-- Excludes demo accounts (is_demo = true).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW student_rankings AS
WITH student_totals AS (
  SELECT
    p.id AS student_id,
    p.full_name AS student_name,
    p.class_id,
    c.name AS class_name,
    SUM(qa.marks_earned) AS total_marks_earned,
    SUM(qa.marks_possible) AS total_marks_possible,
    ROUND((SUM(qa.marks_earned) / NULLIF(SUM(qa.marks_possible), 0) * 100), 2) AS overall_percentage,
    COUNT(qa.id) AS completed_attempts_count
  FROM profiles p
  JOIN quiz_attempts qa ON qa.student_id = p.id
  LEFT JOIN classes c ON c.id = p.class_id
  WHERE p.role = 'student'
    AND p.is_demo = false
    AND p.status = 'active'
    AND qa.marks_possible > 0
    AND qa.completed_at IS NOT NULL
  GROUP BY p.id, p.full_name, p.class_id, c.name
  HAVING COUNT(qa.id) > 0
)
SELECT
  student_id,
  student_name,
  class_id,
  class_name,
  total_marks_earned,
  total_marks_possible,
  overall_percentage,
  completed_attempts_count,
  RANK() OVER (PARTITION BY class_id ORDER BY overall_percentage DESC, total_marks_earned DESC) AS class_rank,
  RANK() OVER (ORDER BY overall_percentage DESC, total_marks_earned DESC) AS school_rank
FROM student_totals;

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_clarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current authenticated user's role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- A. Student Reports RLS
DROP POLICY IF EXISTS "Students see own reports" ON student_reports;
CREATE POLICY "Students see own reports" ON student_reports
  FOR SELECT USING (auth.uid() = student_id OR get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Parents see child reports" ON student_reports;
CREATE POLICY "Parents see child reports" ON student_reports
  FOR SELECT USING (
    get_auth_role() = 'parent' AND student_id IN (
      SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers see reports in their classes" ON student_reports;
CREATE POLICY "Teachers see reports in their classes" ON student_reports
  FOR SELECT USING (
    get_auth_role() = 'teacher' AND (
      class_id IN (SELECT class_id FROM teacher_classes WHERE teacher_id = auth.uid())
      OR student_id IN (
        SELECT cm.user_id FROM class_members cm
        WHERE cm.class_id IN (SELECT tc.class_id FROM teacher_classes tc WHERE tc.teacher_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins manage all reports" ON student_reports;
CREATE POLICY "Admins manage all reports" ON student_reports
  FOR ALL USING (get_auth_role() = 'admin');

-- B. Teacher Clarifications RLS
DROP POLICY IF EXISTS "Students read own clarifications" ON teacher_clarifications;
CREATE POLICY "Students read own clarifications" ON teacher_clarifications
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Parents read child clarifications" ON teacher_clarifications;
CREATE POLICY "Parents read child clarifications" ON teacher_clarifications
  FOR SELECT USING (
    student_id IN (SELECT student_id FROM parent_child_links WHERE parent_id = auth.uid())
  );

DROP POLICY IF EXISTS "Teachers manage clarifications for their class students" ON teacher_clarifications;
CREATE POLICY "Teachers manage clarifications for their class students" ON teacher_clarifications
  FOR ALL USING (
    get_auth_role() = 'teacher' 
    AND teacher_id = auth.uid()
    AND student_id IN (
      SELECT cm.user_id FROM class_members cm
      JOIN teacher_classes tc ON tc.class_id = cm.class_id
      WHERE tc.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins view all clarifications" ON teacher_clarifications;
CREATE POLICY "Admins view all clarifications" ON teacher_clarifications
  FOR SELECT USING (get_auth_role() = 'admin');

-- C. Activity Log RLS
DROP POLICY IF EXISTS "Admins read activity logs" ON activity_log;
CREATE POLICY "Admins read activity logs" ON activity_log
  FOR SELECT USING (get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Authenticated users insert logs" ON activity_log;
CREATE POLICY "Authenticated users insert logs" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);
