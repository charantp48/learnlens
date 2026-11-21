-- =====================================================================
-- LearnLens Database Seed Data (Fixed & Fully Idempotent)
-- All UUIDs strictly formatted with valid hexadecimal characters [0-9, a-f]
-- Safe to run multiple times (ON CONFLICT clauses on all inserts)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DEMO PROFILES (4 Connected Roles + Peer Students)
-- Prefix: 00000000-0000-0000-0000-00000000000X
-- ---------------------------------------------------------------------
INSERT INTO profiles (id, full_name, email, role, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'Priya Sharma', 'priya.student@learnlens.demo', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
('00000000-0000-0000-0000-000000000002', 'Mr. Rajesh Rao', 'rajesh.teacher@learnlens.demo', 'teacher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'),
('00000000-0000-0000-0000-000000000003', 'Sunita Sharma', 'sunita.parent@learnlens.demo', 'parent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita'),
('00000000-0000-0000-0000-000000000004', 'Dr. Vikram Malhotra', 'admin@learnlens.demo', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'),
('00000000-0000-0000-0000-000000000005', 'Rahul Verma', 'rahul.student@learnlens.demo', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'),
('00000000-0000-0000-0000-000000000006', 'Ananya Sen', 'ananya.student@learnlens.demo', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya')
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- ---------------------------------------------------------------------
-- 2. CLASS & MEMBERSHIPS
-- Class UUID Prefix: c0000000-...
-- ---------------------------------------------------------------------
INSERT INTO classes (id, name, grade_level, section, academic_year) VALUES
('c0000000-0000-0000-0000-000000000001', 'Class 9-A', '9', 'A', '2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO class_members (class_id, user_id, role) VALUES
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'teacher'),
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'student'),
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'student'),
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'student')
ON CONFLICT (class_id, user_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. PARENT-CHILD LINKAGE
-- ---------------------------------------------------------------------
INSERT INTO parent_child_links (parent_id, student_id, relationship_type) VALUES
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'mother')
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 4. SUBJECT (Class 9 Maths)
-- Subject UUID: a0000000-0000-0000-0000-000000000001 (Valid hex 'a')
-- ---------------------------------------------------------------------
INSERT INTO subjects (id, name, code, grade_level, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'Class 9 Mathematics', 'MATH-09', '9', 'CBSE Class 9 Mathematics Curriculum')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5. 10 TOPICS WITH REALISTIC CURRICULUM DEPTH
-- Topic UUID Prefix: 10000000-...
-- ---------------------------------------------------------------------
INSERT INTO topics (id, subject_id, name, description, order_index, grade_level) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Number Systems & Rationals', 'Rational, irrational numbers and representation on the number line.', 1, '9'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Real Numbers & Radicals', 'Operations on real numbers, surds, and laws of exponents.', 2, '9'),
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Algebraic Identities & Factoring', 'Polynomial factorization, Remainder Theorem, and standard identities.', 3, '9'),
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Quadratic Equations', 'Standard form, solving by factoring and quadratic formula.', 4, '9'),
('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Linear Equations in 1 Variable', 'Foundational equations, balancing, and word problems.', 5, '9'),
('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Linear Equations in 2 Variables', 'Graphical representation, solutions of ax + by + c = 0.', 6, '9'),
('10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Lines and Angles', 'Axioms, vertically opposite angles, transversals, and parallel lines.', 7, '9'),
('10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Triangles & Congruence', 'SAS, ASA, SSS, RHS congruence criteria and properties.', 8, '9'),
('10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Quadrilaterals & Polygons', 'Properties of parallelograms, mid-point theorem, and angle sums.', 9, '9'),
('10000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Coordinate Geometry', 'Cartesian plane, plotting coordinates, quadrants, and signs.', 10, '9')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 6. PREREQUISITES DIRECTED GRAPH
-- Topic A requires Topic B as its prerequisite
-- ---------------------------------------------------------------------
INSERT INTO topic_prerequisites (topic_id, prerequisite_topic_id, relationship_type) VALUES
-- Real Numbers (T2) requires Number Systems (T1)
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'strict'),

-- Quadratic Equations (T4) requires Algebraic Factoring (T3)
('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'strict'),

-- Linear Equations in 2 Variables (T6) requires Linear Eq in 1 Var (T5) & Factoring (T3)
('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'strict'),
('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'recommended'),

-- Triangles & Congruence (T8) requires Lines & Angles (T7)
('10000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007', 'strict'),

-- Quadrilaterals (T9) requires Triangles & Congruence (T8)
('10000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 'strict'),

-- Coordinate Geometry (T10) requires Real Numbers (T2) & Linear Equations (T5)
('10000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', 'strict'),
('10000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'recommended')
ON CONFLICT (topic_id, prerequisite_topic_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 7. 30 DIAGNOSTIC QUESTIONS (3 per Topic)
-- Question UUID Prefix: 20000000-...
-- ---------------------------------------------------------------------
-- Topic 1: Number Systems
INSERT INTO questions (id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Which of the following is an irrational number?', '3.14159', '22/7', '√2', '0.333...', 'C', '√2 cannot be expressed as a ratio p/q of two integers, hence it is irrational.', 'easy'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Between any two rational numbers, there exist:', 'No rational numbers', 'Exactly one rational number', 'Infinitely many rational numbers', 'Only irrational numbers', 'C', 'The set of rational numbers is dense; infinitely many rational numbers lie between any two distinct numbers.', 'medium'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'The decimal expansion of 7/8 is:', 'Terminating', 'Non-terminating repeating', 'Non-terminating non-repeating', 'Undefined', 'A', '7/8 = 0.875, which terminates because denominator 8 = 2^3 has only prime factor 2.', 'easy'),

-- Topic 2: Real Numbers & Radicals
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'What is the rationalized form of 1 / (√5 + √2)?', '(√5 - √2) / 3', '(√5 + √2) / 3', '(√5 - √2) / 7', '√5 - √2', 'A', 'Multiply numerator and denominator by conjugate (√5 - √2): (√5 - √2)/(5 - 2) = (√5 - √2)/3.', 'medium'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Evaluate (64)^(1/3):', '2', '4', '8', '16', 'B', '4 * 4 * 4 = 64, therefore (64)^(1/3) = 4.', 'easy'),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Simplify: (√3 + 2)(√3 - 2)', '-1', '1', '7', '-7', 'A', 'Using (a+b)(a-b) = a^2 - b^2: (√3)^2 - 2^2 = 3 - 4 = -1.', 'medium'),

-- Topic 3: Algebraic Identities & Factoring
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'What are the factors of x² - 9?', '(x - 3)(x - 3)', '(x + 3)(x + 3)', '(x - 3)(x + 3)', '(x - 9)(x + 1)', 'C', 'Difference of squares formula: a² - b² = (a - b)(a + b). Here 9 = 3², so (x - 3)(x + 3).', 'easy'),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Factorize x² + 5x + 6 completely:', '(x + 1)(x + 6)', '(x + 2)(x + 3)', '(x - 2)(x - 3)', '(x + 5)(x + 1)', 'B', 'Find two numbers that multiply to 6 and add to 5: 2 and 3. Thus (x + 2)(x + 3).', 'medium'),
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'If p(x) = x³ - 3x + 2, what is p(1)?', '0', '1', '2', '-1', 'A', 'Substitute x = 1: 1³ - 3(1) + 2 = 1 - 3 + 2 = 0.', 'easy'),

-- Topic 4: Quadratic Equations
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'What are the roots of the equation x² - 5x + 6 = 0?', 'x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6', 'A', 'Factoring gives (x - 2)(x - 3) = 0, so x = 2 or x = 3.', 'medium'),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'The discriminant D of ax² + bx + c = 0 is defined as:', 'b² - 2ac', 'b² - 4ac', '4ac - b²', 'b + 4ac', 'B', 'The discriminant formula is D = b² - 4ac.', 'easy'),
('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'If a quadratic equation has real and equal roots, the discriminant D must be:', 'D > 0', 'D < 0', 'D = 0', 'D ≤ 0', 'C', 'When D = 0, the two roots merge into one repeated real root: -b / (2a).', 'medium'),

-- Topic 5: Linear Equations in 1 Variable
('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', 'Solve for x: 3x - 7 = 14', 'x = 5', 'x = 7', 'x = 21', 'x = 3', 'B', '3x = 14 + 7 = 21 => x = 21 / 3 = 7.', 'easy'),
('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', 'If (2x + 1)/3 = 5, what is x?', 'x = 7', 'x = 8', 'x = 9', 'x = 6', 'A', '2x + 1 = 15 => 2x = 14 => x = 7.', 'easy'),
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', 'A number added to its two-thirds is 35. What is the number?', '21', '14', '28', '15', 'A', 'x + (2/3)x = 35 => (5/3)x = 35 => x = 35 * (3/5) = 21.', 'medium'),

-- Topic 6: Linear Equations in 2 Variables
('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000006', 'A linear equation in two variables ax + by + c = 0 has:', 'A unique solution', 'Two solutions', 'Infinitely many solutions', 'No solution', 'C', 'Every point on the line represented by ax + by + c = 0 is a valid solution.', 'easy'),
('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000006', 'Which point lies on the line 2x + 3y = 12?', '(3, 2)', '(2, 3)', '(0, 3)', '(4, 1)', 'A', 'Substitute (3, 2): 2(3) + 3(2) = 6 + 6 = 12. Correct!', 'medium'),
('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000006', 'The equation x = 7 represents a line:', 'Parallel to x-axis', 'Parallel to y-axis', 'Passing through origin', 'Passing through (0, 7)', 'B', 'The equation x = k is a vertical line parallel to the y-axis.', 'medium'),

-- Topic 7: Lines and Angles
('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000007', 'Two angles whose sum is 180° are called:', 'Complementary angles', 'Supplementary angles', 'Adjacent angles', 'Vertically opposite angles', 'B', 'Supplementary angles sum to 180 degrees by definition.', 'easy'),
('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000007', 'If two parallel lines are cut by a transversal, corresponding angles are:', 'Supplementary', 'Equal', 'Complementary', 'Unequal', 'B', 'The Corresponding Angles Axiom states that corresponding angles are equal.', 'easy'),
('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000007', 'An angle is 20° more than its complement. What is the angle?', '35°', '55°', '70°', '45°', 'B', 'x + (x - 20) = 90 => 2x = 110 => x = 55°.', 'medium'),

-- Topic 8: Triangles & Congruence
('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000008', 'Which of the following is NOT a criterion for congruence of triangles?', 'SAS', 'ASA', 'AAA', 'SSS', 'C', 'AAA (Angle-Angle-Angle) guarantees similarity, not congruence.', 'easy'),
('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000008', 'In an isosceles triangle ABC with AB = AC, the angles opposite to these sides are:', 'Unequal', 'Complementary', 'Equal', 'Right angles', 'C', 'Angles opposite to equal sides of an isosceles triangle are equal.', 'easy'),
('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000008', 'In triangle ABC, if angle A = 60° and angle B = 70°, what is angle C?', '50°', '60°', '70°', '40°', 'A', 'Sum of angles in a triangle is 180°: 180 - (60 + 70) = 50°.', 'easy'),

-- Topic 9: Quadrilaterals & Polygons
('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000009', 'The sum of all four interior angles of a quadrilateral is:', '180°', '270°', '360°', '540°', 'C', 'Angle sum of any quadrilateral is (4 - 2) * 180° = 360°.', 'easy'),
('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000009', 'The diagonals of a rhombus:', 'Are equal only', 'Bisect each other at right angles', 'Are parallel', 'Do not bisect', 'B', 'A key geometric property of a rhombus is that diagonals bisect perpendicularly.', 'medium'),
('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000009', 'The line segment joining mid-points of two sides of a triangle is:', 'Perpendicular to third side', 'Half of and parallel to third side', 'Equal to third side', 'Double the third side', 'B', 'Mid-point theorem: segment is parallel to the third side and half its length.', 'medium'),

-- Topic 10: Coordinate Geometry
('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000010', 'The coordinates of the origin are:', '(0, 1)', '(1, 0)', '(0, 0)', '(1, 1)', 'C', 'The origin is the intersection of x and y axes: (0, 0).', 'easy'),
('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000010', 'In which quadrant does the point (-3, 4) lie?', 'Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV', 'B', 'Negative x and positive y corresponds to Quadrant II.', 'easy'),
('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000010', 'The perpendicular distance of the point (4, 7) from the x-axis is:', '4 units', '7 units', '11 units', '√65 units', 'B', 'Distance from the x-axis is given by |y-coordinate| = |7| = 7 units.', 'medium')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 8. QUIZ & ATTEMPTS (Priya, Rahul, Ananya)
-- Quiz UUID: e0000000-0000-0000-0000-000000000001 (Valid hex 'e')
-- Attempt UUID: d0000000-0000-0000-0000-000000000001 (Valid hex 'd')
-- ---------------------------------------------------------------------
INSERT INTO quizzes (id, title, subject_id, class_id, time_limit_minutes, total_questions, created_by, is_diagnostic) VALUES
('e0000000-0000-0000-0000-000000000001', 'Mid-Term Diagnostic Quiz (Class 9 Maths)', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 20, 10, '00000000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO NOTHING;

-- Priya's Diagnostic Attempt (Demonstrating weak Quadratic Equations & Factoring)
INSERT INTO quiz_attempts (id, quiz_id, student_id, score, total_score, percentage, completed_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5.0, 10.0, 50.0, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Priya's specific answers with confidence ratings
INSERT INTO student_answers (attempt_id, question_id, selected_option, is_correct, confidence) VALUES
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'C', true, 'sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'A', true, 'not_sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007', 'A', false, 'guessing'), -- Factoring error
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 'C', false, 'guessing'), -- Factoring error
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'B', false, 'guessing'), -- Quadratic error
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000013', 'B', true, 'sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000019', 'B', true, 'sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000022', 'C', true, 'sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000025', 'A', false, 'not_sure'),
('d0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000028', 'C', true, 'sure')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 9. DIAGNOSED LEARNING GAP (Evidence Traced to Prerequisite)
-- Gap UUID: b0000000-0000-0000-0000-000000000001 (Valid hex 'b')
-- ---------------------------------------------------------------------
INSERT INTO learning_gaps (id, student_id, topic_id, root_prerequisite_id, accuracy, confidence_score, status, reason) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004', -- Quadratic Equations (<60%)
  '10000000-0000-0000-0000-000000000003', -- Algebraic Identities & Factoring
  33.33,
  20.00,
  'active',
  'Struggle detected in Quadratic Equations (33% accuracy). Graph traversal identified foundational gaps in prerequisite: Algebraic Identities & Factoring (0% confident accuracy). Solving quadratic equations requires mastering middle-term splitting and difference of squares first.'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 10. ADAPTIVE STUDY SESSIONS (Tailored to Priya's Free Time)
-- Session UUID Prefix: f0000000-... (Valid hex 'f')
-- ---------------------------------------------------------------------
INSERT INTO study_sessions (id, student_id, topic_id, scheduled_date, start_time, duration_minutes, status, focus_notes) VALUES
('f0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', CURRENT_DATE, '17:00:00', 30, 'planned', 'Prerequisite Root Fix: Practice middle-term splitting and difference of squares (a² - b²).'),
('f0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', CURRENT_DATE + 1, '17:00:00', 25, 'planned', 'Prerequisite Root Fix: Polynomial Remainder theorem and expansion identities.'),
('f0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', CURRENT_DATE + 2, '18:00:00', 30, 'planned', 'Target Topic: Solving quadratic equations using factored roots.')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 11. PROGRESS RECORDS (Ensuring Charts are Beautifully Populated)
-- ---------------------------------------------------------------------
INSERT INTO progress_records (student_id, subject_id, topic_id, mastery_score, attempts_count) VALUES
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 85.00, 3),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 75.00, 2),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 45.00, 2),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 40.00, 1),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 90.00, 3),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 80.00, 2),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 70.00, 2),
('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 95.00, 3),

-- Peer Student Rahul's Attempts for Class Heatmaps
('00000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 50.00, 1),
('00000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 55.00, 1),
('00000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 85.00, 2),

-- Peer Student Ananya's Attempts
('00000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 75.00, 2),
('00000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 80.00, 2),
('00000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 90.00, 2)
ON CONFLICT (student_id, topic_id) DO UPDATE SET 
  mastery_score = EXCLUDED.mastery_score,
  attempts_count = EXCLUDED.attempts_count;

-- ---------------------------------------------------------------------
-- 12. TEACHER FEEDBACK
-- ---------------------------------------------------------------------
INSERT INTO feedback (teacher_id, student_id, topic_id, message, feedback_type) VALUES
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'Priya, you have strong geometric intuition, but quadratic equations will keep feeling difficult until we firm up polynomial factoring. Spend 25 minutes on middle-term splitting identities this week.',
  'revision_focus'
)
ON CONFLICT (id) DO NOTHING;
