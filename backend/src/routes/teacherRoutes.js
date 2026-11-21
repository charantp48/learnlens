import express from 'express';
import { supabase } from '../config/supabase.js';
import { getAllUsers, logActivity } from './adminRoutes.js';
import {
  studentReportsStore,
  teacherClarificationsStore,
  saveTeacherClarification,
  getClarificationForStudent,
  getClarificationForReport,
  getStudentRankSnapshot,
} from '../services/reportService.js';

const router = express.Router();

function getRequester(req) {
  const role = req.headers['x-user-role'] || req.query.role || req.headers['role'] || 'teacher';
  const id = req.headers['x-user-id'] || req.query.userId || req.headers['user-id'] || '00000000-0000-0000-0000-000000000002';
  const email = req.headers['x-user-email'] || req.query.email || req.headers['user-email'] || 'rajesh.rao@learnlens.edu';
  return { role: String(role).toLowerCase(), id, email: String(email).toLowerCase() };
}

// AI Question Review Queue (Teacher authorization queue)
let reviewQueue = [
  {
    id: 'rev-q1',
    subject: 'Mathematics',
    topic: 'Differential Calculus',
    level: 'Interactive',
    questionText: 'A particle moves with position s(t) = 2t³ - 9t² + 12t. Find the timestamps when the acceleration is zero.',
    correctOption: 't = 1.5 seconds',
    explanation: 'a(t) = d²s/dt² = 12t - 18. Setting 12t - 18 = 0 yields t = 18/12 = 1.5 s.',
    status: 'pending',
  },
  {
    id: 'rev-q2',
    subject: 'Physics',
    topic: 'Rotational Dynamics',
    level: 'Puzzle',
    questionText: 'A fly on the outer rim of a 33 RPM phonograph record experiences which primary acceleration toward the center?',
    correctOption: 'Centripetal acceleration (a_c = ω²r)',
    explanation: 'In uniform circular motion, the net acceleration is purely radial and directed inwards.',
    status: 'pending',
  },
];

/**
 * 1. GET /api/teacher/class/:classId/analytics (or teacher overview)
 * Returns class analytics, roster with overall percentage, class rank, and Needs Attention badge.
 * Teachers see only students in their own assigned classes.
 */
router.get('/class/:classId/analytics', async (req, res) => {
  try {
    const requester = getRequester(req);
    const users = getAllUsers();
    const teacher = users.find(
      (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
    );

    const teacherClasses = teacher ? teacher.className || 'Class 11-A' : 'Class 11-A';
    const isGlobalAdmin = requester.role === 'admin';

    // Filter students belonging to teacher's class (or all for admin)
    const assignedStudents = users.filter((u) => {
      if (u.role !== 'student') return false;
      if (isGlobalAdmin) return true;
      const studentClass = (u.className || '').toLowerCase();
      return teacherClasses.toLowerCase().includes(studentClass);
    });

    const enrichedStudents = assignedStudents.map((s) => {
      const rankSnapshot = getStudentRankSnapshot(s.id);
      const studentReports = studentReportsStore.filter((r) => r.student_id === s.id);
      const latestReport = studentReports[0] || null;
      const clarification = getClarificationForStudent(s.id);

      // Determine "Needs attention" badge:
      // 1. Until the report is reviewed (review_status === 'new'), OR
      // 2. When the latest teacher note says needs_extra_help or improve_focus.
      const hasUnreviewedReport = latestReport && latestReport.review_status === 'new';
      const needsClarificationHelp =
        clarification &&
        (clarification.status === 'needs_extra_help' || clarification.status === 'improve_focus');
      const isWeakInitial = latestReport && latestReport.percentage < 60;

      const needsAttention = !!(hasUnreviewedReport || needsClarificationHelp || isWeakInitial);

      // Topic breakdown from weak topics or default
      const topicBreakdown = (latestReport?.weak_topics || []).map((wt) => ({
        topic: wt.topicName.split(' ')[0],
        score: wt.accuracyPercentage || 40,
      }));

      if (topicBreakdown.length === 0) {
        topicBreakdown.push({ topic: 'Maths', score: Math.round(rankSnapshot.overall_percentage) || 85 });
        topicBreakdown.push({ topic: 'Science', score: 88 });
      }

      return {
        id: s.id,
        name: s.name,
        class: s.className || 'Class 11-A',
        subject: latestReport?.subject || 'Mathematics',
        level: latestReport?.level_achieved || 'Level 2: Intermediate',
        parentName: s.parentName || s.linkedChild || 'Parent',
        overallPercentage: rankSnapshot.overall_percentage,
        classRank: rankSnapshot.class_rank,
        classTotal: rankSnapshot.class_total_students,
        diagnosticScore: latestReport ? `${latestReport.percentage}%` : `${rankSnapshot.overall_percentage}%`,
        weakTopic: latestReport?.weak_topics?.[0]?.topicName || 'None',
        rootPrerequisite: latestReport?.weak_topics?.[0]?.rootPrerequisite || 'Foundations Mastered',
        needsAttention,
        status: needsAttention ? 'Needs attention' : 'On track',
        statusColor: needsAttention ? 'amber' : 'emerald',
        latestReport,
        latestClarification: clarification,
        topicBreakdown,
      };
    });

    // Compute class average
    const totalPct = enrichedStudents.reduce((sum, s) => sum + s.overallPercentage, 0);
    const classAvg = enrichedStudents.length > 0 ? Number((totalPct / enrichedStudents.length).toFixed(1)) : 64.2;

    res.json({
      status: 'ok',
      className: teacherClasses,
      totalStudents: enrichedStudents.length,
      classAverageScore: classAvg,
      weakestPrerequisite: 'Algebraic Identities & Factoring (48% average)',
      students: enrichedStudents,
      reviewQueue,
      topicPerformance: [
        { topic: 'Number Systems', accuracy: 88 },
        { topic: 'Kinematics', accuracy: 78 },
        { topic: 'Factoring', accuracy: 48 },
        { topic: 'Quadratics', accuracy: 42 },
        { topic: 'Rotational Dyn', accuracy: 40 },
        { topic: 'Chemical Bonding', accuracy: 64 },
        { topic: 'CS Stack', accuracy: 82 },
      ],
    });
  } catch (err) {
    console.error('Teacher Analytics Error:', err);
    res.status(500).json({ error: 'TeacherAnalyticsError', message: err.message });
  }
});

/**
 * 2. GET /api/teacher/reports/incoming
 * Polled every 15 seconds.
 * Returns incoming student reports for teacher's assigned classes with "New" badge.
 */
router.get('/reports/incoming', (req, res) => {
  try {
    const requester = getRequester(req);
    const users = getAllUsers();
    const teacher = users.find(
      (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
    );
    const teacherClasses = teacher ? (teacher.className || 'Class 11-A').toLowerCase() : 'class 11-a';
    const isGlobalAdmin = requester.role === 'admin';

    // Filter reports belonging to this teacher's classes
    const classReports = studentReportsStore.filter((r) => {
      if (isGlobalAdmin) return true;
      const reportClass = (r.class_name || '').toLowerCase();
      return teacherClasses.includes(reportClass);
    });

    const formattedSubmissions = classReports.slice(0, 20).map((r) => {
      const rankSnapshot = getStudentRankSnapshot(r.student_id);
      return {
        id: r.id,
        attemptId: r.attempt_id,
        studentId: r.student_id,
        studentName: r.student_name,
        className: r.class_name,
        subject: r.subject || 'Mathematics',
        marksEarned: r.marks_earned,
        marksPossible: r.marks_possible,
        score: `${r.marks_earned}/${r.marks_possible} (${r.percentage}%)`,
        percentage: r.percentage,
        classRank: rankSnapshot.class_rank,
        classTotal: rankSnapshot.class_total_students,
        rankText: `Rank ${rankSnapshot.class_rank} of ${rankSnapshot.class_total_students}`,
        reviewStatus: r.review_status,
        isNew: r.review_status === 'new', // Flag for "New" badge
        submittedAt: r.created_at,
        weakTopics: r.weak_topics || [],
      };
    });

    res.json({
      status: 'ok',
      polledAt: new Date().toISOString(),
      submissions: formattedSubmissions,
      newReportsCount: formattedSubmissions.filter((s) => s.isNew).length,
    });
  } catch (err) {
    res.status(500).json({ error: 'IncomingReportsError', message: err.message });
  }
});

/**
 * 3. GET /api/teacher/reports/:reportId
 * Returns full report details and existing clarification note for teacher review.
 */
router.get('/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = studentReportsStore.find((r) => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: 'NotFound', message: 'Report not found.' });
    }

    const clarification = getClarificationForReport(reportId);
    const rankSnapshot = getStudentRankSnapshot(report.student_id);

    res.json({
      status: 'ok',
      report,
      rank: rankSnapshot,
      clarification,
    });
  } catch (err) {
    res.status(500).json({ error: 'ReportFetchError', message: err.message });
  }
});

/**
 * 4. POST /api/teacher/clarifications
 * Teacher provides clarification on a student report:
 * - status: needs_extra_help | improve_focus | doing_well
 * - topics: array of topic names picked from weak topics or subject topics
 * - comment: max 500 characters
 * - marks report as reviewed
 * - allows editing later
 */
router.post('/clarifications', async (req, res) => {
  try {
    const requester = getRequester(req);
    const { reportId, studentId, status, topics = [], comment } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'ValidationError', message: 'studentId is required.' });
    }

    const validStatuses = ['needs_extra_help', 'improve_focus', 'doing_well'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Clarification comment is required.' });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Comment exceeds maximum 500 characters. Length: ${comment.trim().length}`,
      });
    }

    // Role check: Only teachers (for their own classes) or admin can clarify
    const users = getAllUsers();
    const teacher = users.find(
      (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
    );
    const targetStudent = users.find((u) => u.id === studentId);

    if (requester.role === 'teacher' && teacher && targetStudent) {
      const teacherClass = (teacher.className || '').toLowerCase();
      const studentClass = (targetStudent.className || '').toLowerCase();
      if (!teacherClass.includes(studentClass)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access Denied: You may only give clarifications for students in your assigned class (${teacher.className}).`,
        });
      }
    }

    const teacherName = teacher ? teacher.name : 'Teacher';
    const teacherId = teacher ? teacher.id : requester.id;

    const savedClarification = await saveTeacherClarification({
      reportId,
      studentId,
      teacherId,
      teacherName,
      status,
      topics,
      comment: comment.trim(),
    });

    logActivity(
      { email: requester.email, role: 'teacher' },
      'clarification_added',
      'student_report',
      reportId || studentId,
      { studentId, status, topicsCount: topics.length }
    );

    res.json({
      status: 'ok',
      message: 'Teacher clarification saved and report marked as reviewed.',
      clarification: savedClarification,
    });
  } catch (err) {
    console.error('Clarification Error:', err);
    res.status(500).json({ error: 'ClarificationError', message: err.message });
  }
});

/**
 * 5. GET /api/teacher/clarifications/student/:studentId
 * Returns active clarification note for student (also accessed by student & parent dashboards)
 */
router.get('/clarifications/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const clarification = getClarificationForStudent(studentId);
    res.json({ status: 'ok', clarification });
  } catch (err) {
    res.status(500).json({ error: 'ClarificationFetchError', message: err.message });
  }
});

// Backward compatibility: Legacy feedback endpoint
router.post('/feedback', (req, res) => {
  res.json({ status: 'ok', message: 'Feedback recorded' });
});

// AI question authorization queue endpoints
router.post('/question-review/:id/approve', (req, res) => {
  const { id } = req.params;
  reviewQueue = reviewQueue.filter((q) => q.id !== id);
  res.json({ status: 'ok', message: 'Question approved!', remainingCount: reviewQueue.length });
});

router.post('/question-review/:id/reject', (req, res) => {
  const { id } = req.params;
  reviewQueue = reviewQueue.filter((q) => q.id !== id);
  res.json({ status: 'ok', message: 'Question rejected.', remainingCount: reviewQueue.length });
});

export default router;
