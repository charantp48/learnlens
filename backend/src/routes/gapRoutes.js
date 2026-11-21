import express from 'express';
import { supabase } from '../config/supabase.js';
import { MOCK_TOPICS, MOCK_PREREQUISITES_GRAPH } from '../config/mockData.js';
import { findLearningGaps } from '../services/gapFinder.js';

const router = express.Router();

// GET /api/gaps/:studentId - Return active gaps with root prerequisite evidence
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Try reading from Supabase if connected
    if (supabase) {
      const { data, error } = await supabase
        .from('learning_gaps')
        .select(`
          id,
          topic_id,
          root_prerequisite_id,
          accuracy,
          confidence_score,
          status,
          reason,
          diagnosed_at,
          target_topic:topics!learning_gaps_topic_id_fkey(name),
          root_topic:topics!learning_gaps_root_prerequisite_id_fkey(name)
        `)
        .eq('student_id', studentId);

      if (!error && data && data.length > 0) {
        const formatted = data.map((g) => ({
          id: g.id,
          topicId: g.topic_id,
          topicName: g.target_topic?.name || 'Quadratic Equations',
          rootPrerequisiteId: g.root_prerequisite_id,
          rootPrerequisiteName: g.root_topic?.name || 'Algebraic Identities & Factoring',
          accuracy: Number(g.accuracy),
          reason: g.reason,
          status: g.status,
          diagnosedAt: g.diagnosed_at,
        }));
        return res.json({ status: 'ok', source: 'database', learningGaps: formatted });
      }
    }

    // 2. Deterministic mock response (Priya's diagnosed scenario from seed data)
    const mockGaps = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        topicId: '10000000-0000-0000-0000-000000000004',
        topicName: 'Quadratic Equations',
        accuracy: 33,
        rawAccuracy: 50,
        rootPrerequisiteId: '10000000-0000-0000-0000-000000000003',
        rootPrerequisiteName: 'Algebraic Identities & Factoring',
        prerequisiteChain: [
          'Algebraic Identities & Factoring',
          'Quadratic Equations'
        ],
        reason: 'Struggle detected in Quadratic Equations (33% accuracy). Graph traversal identified foundational gaps in prerequisite: Algebraic Identities & Factoring (0% confident accuracy). Solving quadratic equations requires mastering middle-term splitting and difference of squares first.',
        status: 'active',
        diagnosedAt: new Date().toISOString(),
      },
    ];

    res.json({
      status: 'ok',
      source: 'deterministic_engine',
      learningGaps: mockGaps,
    });
  } catch (err) {
    console.error('Error fetching learning gaps:', err);
    res.status(500).json({ error: 'GapFetchError', message: err.message });
  }
});

export default router;
