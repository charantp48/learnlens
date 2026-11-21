import express from 'express';
import { supabase } from '../config/supabase.js';
import { generateStudyPlan } from '../services/studyPlanner.js';

const router = express.Router();

// GET /api/planner/:studentId - Return active study sessions
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Try reading from Supabase if connected
    if (supabase) {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          id,
          topic_id,
          scheduled_date,
          start_time,
          duration_minutes,
          status,
          focus_notes,
          topic:topics!study_sessions_topic_id_fkey(name)
        `)
        .eq('student_id', studentId)
        .order('scheduled_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const formatted = data.map((s) => ({
          id: s.id,
          topicId: s.topic_id,
          topicName: s.topic?.name || 'Class 9 Mathematics',
          scheduledDate: s.scheduled_date,
          startTime: s.start_time,
          durationMinutes: s.duration_minutes,
          status: s.status,
          focusNotes: s.focus_notes,
        }));
        return res.json({ status: 'ok', source: 'database', sessions: formatted });
      }
    }

    // 2. Fallback to default generated plan for Priya
    const defaultGaps = [
      {
        topicId: '10000000-0000-0000-0000-000000000004',
        topicName: 'Quadratic Equations',
        accuracy: 33,
        rootPrerequisiteId: '10000000-0000-0000-0000-000000000003',
        rootPrerequisiteName: 'Algebraic Identities & Factoring',
      },
    ];

    const plan = generateStudyPlan({
      learningGaps: defaultGaps,
      dailyFreeMinutes: 60,
      sessionDuration: 25,
    });

    res.json({
      status: 'ok',
      source: 'deterministic_engine',
      ...plan,
    });
  } catch (err) {
    console.error('Error fetching study plan:', err);
    res.status(500).json({ error: 'PlannerError', message: err.message });
  }
});

// POST /api/planner/generate - Generate adaptive plan from inputs
router.post('/generate', (req, res) => {
  try {
    const {
      learningGaps = [],
      dailyFreeMinutes = 60,
      examDate = null,
      sessionDuration = 25,
    } = req.body;

    const plan = generateStudyPlan({
      learningGaps,
      dailyFreeMinutes,
      examDate,
      sessionDuration,
    });

    res.json({ status: 'ok', ...plan });
  } catch (err) {
    console.error('Error generating study plan:', err);
    res.status(500).json({ error: 'PlanGenerationError', message: err.message });
  }
});

export default router;
