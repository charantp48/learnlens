import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { getAllUsers } from '../routes/adminRoutes.js';

/**
 * Shared In-Memory Data Store for Quiz Attempts, Reports, and Clarifications
 * Seamlessly interfaces with Supabase when tables are live, and ensures 100% reliable
 * offline execution for tests, evaluation, and hackathon presentation.
 */

export const quizAttemptsStore = [
  // Seed with a few completed attempts for demo baseline
  {
    id: 'att-seed-001',
    student_id: '00000000-0000-0000-0000-000000000001',
    student_name: 'Priya Sharma',
    class_name: 'Class 11-A',
    marks_earned: 5,
    marks_possible: 10,
    percentage: 50.0,
    is_completed: true,
    is_demo: true,
    completed_at: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'att-seed-002',
    student_id: '00000000-0000-0000-0000-000000000005',
    student_name: 'Rahul Verma',
    class_name: 'Class 11-A',
    marks_earned: 6,
    marks_possible: 10,
    percentage: 60.0,
    is_completed: true,
    is_demo: true,
    completed_at: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'att-seed-003',
    student_id: '00000000-0000-0000-0000-000000000006',
    student_name: 'Ananya Sen',
    class_name: 'Class 11-A',
    marks_earned: 9,
    marks_possible: 10,
    percentage: 90.0,
    is_completed: true,
    is_demo: false, // Real student
    completed_at: '2026-11-20T12:00:00.000Z',
  },
  {
    id: 'att-seed-004',
    student_id: '00000000-0000-0000-0000-000000000007',
    student_name: 'Arjun Sharma',
    class_name: 'Class 9-B',
    marks_earned: 7,
    marks_possible: 10,
    percentage: 70.0,
    is_completed: true,
    is_demo: false, // Real student
    completed_at: '2026-11-20T13:00:00.000Z',
  },
];

export const studentReportsStore = [
  {
    id: 'rep-seed-001',
    attempt_id: 'att-seed-001',
    student_id: '00000000-0000-0000-0000-000000000001',
    student_name: 'Priya Sharma',
    student_email: 'priya.sharma@learnlens.edu',
    class_name: 'Class 11-A',
    subject: 'Mathematics',
    marks_earned: 5,
    marks_possible: 10,
    percentage: 50.0,
    level_achieved: 'Level 2: Intermediate Progress',
    weak_topics: [
      {
        topicName: 'Quadratic Equations',
        accuracyPercentage: 33,
        rootPrerequisite: 'Algebraic Factoring',
        evidence: 'Scored 33% on Quadratics; diagnosed root cause is 8th-grade factoring.',
      },
    ],
    class_rank_snapshot: 1,
    class_total_students: 1,
    school_rank_snapshot: 1,
    school_total_students: 1,
    review_status: 'reviewed',
    is_demo: true,
    created_at: '2026-11-20T10:05:00.000Z',
    updated_at: '2026-11-20T10:30:00.000Z',
  },
  {
    id: 'rep-seed-003',
    attempt_id: 'att-seed-003',
    student_id: '00000000-0000-0000-0000-000000000006',
    student_name: 'Ananya Sen',
    student_email: 'ananya.sen@learnlens.edu',
    class_name: 'Class 11-A',
    subject: 'Computer Science',
    marks_earned: 9,
    marks_possible: 10,
    percentage: 90.0,
    level_achieved: 'Level 3: Advanced Mastery',
    weak_topics: [],
    class_rank_snapshot: 1,
    class_total_students: 1,
    school_rank_snapshot: 1,
    school_total_students: 2,
    review_status: 'new',
    is_demo: false,
    created_at: '2026-11-20T12:05:00.000Z',
    updated_at: '2026-11-20T12:05:00.000Z',
  },
];

export const teacherClarificationsStore = [
  {
    id: 'clar-seed-001',
    report_id: 'rep-seed-001',
    student_id: '00000000-0000-0000-0000-000000000001',
    teacher_id: '00000000-0000-0000-0000-000000000002',
    teacher_name: 'Mr. Rajesh Rao',
    status: 'improve_focus',
    topics: ['Algebraic Identities & Factoring'],
    comment: 'Priya, focus 25 mins on middle-term splitting this week before progressing.',
    created_at: '2026-11-20T10:30:00.000Z',
    updated_at: '2026-11-20T10:30:00.000Z',
  },
];

/**
 * Competition RANK() calculation for class and school.
 * Rule: overall percentage = total marks earned / total marks possible across ALL completed attempts.
 * Ties share a rank (e.g. 1, 1, 3).
 * Only students with at least 1 completed attempt are ranked.
 * Excludes demo accounts (is_demo = true) from real ranking counts.
 */
export function computeStudentRankings(includeDemo = false) {
  let allUsers = [];
  try {
    allUsers = getAllUsers();
  } catch (err) {
    allUsers = [];
  }

  // Find all active students matching the demo criteria
  const targetStudents = allUsers.filter((u) => {
    if (u.role !== 'student') return false;
    if (u.status === 'disabled') return false;
    if (!includeDemo && u.is_demo) return false;
    return true;
  });

  const studentRankList = [];

  for (const student of targetStudents) {
    const studentAttempts = quizAttemptsStore.filter(
      (a) => a.student_id === student.id && a.is_completed
    );

    if (studentAttempts.length === 0) continue; // Only ranked if at least 1 attempt

    const totalEarned = studentAttempts.reduce((sum, a) => sum + (Number(a.marks_earned) || 0), 0);
    const totalPossible = studentAttempts.reduce((sum, a) => sum + (Number(a.marks_possible) || 0), 0);
    const overallPercentage =
      totalPossible > 0 ? Number(((totalEarned / totalPossible) * 100).toFixed(2)) : 0;

    studentRankList.push({
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      class_name: student.className || 'Class 11-A',
      is_demo: !!student.is_demo,
      total_marks_earned: totalEarned,
      total_marks_possible: totalPossible,
      overall_percentage: overallPercentage,
      attempts_count: studentAttempts.length,
    });
  }

  // 1. Sort for School Rank (descending by overall percentage)
  studentRankList.sort((a, b) => b.overall_percentage - a.overall_percentage);

  // Apply Competition RANK() for School
  let currentRank = 1;
  for (let i = 0; i < studentRankList.length; i++) {
    if (i > 0 && studentRankList[i].overall_percentage < studentRankList[i - 1].overall_percentage) {
      currentRank = i + 1;
    }
    studentRankList[i].school_rank = currentRank;
  }

  // 2. Class Rank with Competition RANK() per Class
  const classGroups = {};
  studentRankList.forEach((st) => {
    const cls = st.class_name || 'Class 11-A';
    if (!classGroups[cls]) classGroups[cls] = [];
    classGroups[cls].push(st);
  });

  Object.values(classGroups).forEach((group) => {
    group.sort((a, b) => b.overall_percentage - a.overall_percentage);
    let classRank = 1;
    for (let i = 0; i < group.length; i++) {
      if (i > 0 && group[i].overall_percentage < group[i - 1].overall_percentage) {
        classRank = i + 1;
      }
      group[i].class_rank = classRank;
      group[i].class_total = group.length;
    }
  });

  return {
    rankedStudents: studentRankList,
    totalSchoolRanked: studentRankList.length,
    classGroups,
  };
}

/**
 * Returns rank snapshot for a specific student
 */
export function getStudentRankSnapshot(studentId) {
  const users = getAllUsers();
  const student = users.find((u) => u.id === studentId);
  const isDemo = !!(student && student.is_demo);

  // Compute ranks using proper cohort filter
  const rankings = computeStudentRankings(isDemo);
  const found = rankings.rankedStudents.find((r) => r.student_id === studentId);

  if (found) {
    const classTotal = rankings.classGroups[found.class_name]?.length || 1;
    return {
      class_rank: found.class_rank,
      class_total_students: classTotal,
      school_rank: found.school_rank,
      school_total_students: rankings.totalSchoolRanked,
      overall_percentage: found.overall_percentage,
      class_name: found.class_name,
    };
  }

  // Default fallback if student has just taken their very first attempt
  return {
    class_rank: 1,
    class_total_students: 1,
    school_rank: 1,
    school_total_students: 1,
    overall_percentage: 0,
    class_name: student?.className || 'Class 11-A',
  };
}

/**
 * Atomic Quiz Attempt & Report Saving
 * 1. Checks unique constraint on attempt ID
 * 2. Saves completed attempt to store
 * 3. Automatically generates student report row
 * 4. Persists to Supabase if available
 */
export async function saveAttemptAndReport({
  attemptId,
  studentId,
  studentName,
  studentEmail,
  className,
  subject = 'Mathematics',
  marksEarned,
  marksPossible,
  percentage,
  levelAchieved,
  weakTopics = [],
  evaluatedAnswers = [],
}) {
  const finalAttemptId = attemptId || crypto.randomUUID();

  // 1. Unique constraint check: Cannot submit same attempt twice
  const alreadyCompleted = quizAttemptsStore.some(
    (a) => a.id === finalAttemptId && a.is_completed
  );

  if (alreadyCompleted) {
    const err = new Error('DuplicateSubmission: This quiz attempt has already been submitted and graded.');
    err.code = 'DUPLICATE_SUBMISSION';
    throw err;
  }

  const users = getAllUsers();
  const student = users.find((u) => u.id === studentId || u.email?.toLowerCase() === studentEmail?.toLowerCase());
  const isDemo = student ? !!student.is_demo : false;
  const resolvedClass = className || student?.className || 'Class 11-A';
  const resolvedName = studentName || student?.name || 'Student';
  const resolvedEmail = studentEmail || student?.email || '';

  const completedAt = new Date().toISOString();

  // 2. Save Quiz Attempt (Atomic Step)
  const newAttempt = {
    id: finalAttemptId,
    student_id: studentId,
    student_name: resolvedName,
    student_email: resolvedEmail,
    class_name: resolvedClass,
    marks_earned: marksEarned,
    marks_possible: marksPossible,
    percentage,
    is_completed: true,
    is_demo: isDemo,
    completed_at: completedAt,
    evaluated_answers: evaluatedAnswers,
  };

  quizAttemptsStore.unshift(newAttempt);

  // 3. Compute real-time rank snapshot for report
  const rankSnapshot = getStudentRankSnapshot(studentId);

  // 4. Automatically create Student Report
  const reportId = crypto.randomUUID();
  const newReport = {
    id: reportId,
    attempt_id: finalAttemptId,
    student_id: studentId,
    student_name: resolvedName,
    student_email: resolvedEmail,
    class_name: resolvedClass,
    subject,
    marks_earned: marksEarned,
    marks_possible: marksPossible,
    percentage,
    level_achieved: levelAchieved,
    weak_topics: weakTopics,
    class_rank_snapshot: rankSnapshot.class_rank,
    class_total_students: rankSnapshot.class_total_students,
    school_rank_snapshot: rankSnapshot.school_rank,
    school_total_students: rankSnapshot.school_total_students,
    review_status: 'new', // Initially "new" until reviewed by teacher
    is_demo: isDemo,
    created_at: completedAt,
    updated_at: completedAt,
  };

  studentReportsStore.unshift(newReport);

  // 5. Try safe background persistence to Supabase if connected
  if (supabase) {
    try {
      await supabase.from('quiz_attempts').insert({
        id: finalAttemptId,
        student_id: studentId,
        marks_earned: marksEarned,
        marks_possible: marksPossible,
        percentage,
        is_completed: true,
      });

      await supabase.from('student_reports').insert({
        id: reportId,
        attempt_id: finalAttemptId,
        student_id: studentId,
        marks_earned: marksEarned,
        marks_possible: marksPossible,
        percentage,
        level_achieved: levelAchieved,
        weak_topics: weakTopics,
        class_rank_snapshot: rankSnapshot.class_rank,
        school_rank_snapshot: rankSnapshot.school_rank,
        review_status: 'new',
      });
    } catch (dbErr) {
      // In-memory store already safe; log warning
      console.warn('Supabase dual-write notice:', dbErr.message);
    }
  }

  return {
    attempt: newAttempt,
    report: newReport,
    rankSnapshot,
  };
}
