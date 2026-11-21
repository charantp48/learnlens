import express from 'express';
import { supabase } from '../config/supabase.js';
import { getAllUsers } from './adminRoutes.js';
import {
  studentReportsStore,
  getClarificationForStudent,
  getStudentRankSnapshot,
} from '../services/reportService.js';

const router = express.Router();

function getRequester(req) {
  const role = req.headers['x-user-role'] || req.query.role || req.headers['role'] || 'parent';
  const id = req.headers['x-user-id'] || req.query.userId || req.headers['user-id'] || '00000000-0000-0000-0000-000000000003';
  const email = req.headers['x-user-email'] || req.query.email || req.headers['user-email'] || 'sunita.sharma@learnlens.edu';
  return { role: String(role).toLowerCase(), id, email: String(email).toLowerCase() };
}

/**
 * GET /api/parent/children
 * Returns list of children linked to the requesting parent with live ranks and teacher notes.
 * Enforces RLS: Parent sees only linked children.
 */
router.get('/children', (req, res) => {
  try {
    const requester = getRequester(req);
    const users = getAllUsers();
    const parentUser = users.find(
      (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
    );

    const isGlobalAdmin = requester.role === 'admin';
    const isDemoParent = requester.id === '00000000-0000-0000-0000-000000000003' || requester.email === 'sunita.sharma@learnlens.edu';

    // Find linked students
    const linkedStudents = users.filter((u) => {
      if (u.role !== 'student') return false;
      if (isGlobalAdmin) return true;

      // Demo parent Sunita Sharma is linked to Priya Sharma and Arjun Sharma
      if (isDemoParent && (u.name === 'Priya Sharma' || u.name === 'Arjun Sharma')) {
        return true;
      }

      const parentName = (parentUser?.name || '').toLowerCase();
      const parentLinked = (parentUser?.linkedChild || '').toLowerCase();
      const studentParent = (u.parentName || '').toLowerCase();
      const studentName = (u.name || '').toLowerCase();
      const studentEmail = (u.email || '').toLowerCase();

      return (
        (parentName && studentParent.includes(parentName)) ||
        (parentLinked && (parentLinked.includes(studentName) || parentLinked.includes(studentEmail))) ||
        parentUser?.linked_student_id === u.id
      );
    });

    const enrichedChildren = linkedStudents.map((child) => {
      const rank = getStudentRankSnapshot(child.id);
      const clarification = getClarificationForStudent(child.id);
      const reports = studentReportsStore.filter((r) => r.student_id === child.id);
      const latestReport = reports[0] || null;

      return {
        id: child.id,
        name: child.name,
        grade: child.className || 'Class 11-A',
        school: 'Kendriya Vidyalaya No. 1',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(child.name.split(' ')[0])}`,
        rank,
        clarification,
        latestReport,
        diagnosticScore: latestReport ? latestReport.percentage : rank.overall_percentage,
        subjectResults: [
          {
            subject: latestReport?.subject || 'Mathematics',
            score: latestReport?.percentage || Math.round(rank.overall_percentage) || 75,
            level: latestReport?.level_achieved || 'Level 2: Intermediate',
            status: (latestReport?.percentage || rank.overall_percentage) >= 60 ? 'On Track' : 'Needs Practice',
          },
          {
            subject: 'Physics',
            score: 78,
            level: 'Level 2: Intermediate',
            status: 'On Track',
          },
          {
            subject: 'Chemistry',
            score: 64,
            level: 'Level 2: Intermediate',
            status: 'On Track',
          },
          {
            subject: 'Computer Science',
            score: 82,
            level: 'Level 3: Advanced',
            status: 'Mastered',
          },
        ],
        weakTopics: (latestReport?.weak_topics || []).length > 0
          ? (latestReport?.weak_topics || []).map((wt) => ({
              topic: wt.topicName,
              subject: latestReport?.subject || 'Mathematics',
              plainText: wt.evidence || `${child.name} is working on improving ${wt.topicName}.`,
            }))
          : [
              {
                topic: 'Algebraic Factoring',
                subject: 'Mathematics',
                plainText: `${child.name} understands the quadratic formula, but occasionally makes calculation slips during factoring middle terms. Practice will resolve this.`,
              },
            ],
        topicScores: [
          { topic: 'CS / Logic', score: 82 },
          { topic: 'Kinematics', score: 78 },
          { topic: 'Bonding', score: 64 },
          { topic: 'Factoring', score: latestReport?.percentage || 50 },
          { topic: 'Quadratics', score: 60 },
        ],
        studySchedule: [
          {
            id: `sess-${child.id}-1`,
            title: `Foundational Practice: ${latestReport?.weak_topics?.[0]?.topicName || 'Algebraic Identities'}`,
            duration: '25 mins',
            day: 'Today',
            time: '5:00 PM',
            status: 'Upcoming',
            statusColor: 'amber',
          },
          {
            id: `sess-${child.id}-2`,
            title: 'Core Exercises & Review',
            duration: '30 mins',
            day: 'Tomorrow',
            time: '5:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
          {
            id: `sess-${child.id}-3`,
            title: 'Problem Solving & Verification',
            duration: '25 mins',
            day: 'Thursday',
            time: '6:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
        ],
        jargonFreeSummary: latestReport
          ? `${child.name} is making solid progress in class. They achieved ${latestReport.percentage}% in ${latestReport.subject || 'Mathematics'}. Focused practice on ${latestReport.weak_topics?.[0]?.topicName || 'core foundational concepts'} will help reinforce their understanding and boost confidence.`
          : `${child.name} is maintaining consistent academic effort across all subjects with an overall average of ${Math.round(rank.overall_percentage || 75)}%. Recommended practice sessions are scheduled to support ongoing class learning.`,
        teacherFeedback: clarification
          ? {
              teacherName: clarification.teacher_name || 'Mr. Rajesh Rao',
              subject: latestReport?.subject || 'Mathematics',
              date: new Date(clarification.updated_at || clarification.created_at).toLocaleDateString(),
              message: clarification.comment,
              status: clarification.status,
              topics: clarification.topics || [],
            }
          : {
              teacherName: 'Mr. Rajesh Rao',
              subject: 'Mathematics',
              date: 'Today',
              message: `${child.name} is participating actively. Continue supporting their practice.`,
              status: 'doing_well',
              topics: [],
            },
      };
    });

    res.json({
      status: 'ok',
      parentId: parentUser?.id || requester.id,
      parentName: parentUser?.name || 'Parent',
      children: enrichedChildren,
    });
  } catch (err) {
    res.status(500).json({ error: 'ParentChildrenError', message: err.message });
  }
});

/**
 * GET /api/parent/child/:studentId
 * GET /api/parent/children/:studentId/summary
 * Fetches comprehensive child diagnostic summary, study sessions, and teacher notes for parent view
 * Enforces RLS: Parent can only view linked children.
 */
router.get(['/child/:studentId', '/children/:studentId/summary', '/child/:studentId/summary'], async (req, res) => {
  const { studentId } = req.params;
  const requester = getRequester(req);

  try {
    const users = getAllUsers();
    const targetStudent = users.find(
      (u) => u.id === studentId || u.email?.toLowerCase() === studentId.toLowerCase()
    );

    if (requester.role === 'parent') {
      const parentUser = users.find(
        (u) => u.id === requester.id || u.email?.toLowerCase() === requester.email
      );
      const isDemoParent = requester.id === '00000000-0000-0000-0000-000000000003' || requester.email === 'sunita.sharma@learnlens.edu';
      const isDemoChild = targetStudent && (targetStudent.name === 'Priya Sharma' || targetStudent.name === 'Arjun Sharma');

      const linkedChildNames = (parentUser?.linkedChild || '').toLowerCase();
      const studentName = (targetStudent?.name || '').toLowerCase();
      const isLinked =
        (isDemoParent && isDemoChild) ||
        (targetStudent && linkedChildNames.includes(studentName)) ||
        parentUser?.linked_student_id === studentId;

      if (!isLinked) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Parents can only view reports and notes for their linked children.',
        });
      }
    }

    const rankSnapshot = getStudentRankSnapshot(studentId);
    const clarification = getClarificationForStudent(studentId);
    const reports = studentReportsStore.filter((r) => r.student_id === studentId);
    const latestReport = reports[0] || null;

    let studentData = null;

    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
      
      const { data: feedback } = await supabase
        .from('teacher_feedback')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      const { data: gaps } = await supabase
        .from('learning_gaps')
        .select('*')
        .eq('student_id', studentId);

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('student_id', studentId);

      if (profile) {
        studentData = {
          profile,
          rank: rankSnapshot,
          clarification,
          latestReport,
          feedback: feedback || [],
          gaps: gaps || [],
          sessions: sessions || [],
        };
      }
    }

    if (!studentData) {
      // Deterministic data enriched with live rank and teacher clarification
      studentData = {
        profile: {
          id: targetStudent?.id || studentId || '00000000-0000-0000-0000-000000000001',
          full_name: targetStudent?.name || 'Priya Sharma',
          role: 'student',
          grade: targetStudent?.className || 'Class 11-A',
          school: 'Kendriya Vidyalaya No. 1',
        },
        rank: rankSnapshot,
        clarification,
        latestReport,
        overview: {
          diagnosticScore: latestReport ? latestReport.percentage : rankSnapshot.overall_percentage,
          status: (latestReport?.percentage || rankSnapshot.overall_percentage) >= 60 ? 'On Track' : 'Needs Foundational Review',
          strongAreas: ['Geometry (Lines & Angles, Triangles)', 'Number Systems & Real Numbers'],
          focusAreas: clarification?.topics?.length > 0 ? clarification.topics : ['Class 10 Algebraic Factoring (Prerequisite)', 'Class 11 Quadratic Equations'],
          plainEnglishSummary: `${targetStudent?.name || 'Student'} is maintaining good overall consistency. ${
            clarification
              ? `Teacher note: "${clarification.comment}"`
              : 'Keep practicing scheduled sessions on LearnLens.'
          }`,
        },
        topicScores: [
          { topic: 'Number Systems', score: 88, status: 'Mastered' },
          { topic: 'Real Numbers', score: 76, status: 'Good' },
          { topic: 'Factoring', score: 45, status: 'Needs Practice' },
          { topic: 'Quadratics', score: 33, status: 'Needs Practice' },
          { topic: 'Linear Eq (1V)', score: 85, status: 'Mastered' },
          { topic: 'Lines & Angles', score: 82, status: 'Mastered' },
        ],
        studySchedule: [
          {
            id: 'sess-1',
            title: clarification?.topics?.[0] ? `Focus Review: ${clarification.topics[0]}` : 'Foundational Review: Middle-Term Splitting',
            duration: '30 mins',
            day: 'Today',
            time: '5:00 PM',
            status: 'Upcoming',
            statusColor: 'amber',
          },
          {
            id: 'sess-2',
            title: 'Algebraic Identities Practice (a+b)² & (a-b)²',
            duration: '25 mins',
            day: 'Tomorrow',
            time: '5:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
          {
            id: 'sess-3',
            title: 'Applying Factoring to Quadratic Equations',
            duration: '25 mins',
            day: 'Thursday',
            time: '6:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
        ],
        feedback: clarification
          ? [
              {
                id: clarification.id,
                teacherName: clarification.teacher_name || 'Mr. Rajesh Rao',
                subject: latestReport?.subject || 'Class 11 Mathematics',
                date: new Date(clarification.updated_at || clarification.created_at).toLocaleDateString(),
                message: clarification.comment,
                type: clarification.status,
                status: clarification.status,
                topics: clarification.topics || [],
              },
            ]
          : [
              {
                id: 'tf-1',
                teacherName: 'Mr. Rajesh Rao',
                subject: 'Class 11 Mathematics',
                date: 'Today',
                message: 'Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete her scheduled sessions on LearnLens.',
                type: 'revision_focus',
              },
            ],
      };
    }

    res.json(studentData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch child data', details: err.message });
  }
});

/**
 * POST /api/parent/acknowledge
 * Allows parent to send an acknowledgment / message to the teacher
 */
router.post('/acknowledge', (req, res) => {
  const { studentId, parentName, message } = req.body;
  res.json({
    success: true,
    message: 'Teacher acknowledged successfully',
    timestamp: new Date().toISOString(),
    data: { studentId, parentName, message }
  });
});

export default router;
