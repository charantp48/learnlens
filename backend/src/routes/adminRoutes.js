import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// School administration in-memory state
let classesList = [
  { id: 'c1', name: 'Class 11-A', section: 'A', subject: 'Mathematics & Science', teacher: 'Mr. Rajesh Rao', studentsCount: 3 },
  { id: 'c2', name: 'Class 9-B', section: 'B', subject: 'Mathematics', teacher: 'Ms. Sunita Patil', studentsCount: 1 },
];

let usersList = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Priya Sharma',
    email: 'priya.sharma@learnlens.edu',
    role: 'student',
    className: 'Class 11-A',
    parentName: 'Sunita Sharma',
    status: 'active',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Rahul Verma',
    email: 'rahul.verma@learnlens.edu',
    role: 'student',
    className: 'Class 11-A',
    parentName: 'Amit Verma',
    status: 'active',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Ananya Sen',
    email: 'ananya.sen@learnlens.edu',
    role: 'student',
    className: 'Class 11-A',
    parentName: 'Subhash Sen',
    status: 'active',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@learnlens.edu',
    role: 'student',
    className: 'Class 9-B',
    parentName: 'Sunita Sharma',
    status: 'active',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Mr. Rajesh Rao',
    email: 'rajesh.rao@learnlens.edu',
    role: 'teacher',
    className: 'Class 11-A (Mathematics)',
    status: 'active',
    createdAt: '2026-08-15T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Ms. Sunita Patil',
    email: 'sunita.patil@learnlens.edu',
    role: 'teacher',
    className: 'Class 9-B (Mathematics)',
    status: 'active',
    createdAt: '2026-08-15T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@learnlens.edu',
    role: 'parent',
    linkedChild: 'Priya Sharma, Arjun Sharma',
    status: 'active',
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Amit Verma',
    email: 'amit.verma@learnlens.edu',
    role: 'parent',
    linkedChild: 'Rahul Verma',
    status: 'active',
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'School Administrator',
    email: 'admin@learnlens.edu',
    role: 'admin',
    className: 'Central Administration',
    status: 'active',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
];

/**
 * 1. GET /api/admin/metrics
 * Returns counts of students, teachers, parents, full user roster, and classes
 */
router.get('/metrics', async (req, res) => {
  try {
    const studentCount = usersList.filter((u) => u.role === 'student').length;
    const teacherCount = usersList.filter((u) => u.role === 'teacher').length;
    const parentCount = usersList.filter((u) => u.role === 'parent').length;
    const adminCount = usersList.filter((u) => u.role === 'admin').length;

    res.json({
      status: 'ok',
      counts: {
        students: studentCount,
        teachers: teacherCount,
        parents: parentCount,
        admins: adminCount,
        totalUsers: usersList.length,
        classes: classesList.length,
      },
      users: usersList,
      classes: classesList,
    });
  } catch (err) {
    res.status(500).json({ error: 'AdminMetricsError', message: err.message });
  }
});

/**
 * 2. POST /api/admin/users
 * Create a new user (student, teacher, parent, admin)
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, role, password, className, linkedChild } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Name, email, and role are required fields.',
      });
    }

    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({
        error: 'DuplicateUser',
        message: `A user with email ${email} already exists.`,
      });
    }

    // Generate valid UUID
    const id = crypto.randomUUID();

    const newUser = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      className: className || (role === 'student' ? 'Class 11-A' : role === 'teacher' ? 'Class 11-A' : ''),
      linkedChild: linkedChild || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    usersList.unshift(newUser);

    // If assigned to a class, update student count
    if (role === 'student' && newUser.className) {
      const cls = classesList.find((c) => c.name === newUser.className);
      if (cls) cls.studentsCount += 1;
    }

    res.status(201).json({
      status: 'ok',
      message: `User ${newUser.name} (${newUser.role}) created successfully.`,
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ error: 'CreateUserError', message: err.message });
  }
});

/**
 * 3. PATCH /api/admin/users/:id/toggle-status
 * Enable or disable a user account
 */
router.patch('/users/:id/toggle-status', (req, res) => {
  try {
    const { id } = req.params;
    const user = usersList.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'disabled' : 'active';

    res.json({
      status: 'ok',
      message: `User ${user.name} is now ${user.status}.`,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: 'ToggleStatusError', message: err.message });
  }
});

/**
 * 4. POST /api/admin/classes
 * Create a new class / cohort
 */
router.post('/classes', (req, res) => {
  try {
    const { name, section, subject, teacher } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'ValidationError', message: 'Class name is required' });
    }

    const newClass = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      section: section || 'A',
      subject: subject || 'General Science & Mathematics',
      teacher: teacher || 'Unassigned',
      studentsCount: 0,
    };

    classesList.push(newClass);

    res.status(201).json({
      status: 'ok',
      message: `Class ${newClass.name} created successfully.`,
      class: newClass,
    });
  } catch (err) {
    res.status(500).json({ error: 'CreateClassError', message: err.message });
  }
});

/**
 * 5. POST /api/admin/assign
 * Assign teacher or student to a class
 */
router.post('/assign', (req, res) => {
  try {
    const { classId, userId } = req.body;

    const targetClass = classesList.find((c) => c.id === classId || c.name === classId);
    const targetUser = usersList.find((u) => u.id === userId);

    if (!targetClass || !targetUser) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Both valid class and user must be selected for assignment.',
      });
    }

    if (targetUser.role === 'teacher') {
      targetClass.teacher = targetUser.name;
      targetUser.className = `${targetClass.name} (${targetClass.subject})`;
    } else if (targetUser.role === 'student') {
      targetUser.className = targetClass.name;
      targetClass.studentsCount += 1;
    }

    res.json({
      status: 'ok',
      message: `Successfully assigned ${targetUser.name} to ${targetClass.name}.`,
      targetClass,
      targetUser,
    });
  } catch (err) {
    res.status(500).json({ error: 'AssignError', message: err.message });
  }
});

/**
 * 6. POST /api/admin/link-parent
 * Link a parent to a child
 */
router.post('/link-parent', (req, res) => {
  try {
    const { parentId, studentId } = req.body;

    const parent = usersList.find((u) => u.id === parentId);
    const student = usersList.find((u) => u.id === studentId);

    if (!parent || !student) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Both parent and student must be selected.',
      });
    }

    // Update parent's linked child text
    if (parent.linkedChild && parent.linkedChild.length > 0) {
      if (!parent.linkedChild.includes(student.name)) {
        parent.linkedChild += `, ${student.name}`;
      }
    } else {
      parent.linkedChild = student.name;
    }

    // Update student's parent text
    student.parentName = parent.name;

    res.json({
      status: 'ok',
      message: `Successfully linked parent ${parent.name} to student ${student.name}.`,
      parent,
      student,
    });
  } catch (err) {
    res.status(500).json({ error: 'LinkParentError', message: err.message });
  }
});

export default router;
