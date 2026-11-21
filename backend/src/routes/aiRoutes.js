import express from 'express';
import { 
  explainWrongAnswer, 
  getHint, 
  generatePracticeQuestions 
} from '../services/aiService.js';

const router = express.Router();

// In-memory bad question report log
const reportedQuestions = [];

// POST /api/ai/explain - Step-by-step misconception breakdown
router.post('/explain', async (req, res) => {
  try {
    const { questionText, studentAnswer, correctAnswer, topicName } = req.body;
    if (!questionText) {
      return res.status(400).json({ error: 'MissingParameters', message: 'questionText is required' });
    }

    const result = await explainWrongAnswer({
      questionText,
      studentAnswer: studentAnswer || 'None',
      correctAnswer: correctAnswer || 'A',
      topicName: topicName || 'Class 9 Mathematics',
    });

    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ error: 'AIError', message: err.message });
  }
});

// POST /api/ai/hint - Conceptual hint without answer reveal
router.post('/hint', async (req, res) => {
  try {
    const { questionText, topicName } = req.body;
    if (!questionText) {
      return res.status(400).json({ error: 'MissingParameters', message: 'questionText is required' });
    }

    const result = await getHint({
      questionText,
      topicName: topicName || 'Class 9 Mathematics',
    });

    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ error: 'AIError', message: err.message });
  }
});

// POST /api/ai/practice - Generate targeted practice questions
router.post('/practice', async (req, res) => {
  try {
    const { topicName, count = 3 } = req.body;

    const result = await generatePracticeQuestions({
      topicName: topicName || 'Algebraic Identities & Factoring',
      count: Number(count) || 3,
    });

    res.json({ status: 'ok', ...result });
  } catch (err) {
    res.status(500).json({ error: 'AIError', message: err.message });
  }
});

// POST /api/ai/report - Responsible AI: Report incorrect/low-quality question
router.post('/report', (req, res) => {
  const { questionId, questionText, reason, reportedBy } = req.body;
  const reportItem = {
    id: `rep-${Date.now()}`,
    questionId: questionId || 'custom',
    questionText,
    reason: reason || 'Inaccurate mathematical explanation',
    reportedBy: reportedBy || 'student',
    timestamp: new Date().toISOString(),
  };

  reportedQuestions.push(reportItem);
  console.log('🚨 [Responsible AI Report Logged]:', reportItem);

  res.json({
    status: 'ok',
    message: 'Thank you for reporting. This item has been flagged for human review.',
    reportId: reportItem.id,
  });
});

export default router;
