import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// In-memory feedback store
const feedbackStore = [
  {
    id: 'fb-1',
    teacherId: '00000000-0000-0000-0000-000000000002',
    studentId: '00000000-0000-0000-0000-000000000001',
    studentName: 'Priya Sharma',
    topicName: 'Algebraic Identities & Factoring',
    message: 'Priya, spend 25 minutes on middle-term splitting identities this week to solidify quadratic equations and rotational mechanics.',
    feedbackType: 'revision_focus',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Live Incoming Quiz Submissions (Simulated live feed for 15s polling)
const incomingSubmissions = [
  {
    id: 'sub-1',
    studentName: 'Priya Sharma',
    studentId: '00000000-0000-0000-0000-000000000001',
    subject: 'Mathematics',
    score: '5/10 (50%)',
    submittedAt: new Date(Date.now() - 45000).toISOString(),
    confidenceSummary: '3 Sure, 4 Not Sure, 3 Guessing',
  },
  {
    id: 'sub-2',
    studentName: 'Rahul Verma',
    studentId: '00000000-0000-0000-0000-000000000005',
    subject: 'Physics',
    score: '6/10 (60%)',
    submittedAt: new Date(Date.now() - 120000).toISOString(),
    confidenceSummary: '5 Sure, 3 Not Sure, 2 Guessing',
  },
  {
    id: 'sub-3',
    studentName: 'Ananya Sen',
    studentId: '00000000-0000-0000-0000-000000000006',
    subject: 'Computer Science',
    score: '9/10 (90%)',
    submittedAt: new Date(Date.now() - 300000).toISOString(),
    confidenceSummary: '8 Sure, 2 Not Sure, 0 Guessing',
  },
];

// Question Review Queue (AI-generated questions awaiting teacher authorization)
let reviewQueue = [
  {
    id: 'rev-q1',
    subject: 'Mathematics',
    topic: 'Differential Calculus',
    level: 'interactive',
    questionText: 'A particle moves with position s(t) = 2t³ - 9t² + 12t. Find the timestamps when the acceleration is zero.',
    correctOption: 't = 1.5 seconds',
    explanation: 'a(t) = d²s/dt² = 12t - 18. Setting 12t - 18 = 0 yields t = 18/12 = 1.5 s.',
    status: 'pending',
  },
  {
    id: 'rev-q2',
    subject: 'Physics',
    topic: 'Rotational Dynamics',
    level: 'puzzle',
    questionText: 'A fly on the outer rim of a 33 RPM phonograph record experiences which primary acceleration toward the center?',
    correctOption: 'Centripetal acceleration (a_c = ω²r)',
    explanation: 'In uniform circular motion, the net acceleration is purely radial and directed inwards.',
    status: 'pending',
  },
];

// 1. GET /api/teacher/class/:classId/analytics
router.get('/class/:classId/analytics', async (req, res) => {
  try {
    const { classId } = req.params;

    const topicPerformance = [
      { topic: 'Number Systems', accuracy: 88, isWeak: false },
      { topic: 'Kinematics', accuracy: 78, isWeak: false },
      { topic: 'Algebraic Factoring', accuracy: 48, isWeak: true },
      { topic: 'Quadratics', accuracy: 42, isWeak: true },
      { topic: 'Rotational Dynamics', accuracy: 40, isWeak: true },
      { topic: 'Chemical Bonding', accuracy: 64, isWeak: false },
      { topic: 'CS Stack Frames', accuracy: 82, isWeak: false },
    ];

    const students = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Priya Sharma',
        class: 'Class 11-A',
        subject: 'Mathematics',
        level: 'Level 1: Foundational Review',
        parentName: 'Sunita Sharma',
        diagnosticScore: '50%',
        weakTopic: 'Quadratic Equations (33%)',
        rootPrerequisite: 'Algebraic Factoring (45%)',
        status: 'Needs Support',
        statusColor: 'amber',
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Rahul Verma',
        class: 'Class 11-A',
        subject: 'Physics',
        level: 'Level 2: Intermediate',
        parentName: 'Amit Verma',
        diagnosticScore: '55%',
        weakTopic: 'Rotational Dynamics (40%)',
        rootPrerequisite: 'Vector Cross Products (50%)',
        status: 'Needs Support',
        statusColor: 'amber',
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        name: 'Ananya Sen',
        class: 'Class 11-A',
        subject: 'Computer Science',
        level: 'Level 3: Advanced',
        parentName: 'Subhash Sen',
        diagnosticScore: '85%',
        weakTopic: 'None',
        rootPrerequisite: 'Foundations Mastered',
        status: 'On Track',
        statusColor: 'emerald',
      },
      {
        id: '00000000-0000-0000-0000-000000000007',
        name: 'Arjun Sharma',
        class: 'Class 9-B',
        subject: 'Mathematics',
        level: 'Level 2: Intermediate',
        parentName: 'Sunita Sharma',
        diagnosticScore: '72%',
        weakTopic: 'Linear Equations (2 Var)',
        rootPrerequisite: 'Line Intersections',
        status: 'On Track',
        statusColor: 'emerald',
      },
    ];

    res.json({
      status: 'ok',
      classId,
      className: 'Class 11-A (Mathematics & Science)',
      totalStudents: 28,
      classAverageScore: 64.2,
      weakestPrerequisite: 'Algebraic Identities & Factoring (48% average)',
      topicPerformance,
      students,
      recentFeedback: feedbackStore,
      reviewQueue,
      incomingSubmissions,
    });
  } catch (err) {
    res.status(500).json({ error: 'AnalyticsError', message: err.message });
  }
});

// 2. GET /api/teacher/incoming-submissions (For 15s auto-polling)
router.get('/incoming-submissions', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    submissions: incomingSubmissions,
  });
});

// 3. POST /api/teacher/feedback - Leave feedback on a student
router.post('/feedback', async (req, res) => {
  try {
    const { studentId, studentName, teacherId, message, feedbackType = 'revision_focus' } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ error: 'MissingParameters', message: 'studentId and message are required' });
    }

    const newFeedback = {
      id: `fb-${Date.now()}`,
      teacherId: teacherId || '00000000-0000-0000-0000-000000000002',
      studentId,
      studentName: studentName || 'Student',
      message,
      feedbackType,
      createdAt: new Date().toISOString(),
    };

    feedbackStore.unshift(newFeedback);

    res.json({
      status: 'ok',
      message: 'Feedback delivered successfully to student and parent.',
      feedback: newFeedback,
    });
  } catch (err) {
    res.status(500).json({ error: 'FeedbackError', message: err.message });
  }
});

// 4. POST /api/teacher/question-review/:id/approve
router.post('/question-review/:id/approve', (req, res) => {
  const { id } = req.params;
  reviewQueue = reviewQueue.filter((q) => q.id !== id);
  res.json({
    status: 'ok',
    message: 'Question approved! It is now visible in student diagnostic assessments.',
    remainingCount: reviewQueue.length,
  });
});

// 5. POST /api/teacher/question-review/:id/reject
router.post('/question-review/:id/reject', (req, res) => {
  const { id } = req.params;
  reviewQueue = reviewQueue.filter((q) => q.id !== id);
  res.json({
    status: 'ok',
    message: 'Question rejected from active rotation.',
    remainingCount: reviewQueue.length,
  });
});

export default router;
