import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Class 9-A In-memory feedback store
const feedbackStore = [
  {
    id: 'fb-1',
    teacherId: '00000000-0000-0000-0000-000000000002',
    studentId: '00000000-0000-0000-0000-000000000001',
    studentName: 'Priya Sharma',
    topicName: 'Algebraic Identities & Factoring',
    message: 'Priya, you have strong geometric intuition, but quadratic equations will keep feeling difficult until we firm up polynomial factoring. Spend 25 minutes on middle-term splitting identities this week.',
    feedbackType: 'revision_focus',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Class 9-A In-memory quiz assignments
const assignedQuizzes = [
  {
    id: 'asg-1',
    title: 'Mid-Term Diagnostic Quiz (Class 9 Maths)',
    classId: 'c0000000-0000-0000-0000-000000000001',
    dueDate: '2026-11-28',
    assignedBy: 'Mr. Rajesh Rao',
    totalQuestions: 10,
    status: 'active',
  },
];

// 1. GET /api/teacher/class/:classId/analytics
router.get('/class/:classId/analytics', async (req, res) => {
  try {
    const { classId } = req.params;

    // Topic Performance Distribution across Class 9-A
    const topicPerformance = [
      { topic: 'Number Systems', accuracy: 88, isWeak: false },
      { topic: 'Real Numbers', accuracy: 76, isWeak: false },
      { topic: 'Algebraic Factoring', accuracy: 48, isWeak: true }, // Prerequisite bottleneck!
      { topic: 'Quadratic Equations', accuracy: 42, isWeak: true }, // Weak topic
      { topic: 'Linear Eq (1 Var)', accuracy: 85, isWeak: false },
      { topic: 'Linear Eq (2 Var)', accuracy: 64, isWeak: false },
      { topic: 'Lines & Angles', accuracy: 82, isWeak: false },
      { topic: 'Triangles', accuracy: 70, isWeak: false },
      { topic: 'Quadrilaterals', accuracy: 60, isWeak: false },
      { topic: 'Coordinate Geometry', accuracy: 92, isWeak: false },
    ];

    // Students enrolled in Class 9-A
    const students = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Priya Sharma',
        diagnosticScore: '50%',
        weakTopic: 'Quadratic Equations (33%)',
        rootPrerequisite: 'Algebraic Identities & Factoring (45%)',
        status: 'Needs Support',
        statusColor: 'amber',
        lastActive: 'Today',
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Rahul Verma',
        diagnosticScore: '55%',
        weakTopic: 'Quadratic Equations (40%)',
        rootPrerequisite: 'Algebraic Identities & Factoring (50%)',
        status: 'Needs Support',
        statusColor: 'amber',
        lastActive: 'Yesterday',
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        name: 'Ananya Sen',
        diagnosticScore: '82%',
        weakTopic: 'None',
        rootPrerequisite: 'Foundations Mastered',
        status: 'On Track',
        statusColor: 'emerald',
        lastActive: '2 days ago',
      },
    ];

    res.json({
      status: 'ok',
      classId,
      className: 'Class 9-A (Mathematics)',
      academicYear: '2026',
      totalStudents: 3,
      classAverageScore: 62.3,
      weakestPrerequisite: 'Algebraic Identities & Factoring (48% average)',
      topicPerformance,
      students,
      recentFeedback: feedbackStore,
      assignedQuizzes,
    });
  } catch (err) {
    console.error('Teacher analytics error:', err);
    res.status(500).json({ error: 'AnalyticsError', message: err.message });
  }
});

// 2. POST /api/teacher/feedback - Leave feedback on a student
router.post('/feedback', async (req, res) => {
  try {
    const { studentId, studentName, teacherId, topicName, message, feedbackType = 'revision_focus' } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ error: 'MissingParameters', message: 'studentId and message are required' });
    }

    const newFeedback = {
      id: `fb-${Date.now()}`,
      teacherId: teacherId || '00000000-0000-0000-0000-000000000002',
      studentId,
      studentName: studentName || 'Student',
      topicName: topicName || 'Algebraic Identities & Factoring',
      message,
      feedbackType,
      createdAt: new Date().toISOString(),
    };

    feedbackStore.unshift(newFeedback);

    // Save to Supabase if available
    if (supabase) {
      try {
        await supabase.from('feedback').insert({
          teacher_id: newFeedback.teacherId,
          student_id: newFeedback.studentId,
          message: newFeedback.message,
          feedback_type: newFeedback.feedbackType,
        });
      } catch (e) {
        console.warn('Could not persist feedback to Supabase, stored in memory');
      }
    }

    res.json({
      status: 'ok',
      message: 'Feedback delivered successfully to student and parent.',
      feedback: newFeedback,
    });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'FeedbackError', message: err.message });
  }
});

// 3. POST /api/teacher/assign-quiz - Assign a diagnostic quiz
router.post('/assign-quiz', (req, res) => {
  try {
    const { title, classId, dueDate, topicId } = req.body;
    const newAssignment = {
      id: `asg-${Date.now()}`,
      title: title || 'Targeted Prerequisite Review Quiz',
      classId: classId || 'c0000000-0000-0000-0000-000000000001',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignedBy: 'Mr. Rajesh Rao',
      totalQuestions: 10,
      status: 'active',
    };

    assignedQuizzes.unshift(newAssignment);
    res.json({ status: 'ok', message: 'Quiz successfully assigned to Class 9-A', assignment: newAssignment });
  } catch (err) {
    res.status(500).json({ error: 'AssignQuizError', message: err.message });
  }
});

export default router;
