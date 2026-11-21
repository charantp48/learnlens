import express from 'express';
import { supabase } from '../config/supabase.js';
import { MOCK_TOPICS } from '../config/mockData.js';

const router = express.Router();

// Class 9 Diagnostic Questions (Used for live quiz & offline fallback)
export const DIAGNOSTIC_QUESTIONS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    topic_id: '10000000-0000-0000-0000-000000000001',
    topic_name: 'Number Systems & Rationals',
    question_text: 'Which of the following is an irrational number?',
    option_a: '3.14159',
    option_b: '22/7',
    option_c: '√2',
    option_d: '0.333...',
    correct_option: 'C',
    explanation: '√2 cannot be expressed as a ratio p/q of two integers, hence it is an irrational number.',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    topic_id: '10000000-0000-0000-0000-000000000002',
    topic_name: 'Real Numbers & Radicals',
    question_text: 'What is the rationalized form of 1 / (√5 + √2)?',
    option_a: '(√5 - √2) / 3',
    option_b: '(√5 + √2) / 3',
    option_c: '(√5 - √2) / 7',
    option_d: '√5 - √2',
    correct_option: 'A',
    explanation: 'Multiply numerator and denominator by the conjugate (√5 - √2): (√5 - √2)/(5 - 2) = (√5 - √2)/3.',
    difficulty: 'medium',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    topic_id: '10000000-0000-0000-0000-000000000003',
    topic_name: 'Algebraic Identities & Factoring',
    question_text: 'What are the factors of x² - 9?',
    option_a: '(x - 3)(x - 3)',
    option_b: '(x + 3)(x + 3)',
    option_c: '(x - 3)(x + 3)',
    option_d: '(x - 9)(x + 1)',
    correct_option: 'C',
    explanation: 'Difference of squares formula: a² - b² = (a - b)(a + b). Since 9 = 3², x² - 9 = (x - 3)(x + 3).',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    topic_id: '10000000-0000-0000-0000-000000000003',
    topic_name: 'Algebraic Identities & Factoring',
    question_text: 'Factorize x² + 5x + 6 completely:',
    option_a: '(x + 1)(x + 6)',
    option_b: '(x + 2)(x + 3)',
    option_c: '(x - 2)(x - 3)',
    option_d: '(x + 5)(x + 1)',
    correct_option: 'B',
    explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3. Thus x² + 5x + 6 = (x + 2)(x + 3).',
    difficulty: 'medium',
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    topic_id: '10000000-0000-0000-0000-000000000004',
    topic_name: 'Quadratic Equations',
    question_text: 'What are the roots of the equation x² - 5x + 6 = 0?',
    option_a: 'x = 2, 3',
    option_b: 'x = -2, -3',
    option_c: 'x = 1, 6',
    option_d: 'x = -1, -6',
    correct_option: 'A',
    explanation: 'Factoring gives (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3.',
    difficulty: 'medium',
  },
  {
    id: '20000000-0000-0000-0000-000000000013',
    topic_id: '10000000-0000-0000-0000-000000000005',
    topic_name: 'Linear Equations in 1 Variable',
    question_text: 'Solve for x: 3x - 7 = 14',
    option_a: 'x = 5',
    option_b: 'x = 7',
    option_c: 'x = 21',
    option_d: 'x = 3',
    correct_option: 'B',
    explanation: '3x = 14 + 7 = 21 => x = 21 / 3 = 7.',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000016',
    topic_id: '10000000-0000-0000-0000-000000000006',
    topic_name: 'Linear Equations in 2 Variables',
    question_text: 'A linear equation in two variables ax + by + c = 0 has:',
    option_a: 'A unique solution',
    option_b: 'Two solutions',
    option_c: 'Infinitely many solutions',
    option_d: 'No solution',
    correct_option: 'C',
    explanation: 'Every geometric point on the line represented by ax + by + c = 0 is a valid solution.',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000019',
    topic_id: '10000000-0000-0000-0000-000000000007',
    topic_name: 'Lines and Angles',
    question_text: 'Two angles whose sum is 180° are called:',
    option_a: 'Complementary angles',
    option_b: 'Supplementary angles',
    option_c: 'Adjacent angles',
    option_d: 'Vertically opposite angles',
    correct_option: 'B',
    explanation: 'By definition, supplementary angles sum up to exactly 180 degrees.',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000022',
    topic_id: '10000000-0000-0000-0000-000000000008',
    topic_name: 'Triangles & Congruence',
    question_text: 'Which of the following is NOT a criterion for congruence of triangles?',
    option_a: 'SAS',
    option_b: 'ASA',
    option_c: 'AAA',
    option_d: 'SSS',
    correct_option: 'C',
    explanation: 'AAA (Angle-Angle-Angle) guarantees that two triangles are similar, but does not guarantee congruence.',
    difficulty: 'easy',
  },
  {
    id: '20000000-0000-0000-0000-000000000028',
    topic_id: '10000000-0000-0000-0000-000000000010',
    topic_name: 'Coordinate Geometry',
    question_text: 'The coordinates of the origin are:',
    option_a: '(0, 1)',
    option_b: '(1, 0)',
    option_c: '(0, 0)',
    option_d: '(1, 1)',
    correct_option: 'C',
    explanation: 'The origin is the intersection point of the horizontal x-axis and vertical y-axis: (0, 0).',
    difficulty: 'easy',
  },
];

// 1. Get Diagnostic Questions
router.get('/diagnostic', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, topic_id, question_text, option_a, option_b, option_c, option_d, difficulty')
        .limit(10);

      if (!error && data && data.length > 0) {
        // Attach topic names
        const enriched = data.map((q) => {
          const match = MOCK_TOPICS.find((t) => t.id === q.topic_id);
          return { ...q, topic_name: match ? match.name : 'Mathematics' };
        });
        return res.json({ status: 'ok', questions: enriched });
      }
    }

    // Fallback to offline questions
    const sanitized = DIAGNOSTIC_QUESTIONS.map(({ correct_option, explanation, ...rest }) => rest);
    res.json({ status: 'ok', questions: sanitized });
  } catch (err) {
    console.error('Error fetching questions:', err);
    const sanitized = DIAGNOSTIC_QUESTIONS.map(({ correct_option, explanation, ...rest }) => rest);
    res.json({ status: 'ok', questions: sanitized });
  }
});

// 2. Submit Diagnostic Quiz & Evaluate Answers
router.post('/submit', async (req, res) => {
  try {
    const { studentId = '00000000-0000-0000-0000-000000000001', answers = [] } = req.body;

    let score = 0;
    const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
    const evaluatedAnswers = [];
    const topicStats = {};

    // Evaluate each submitted answer
    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      const userSubmission = answers.find((a) => a.questionId === q.id);
      const selectedOption = userSubmission ? userSubmission.selectedOption : null;
      const confidence = userSubmission ? userSubmission.confidence : 'not_sure'; // 'sure' | 'not_sure' | 'guessing'
      const isCorrect = selectedOption === q.correct_option;

      if (isCorrect) score += 1;

      // Group per topic for gap finder
      if (!topicStats[q.topic_id]) {
        topicStats[q.topic_id] = {
          topicId: q.topic_id,
          topicName: q.topic_name,
          total: 0,
          correct: 0,
          guessing: 0,
          notSure: 0,
          sure: 0,
        };
      }
      topicStats[q.topic_id].total += 1;
      if (isCorrect) topicStats[q.topic_id].correct += 1;
      if (confidence === 'guessing') topicStats[q.topic_id].guessing += 1;
      else if (confidence === 'not_sure') topicStats[q.topic_id].notSure += 1;
      else topicStats[q.topic_id].sure += 1;

      evaluatedAnswers.push({
        questionId: q.id,
        topicId: q.topic_id,
        topicName: q.topic_name,
        questionText: q.question_text,
        selectedOption,
        correctOption: q.correct_option,
        isCorrect,
        confidence,
        explanation: q.explanation,
      });
    });

    const percentage = Number(((score / totalQuestions) * 100).toFixed(1));

    // Try saving attempt to Supabase if connected
    let attemptId = `d0000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    if (supabase) {
      try {
        const { data: attemptData } = await supabase.from('quiz_attempts').insert({
          quiz_id: 'e0000000-0000-0000-0000-000000000001',
          student_id: studentId,
          score,
          total_score: totalQuestions,
          percentage,
        }).select().single();

        if (attemptData) attemptId = attemptData.id;
      } catch (err) {
        console.warn('Could not persist attempt to Supabase, continuing with in-memory result:', err.message);
      }
    }

    res.json({
      status: 'ok',
      attemptId,
      score,
      totalQuestions,
      percentage,
      topicStats: Object.values(topicStats),
      evaluatedAnswers,
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error evaluating quiz submission:', err);
    res.status(500).json({ error: 'QuizEvaluationError', message: err.message });
  }
});

export default router;
