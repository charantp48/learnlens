import express from 'express';
import { supabase } from '../config/supabase.js';
import { MOCK_TOPICS, MOCK_PREREQUISITES_GRAPH } from '../config/mockData.js';
import { findLearningGaps } from '../services/gapFinder.js';
import { saveAttemptAndReport, getStudentRankSnapshot, computeStudentRankings } from '../services/reportService.js';
import { getAllUsers, logActivity } from './adminRoutes.js';

const router = express.Router();

/**
 * Authoritative Master Question Bank
 * Every question has an explicit level:
 * Level 1 = 1 mark
 * Level 2 = 2 marks
 * Level 3 = 3 marks
 * Wrong or skipped = 0 marks. No negative marking.
 */
export const AUTHORITATIVE_QUESTIONS = [
  // Class 11 & 12 / JEE & KCET Track Questions
  {
    id: 'math-01',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000003',
    topic_name: 'Algebraic Identities & Factoring',
    question_text: 'What are the factors of x² - 9y²?',
    option_a: '(x - 3y)(x - 3y)',
    option_b: '(x + 3y)(x + 3y)',
    option_c: '(x - 3y)(x + 3y)',
    option_d: '(x - 9y)(x + y)',
    correct_option: 'C',
    explanation: 'Using identity a² - b² = (a - b)(a + b) with a = x and b = 3y: x² - 9y² = (x - 3y)(x + 3y).',
  },
  {
    id: 'math-02',
    subject: 'Mathematics',
    level: 2,
    marks: 2,
    topic_id: '10000000-0000-0000-0000-000000000004',
    topic_name: 'Quadratic Equations & Roots',
    question_text: 'Puzzle: If the sum of the roots of 2x² - kx + 8 = 0 equals the product of its roots, what is the value of k?',
    option_a: 'k = 4',
    option_b: 'k = 8',
    option_c: 'k = 16',
    option_d: 'k = -8',
    correct_option: 'B',
    explanation: 'Sum of roots = k/2. Product of roots = 8/2 = 4. Setting k/2 = 4 yields k = 8.',
  },
  {
    id: 'math-03',
    subject: 'Mathematics',
    level: 3,
    marks: 3,
    topic_id: '10000000-0000-0000-0000-000000000011',
    topic_name: 'Differential Calculus & Derivatives',
    question_text: 'Interactive: A particle moves such that s(t) = t³ - 6t² + 9t. At which timestamp(s) does the particle momentarily stop (v = 0)?',
    option_a: 't = 0 and t = 3',
    option_b: 't = 1 and t = 3',
    option_c: 't = 2 and t = 4',
    option_d: 't = 3 only',
    correct_option: 'B',
    explanation: 'v(t) = ds/dt = 3t² - 12t + 9 = 3(t - 1)(t - 3). v(t) = 0 gives t = 1 and t = 3.',
  },
  {
    id: 'phy-01',
    subject: 'Physics',
    level: 1,
    marks: 1,
    topic_id: '20000000-0000-0000-0000-000000000001',
    topic_name: 'Kinematics & Vector Resolution',
    question_text: 'A force vector of 50 N acts at 30° to the horizontal ground. What is its horizontal component?',
    option_a: '25 N',
    option_b: '25√3 N (≈ 43.3 N)',
    option_c: '50√3 N',
    option_d: '100 N',
    correct_option: 'B',
    explanation: 'F_x = F · cos(30°) = 50 · (√3/2) = 25√3 N.',
  },
  {
    id: 'phy-02',
    subject: 'Physics',
    level: 2,
    marks: 2,
    topic_id: '20000000-0000-0000-0000-000000000002',
    topic_name: 'Rotational Dynamics & Moment of Inertia',
    question_text: 'Puzzle: A solid cylinder and a thin hollow hoop of equal mass M and radius R roll down an incline without slipping. Which reaches the bottom first?',
    option_a: 'The hollow hoop',
    option_b: 'The solid cylinder',
    option_c: 'Both arrive at the exact same instant',
    option_d: 'Depends on the angle of inclination',
    correct_option: 'B',
    explanation: 'The solid cylinder has smaller moment of inertia (1/2 MR² vs MR²), providing greater translational acceleration.',
  },
  {
    id: 'phy-03',
    subject: 'Physics',
    level: 3,
    marks: 3,
    topic_id: '20000000-0000-0000-0000-000000000003',
    topic_name: 'Electrostatics & Coulomb Law',
    question_text: 'Interactive: Two point charges +q and +4q are fixed distance L apart. At what distance x from +q along the line joining them is net force zero?',
    option_a: 'x = L / 2',
    option_b: 'x = L / 3',
    option_c: 'x = L / 4',
    option_d: 'x = 2L / 3',
    correct_option: 'B',
    explanation: 'Equating electrostatic forces gives 1/x = 2/(L - x) => 3x = L => x = L/3.',
  },
  {
    id: 'chem-01',
    subject: 'Chemistry',
    level: 1,
    marks: 1,
    topic_id: '30000000-0000-0000-0000-000000000001',
    topic_name: 'Chemical Bonding & Hybridization',
    question_text: 'What is the hybridization and geometric shape of the central carbon in Methane (CH₄)?',
    option_a: 'sp², Trigonal Planar',
    option_b: 'sp³, Tetrahedral',
    option_c: 'sp, Linear',
    option_d: 'dsp², Square Planar',
    correct_option: 'B',
    explanation: 'Carbon has 4 bond pairs and 0 lone pairs; steric number 4 corresponds to sp³ hybridization with tetrahedral geometry.',
  },
  {
    id: 'chem-02',
    subject: 'Chemistry',
    level: 2,
    marks: 2,
    topic_id: '30000000-0000-0000-0000-000000000002',
    topic_name: 'Chemical Equilibrium & Le Chatelier',
    question_text: 'Puzzle: For exothermic reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat, which adjustment increases equilibrium yield of Ammonia?',
    option_a: 'Increasing the temperature',
    option_b: 'Increasing the pressure (reducing volume)',
    option_c: 'Adding an inert gas at constant volume',
    option_d: 'Adding a catalyst',
    correct_option: 'B',
    explanation: 'Increasing pressure shifts equilibrium toward fewer gas moles (4 moles -> 2 moles).',
  },
  {
    id: 'chem-03',
    subject: 'Chemistry',
    level: 3,
    marks: 3,
    topic_id: '30000000-0000-0000-0000-000000000003',
    topic_name: 'Electrochemistry & Nernst Equation',
    question_text: 'Interactive: In Daniel cell Zn | Zn²⁺(0.1M) || Cu²⁺(1.0M) | Cu, what happens to cell potential if Zn²⁺ solution is diluted?',
    option_a: 'E_cell decreases',
    option_b: 'E_cell increases',
    option_c: 'E_cell drops to zero',
    option_d: 'No change in E_cell',
    correct_option: 'B',
    explanation: 'By Nernst Equation: E = E° - (0.059/2) log([Zn²⁺]/[Cu²⁺]). Lowering [Zn²⁺] reduces reaction quotient Q and increases E_cell.',
  },
  {
    id: 'cs-01',
    subject: 'Computer Science',
    level: 1,
    marks: 1,
    topic_id: '40000000-0000-0000-0000-000000000001',
    topic_name: 'Functions & Stack Frames',
    question_text: 'When a function calls another function in programming, where is the return address and local state stored?',
    option_a: 'Heap Memory',
    option_b: 'Call Stack',
    option_c: 'Hard Drive Cache',
    option_d: 'Instruction Register',
    correct_option: 'B',
    explanation: 'Execution frames and local variables are pushed onto the Call Stack in LIFO order.',
  },
  {
    id: 'cs-02',
    subject: 'Computer Science',
    level: 2,
    marks: 2,
    topic_id: '40000000-0000-0000-0000-000000000002',
    topic_name: 'Recursion & Base Cases',
    question_text: 'Puzzle: What is the output of recursive function solve(4)? \nfunction solve(n) { if (n <= 1) return 1; return n + solve(n - 1); }',
    option_a: '10',
    option_b: '24',
    option_c: '8',
    option_d: 'Infinite recursion / Stack Overflow',
    correct_option: 'A',
    explanation: 'solve(4) = 4 + 3 + 2 + 1 = 10.',
  },
  {
    id: 'cs-03',
    subject: 'Computer Science',
    level: 3,
    marks: 3,
    topic_id: '40000000-0000-0000-0000-000000000003',
    topic_name: 'Binary Trees & Search Time Complexity',
    question_text: 'Interactive: A balanced Binary Search Tree contains 1,024 elements. What is the maximum number of node comparisons to locate an element?',
    option_a: '1,024 comparisons',
    option_b: '10 comparisons',
    option_c: '512 comparisons',
    option_d: '20 comparisons',
    correct_option: 'B',
    explanation: 'Lookup in balanced BST is O(log₂ N). Since 1,024 = 2¹⁰, log₂(1024) = 10 comparisons.',
  },

  // Class 9 Foundation Questions
  {
    id: '20000000-0000-0000-0000-000000000001',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000001',
    topic_name: 'Number Systems & Rationals',
    question_text: 'Which of the following is an irrational number?',
    option_a: '3.14159',
    option_b: '22/7',
    option_c: '√2',
    option_d: '0.333...',
    correct_option: 'C',
    explanation: '√2 cannot be expressed as a ratio p/q of two integers, hence it is an irrational number.',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    subject: 'Mathematics',
    level: 2,
    marks: 2,
    topic_id: '10000000-0000-0000-0000-000000000002',
    topic_name: 'Real Numbers & Radicals',
    question_text: 'What is the rationalized form of 1 / (√5 + √2)?',
    option_a: '(√5 - √2) / 3',
    option_b: '(√5 + √2) / 3',
    option_c: '(√5 - √2) / 7',
    option_d: '√5 - √2',
    correct_option: 'A',
    explanation: 'Multiply numerator and denominator by (√5 - √2): (√5 - √2)/(5 - 2) = (√5 - √2)/3.',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000003',
    topic_name: 'Algebraic Identities & Factoring',
    question_text: 'What are the factors of x² - 9?',
    option_a: '(x - 3)(x - 3)',
    option_b: '(x + 3)(x + 3)',
    option_c: '(x - 3)(x + 3)',
    option_d: '(x - 9)(x + 1)',
    correct_option: 'C',
    explanation: 'Difference of squares: a² - b² = (a - b)(a + b). x² - 9 = (x - 3)(x + 3).',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    subject: 'Mathematics',
    level: 2,
    marks: 2,
    topic_id: '10000000-0000-0000-0000-000000000003',
    topic_name: 'Algebraic Identities & Factoring',
    question_text: 'Factorize x² + 5x + 6 completely:',
    option_a: '(x + 1)(x + 6)',
    option_b: '(x + 2)(x + 3)',
    option_c: '(x - 2)(x - 3)',
    option_d: '(x + 5)(x + 1)',
    correct_option: 'B',
    explanation: 'Numbers multiplying to 6 and adding to 5 are 2 and 3: (x + 2)(x + 3).',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    subject: 'Mathematics',
    level: 2,
    marks: 2,
    topic_id: '10000000-0000-0000-0000-000000000004',
    topic_name: 'Quadratic Equations',
    question_text: 'What are the roots of the equation x² - 5x + 6 = 0?',
    option_a: 'x = 2, 3',
    option_b: 'x = -2, -3',
    option_c: 'x = 1, 6',
    option_d: 'x = -1, -6',
    correct_option: 'A',
    explanation: 'Factoring gives (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3.',
  },
  {
    id: '20000000-0000-0000-0000-000000000013',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000005',
    topic_name: 'Linear Equations in 1 Variable',
    question_text: 'Solve for x: 3x - 7 = 14',
    option_a: 'x = 5',
    option_b: 'x = 7',
    option_c: 'x = 21',
    option_d: 'x = 3',
    correct_option: 'B',
    explanation: '3x = 14 + 7 = 21 => x = 21 / 3 = 7.',
  },
  {
    id: '20000000-0000-0000-0000-000000000016',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000006',
    topic_name: 'Linear Equations in 2 Variables',
    question_text: 'A linear equation in two variables ax + by + c = 0 has:',
    option_a: 'A unique solution',
    option_b: 'Two solutions',
    option_c: 'Infinitely many solutions',
    option_d: 'No solution',
    correct_option: 'C',
    explanation: 'Every point on the line represented by ax + by + c = 0 is a solution.',
  },
  {
    id: '20000000-0000-0000-0000-000000000019',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000007',
    topic_name: 'Lines and Angles',
    question_text: 'Two angles whose sum is 180° are called:',
    option_a: 'Complementary angles',
    option_b: 'Supplementary angles',
    option_c: 'Adjacent angles',
    option_d: 'Vertically opposite angles',
    correct_option: 'B',
    explanation: 'Supplementary angles sum to exactly 180 degrees.',
  },
  {
    id: '20000000-0000-0000-0000-000000000022',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000008',
    topic_name: 'Triangles & Congruence',
    question_text: 'Which of the following is NOT a criterion for congruence of triangles?',
    option_a: 'SAS',
    option_b: 'ASA',
    option_c: 'AAA',
    option_d: 'SSS',
    correct_option: 'C',
    explanation: 'AAA proves similarity, not congruence.',
  },
  {
    id: '20000000-0000-0000-0000-000000000028',
    subject: 'Mathematics',
    level: 1,
    marks: 1,
    topic_id: '10000000-0000-0000-0000-000000000010',
    topic_name: 'Coordinate Geometry',
    question_text: 'The coordinates of the origin are:',
    option_a: '(0, 1)',
    option_b: '(1, 0)',
    option_c: '(0, 0)',
    option_d: '(1, 1)',
    correct_option: 'C',
    explanation: 'The origin is the intersection of x-axis and y-axis: (0, 0).',
  },
];

export const DIAGNOSTIC_QUESTIONS = AUTHORITATIVE_QUESTIONS;

/**
 * 1. GET /api/quiz/diagnostic
 * Fetch diagnostic questions (sanitized without correct answers or explanations)
 */
router.get('/diagnostic', async (req, res) => {
  try {
    const sanitized = AUTHORITATIVE_QUESTIONS.map(({ correct_option, explanation, ...rest }) => rest);
    res.json({ status: 'ok', questions: sanitized });
  } catch (err) {
    res.status(500).json({ error: 'QuizFetchError', message: err.message });
  }
});

/**
 * 2. POST /api/quiz/submit
 * Server evaluates submitted answers against saved answer key:
 * - Level 1 = 1 mark, Level 2 = 2 marks, Level 3 = 3 marks
 * - Wrong or skipped = 0 marks. No negative marking.
 * - Confidence rating does NOT change marks; only used for prerequisite diagnosis.
 * - Saves attempt in ONE safe database step with duplicate submission prevention.
 * - Automatically creates the student_report.
 * - Returns only the student's marks, percentage, weak topics, class rank, and school rank.
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      attemptId,
      studentId = '00000000-0000-0000-0000-000000000001',
      studentName,
      studentEmail,
      className,
      subject = 'Mathematics',
      answers = [],
    } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'No answers submitted.' });
    }

    let marksEarned = 0;
    let marksPossible = 0;
    const evaluatedAnswers = [];

    // Evaluate each answer against server-authoritative key
    for (const userAns of answers) {
      const q = AUTHORITATIVE_QUESTIONS.find((item) => item.id === userAns.questionId);
      if (!q) continue;

      const questionLevel = q.level || 1;
      const questionMarks = q.marks || questionLevel; // Level 1 = 1, Level 2 = 2, Level 3 = 3
      marksPossible += questionMarks;

      const selectedOption = userAns.selectedOption ? String(userAns.selectedOption).trim().toUpperCase() : null;
      const confidence = userAns.confidence || 'not_sure'; // 'sure' | 'not_sure' | 'guessing'
      const isCorrect = selectedOption === q.correct_option;

      if (isCorrect) {
        marksEarned += questionMarks;
      }

      evaluatedAnswers.push({
        questionId: q.id,
        topicId: q.topic_id,
        topicName: q.topic_name,
        subject: q.subject,
        level: questionLevel,
        marksPossible: questionMarks,
        marksEarned: isCorrect ? questionMarks : 0,
        selectedOption,
        correctOption: q.correct_option,
        isCorrect,
        confidence,
        explanation: q.explanation,
      });
    }

    const percentage =
      marksPossible > 0 ? Number(((marksEarned / marksPossible) * 100).toFixed(1)) : 0;

    // Determine level achieved based on server evaluation
    const levelAchieved =
      percentage >= 75
        ? 'Level 3: Advanced Mastery'
        : percentage >= 50
        ? 'Level 2: Intermediate Progress'
        : 'Level 1: Foundational Review';

    // Run prerequisite gap finder for cognitive diagnosis
    const gapAnalysis = findLearningGaps(
      evaluatedAnswers,
      MOCK_PREREQUISITES_GRAPH,
      MOCK_TOPICS
    );

    const weakTopics = (gapAnalysis.learningGaps || []).map((gap) => ({
      topicId: gap.topicId,
      topicName: gap.topicName,
      accuracyPercentage: gap.accuracyPercentage,
      rootPrerequisite: gap.rootPrerequisite,
      evidence: gap.evidence,
    }));

    // Safe Atomic Persistence & Duplicate Attempt Check
    let saveResult;
    try {
      saveResult = await saveAttemptAndReport({
        attemptId,
        studentId,
        studentName,
        studentEmail,
        className,
        subject,
        marksEarned,
        marksPossible,
        percentage,
        levelAchieved,
        weakTopics,
        evaluatedAnswers,
      });
    } catch (saveErr) {
      if (saveErr.code === 'DUPLICATE_SUBMISSION') {
        return res.status(409).json({
          error: 'DuplicateSubmission',
          message: 'This quiz attempt has already been submitted and graded.',
        });
      }
      throw saveErr;
    }

    const { report, rankSnapshot } = saveResult;

    // Log diagnostic report submission to central activity log
    logActivity(
      { id: studentId, email: studentEmail, role: 'student' },
      'report_submitted',
      'student_report',
      report.id,
      { studentName, className, percentage, marksEarned, marksPossible }
    );

    // Return student-facing result (Never show other students' names or scores)
    res.json({
      status: 'ok',
      reportId: report.id,
      attemptId: report.attempt_id,
      marks_earned: marksEarned,
      marks_possible: marksPossible,
      score: marksEarned,
      total_score: marksPossible,
      percentage,
      level_achieved: levelAchieved,
      class_rank: rankSnapshot.class_rank,
      class_total_students: rankSnapshot.class_total_students,
      school_rank: rankSnapshot.school_rank,
      school_total_students: rankSnapshot.school_total_students,
      class_name: rankSnapshot.class_name,
      weak_topics: weakTopics,
      topicStats: Object.values(gapAnalysis.topicStats || {}),
      evaluatedAnswers,
      submittedAt: report.created_at,
    });
  } catch (err) {
    console.error('Quiz Evaluation Error:', err);
    res.status(500).json({ error: 'QuizEvaluationError', message: err.message });
  }
});

function getRequester(req) {
  const role = req.headers['x-user-role'] || req.query.role || req.headers['role'] || 'student';
  const id = req.headers['x-user-id'] || req.query.userId || req.headers['user-id'];
  const email = req.headers['x-user-email'] || req.query.email || req.headers['user-email'];
  return { role: String(role).toLowerCase(), id, email: email ? String(email).toLowerCase() : '' };
}

/**
 * 3. GET /api/quiz/ranks/student/:studentId
 * Role-isolated:
 * - Student can ONLY view their own rank.
 * - Parent can view only their linked children.
 * - Teacher can view only students in their assigned class.
 * - Admin can view any student.
 * Never returns other students' names or scores.
 */
router.get('/ranks/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const requester = getRequester(req);
    const users = getAllUsers();
    const targetStudent = users.find(
      (u) => u.id === studentId || u.email?.toLowerCase() === studentId.toLowerCase()
    );

    if (!targetStudent) {
      return res.status(404).json({ error: 'NotFound', message: 'Student not found.' });
    }

    // Role-based Access Control checks
    if (requester.role === 'student') {
      if (
        (requester.id && requester.id !== targetStudent.id) ||
        (requester.email && requester.email !== targetStudent.email.toLowerCase())
      ) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Students are strictly prohibited from viewing other students\' ranks or scores.',
        });
      }
    } else if (requester.role === 'parent') {
      const parentUser = users.find(
        (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
      );
      const linkedChildNames = (parentUser?.linkedChild || '').toLowerCase();
      const isLinked =
        linkedChildNames.includes(targetStudent.name.toLowerCase()) ||
        parentUser?.linked_student_id === targetStudent.id;
      if (!isLinked) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Parents can only view ranks for their linked children.',
        });
      }
    } else if (requester.role === 'teacher') {
      const teacherUser = users.find(
        (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
      );
      const teacherClasses = (teacherUser?.className || '').toLowerCase();
      const studentClass = (targetStudent.className || '').toLowerCase();
      const canAccess = teacherClasses.includes(studentClass) || teacherClasses.includes('all');
      if (!canAccess) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Teachers can only view students in their assigned classes (${teacherUser?.className || 'None'}).`,
        });
      }
    }

    const rankSnapshot = getStudentRankSnapshot(targetStudent.id);

    // Return ONLY student's own rank data
    res.json({
      status: 'ok',
      student_id: targetStudent.id,
      student_name: targetStudent.name,
      class_name: targetStudent.className,
      rank: rankSnapshot,
    });
  } catch (err) {
    res.status(500).json({ error: 'RankingError', message: err.message });
  }
});

/**
 * 4. GET /api/quiz/ranks/class/:className
 * Teachers and Admin view class leaderboard. Students are forbidden.
 */
router.get('/ranks/class/:className', (req, res) => {
  try {
    const { className } = req.params;
    const requester = getRequester(req);
    const users = getAllUsers();

    if (requester.role === 'student') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Students are not permitted to view class leaderboards.',
      });
    }

    if (requester.role === 'teacher') {
      const teacherUser = users.find(
        (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
      );
      const teacherClasses = (teacherUser?.className || '').toLowerCase();
      if (!teacherClasses.includes(className.toLowerCase())) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access Denied: You are not assigned to teach class ${className}.`,
        });
      }
    }

    const includeDemo = req.query.include_demo === 'true';
    const rankings = computeStudentRankings(includeDemo);
    const classLeaderboard = rankings.classGroups[className] || [];

    res.json({
      status: 'ok',
      class_name: className,
      total_students: classLeaderboard.length,
      students: classLeaderboard.map((st) => ({
        student_id: st.student_id,
        student_name: st.student_name,
        overall_percentage: st.overall_percentage,
        total_marks_earned: st.total_marks_earned,
        total_marks_possible: st.total_marks_possible,
        class_rank: st.class_rank,
        school_rank: st.school_rank,
        attempts_count: st.attempts_count,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'ClassRankingError', message: err.message });
  }
});

/**
 * 5. GET /api/quiz/ranks/school/leaderboard
 * School-wide rankings (competition ties shared). Restricted to Admin and Teachers.
 */
router.get('/ranks/school/leaderboard', (req, res) => {
  try {
    const requester = getRequester(req);

    if (requester.role === 'student' || requester.role === 'parent') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access to school-wide leaderboard is restricted to administrative and teaching staff.',
      });
    }

    const includeDemo = req.query.include_demo === 'true';
    const rankings = computeStudentRankings(includeDemo);

    res.json({
      status: 'ok',
      totalRankedSchool: rankings.totalSchoolRanked,
      students: rankings.rankedStudents,
    });
  } catch (err) {
    res.status(500).json({ error: 'SchoolRankingError', message: err.message });
  }
});

/**
 * Backwards compatible alias: GET /api/quiz/ranks/:studentId
 */
router.get('/ranks/:studentId', (req, res) => {
  const { studentId } = req.params;
  const rankSnapshot = getStudentRankSnapshot(studentId);
  res.json({ status: 'ok', rank: rankSnapshot });
});

export default router;
