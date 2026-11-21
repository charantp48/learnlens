import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

/**
 * In-memory state for new classes or links created during the demo
 */
let createdClasses = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Class 9-A', section: 'A', subject: 'Mathematics', teacher: 'Mr. Rajesh Rao', studentsCount: 3, averageScore: 62.3 },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Class 9-B', section: 'B', subject: 'Mathematics', teacher: 'Ms. Sunita Patil', studentsCount: 0, averageScore: 0 }
];

let studentRoster = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Priya Sharma', class: 'Class 9-A', score: '50%', parent: 'Sunita Sharma', teacher: 'Mr. Rajesh Rao', status: 'Needs Support' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Rahul Verma', class: 'Class 9-A', score: '55%', parent: 'Amit Verma', teacher: 'Mr. Rajesh Rao', status: 'Needs Support' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Ananya Sen', class: 'Class 9-A', score: '82%', parent: 'Subhash Sen', teacher: 'Mr. Rajesh Rao', status: 'On Track' },
];

/**
 * GET /api/admin/metrics
 * School-wide metrics, class list, and student roster
 */
router.get('/metrics', async (req, res) => {
  try {
    let stats = {
      schoolName: 'Kendriya Vidyalaya No. 1, Bengaluru',
      totalClasses: createdClasses.length,
      totalStudents: studentRoster.length,
      totalTeachers: 2,
      schoolAverageScore: 62.3,
      prerequisiteBottlenecks: [
        {
          targetTopic: 'Quadratic Equations (Class 9)',
          bottleneckPrerequisite: 'Algebraic Identities & Factoring (Class 8)',
          affectedStudentsPercentage: 66,
          severity: 'High',
          actionRecommended: 'Conduct 20-min remedial session on middle-term splitting before term exam.'
        },
        {
          targetTopic: 'Triangles & Congruence (Class 9)',
          bottleneckPrerequisite: 'Lines & Angles (Class 7)',
          affectedStudentsPercentage: 20,
          severity: 'Low',
          actionRecommended: 'Review supplementary exercise 6.1 in NCERT text.'
        }
      ],
      classes: createdClasses,
      students: studentRoster
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin metrics', details: err.message });
  }
});

/**
 * POST /api/admin/classes
 * Create a new class
 */
router.post('/classes', (req, res) => {
  const { name, section, subject, teacher } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Class name is required' });
  }

  const newClass = {
    id: `c0000000-0000-0000-0000-${Date.now().toString(16).slice(-12).padStart(12, '0')}`,
    name,
    section: section || 'A',
    subject: subject || 'Mathematics',
    teacher: teacher || 'Unassigned',
    studentsCount: 0,
    averageScore: 0,
  };

  createdClasses.push(newClass);
  res.json({ success: true, message: 'Class created successfully', class: newClass });
});

/**
 * POST /api/admin/link-parent
 * Link parent to student
 */
router.post('/link-parent', (req, res) => {
  const { studentId, parentName } = req.body;
  const student = studentRoster.find(s => s.id === studentId);
  if (student) {
    student.parent = parentName;
  }
  res.json({ success: true, message: 'Parent successfully linked to student', student });
});

export default router;
