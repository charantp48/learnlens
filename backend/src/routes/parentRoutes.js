import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

/**
 * GET /api/parent/child/:studentId
 * Fetches comprehensive child diagnostic summary, study sessions, and teacher notes for parent view
 */
router.get('/child/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
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
          feedback: feedback || [],
          gaps: gaps || [],
          sessions: sessions || [],
        };
      }
    }

    if (!studentData) {
      // Fallback for hackathon demo mode
      studentData = {
        profile: {
          id: studentId || '00000000-0000-0000-0000-000000000001',
          full_name: 'Priya Sharma',
          role: 'student',
          grade: 'Class 9-A',
          school: 'Kendriya Vidyalaya No. 1',
        },
        overview: {
          diagnosticScore: 50,
          status: 'Needs Foundational Review',
          strongAreas: ['Geometry (Lines & Angles, Triangles)', 'Number Systems & Real Numbers'],
          focusAreas: ['Class 8 Algebraic Factoring (Prerequisite)', 'Class 9 Quadratic Equations'],
          plainEnglishSummary: "Priya is doing wonderfully in Geometry and Number Systems (85%+ accuracy). In Algebra, her score dipped to 50% not because 9th-grade quadratic concepts are too hard, but because of a small gap in 8th-grade factoring (splitting middle terms). LearnLens has mapped out 3 short 25-minute practice sessions that will help her catch up smoothly.",
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
            title: 'Foundational Review: Middle-Term Splitting',
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
        feedback: [
          {
            id: 'tf-1',
            teacherName: 'Mr. Rajesh Rao',
            subject: 'Class 9 Mathematics',
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
