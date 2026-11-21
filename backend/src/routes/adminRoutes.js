import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import {
  studentReportsStore,
  quizAttemptsStore,
  getStudentRankSnapshot,
  computeStudentRankings,
  getClarificationForStudent,
} from '../services/reportService.js';

const router = express.Router();

/**
 * In-memory state for school administration
 * Preserves demo accounts and supports dynamic real accounts
 */
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
    is_demo: true,
    must_change_password: false,
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
    is_demo: true,
    must_change_password: false,
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
    is_demo: false,
    must_change_password: false,
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
    is_demo: false,
    must_change_password: false,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Mr. Rajesh Rao',
    email: 'rajesh.rao@learnlens.edu',
    role: 'teacher',
    className: 'Class 11-A (Mathematics)',
    status: 'active',
    is_demo: true,
    must_change_password: false,
    createdAt: '2026-08-15T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Ms. Sunita Patil',
    email: 'sunita.patil@learnlens.edu',
    role: 'teacher',
    className: 'Class 9-B (Mathematics)',
    status: 'active',
    is_demo: false,
    must_change_password: false,
    createdAt: '2026-08-15T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@learnlens.edu',
    role: 'parent',
    linkedChild: 'Priya Sharma, Arjun Sharma',
    status: 'active',
    is_demo: true,
    must_change_password: false,
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Amit Verma',
    email: 'amit.verma@learnlens.edu',
    role: 'parent',
    linkedChild: 'Rahul Verma',
    status: 'active',
    is_demo: false,
    must_change_password: false,
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'School Administrator',
    email: 'admin@learnlens.edu',
    role: 'admin',
    className: 'Central Administration',
    status: 'active',
    is_demo: true,
    must_change_password: false,
    createdAt: '2026-08-01T08:00:00.000Z',
  },
];

// In-memory credentials store for real created users
export const dynamicCredentials = new Map();

// In-memory audit activity log
let activityLog = [
  {
    id: 'act-1',
    actor_id: '00000000-0000-0000-0000-000000000004',
    actor_email: 'admin@learnlens.edu',
    actor_role: 'admin',
    action: 'system_initialized',
    target_type: 'system',
    target_id: 'learnlens-main',
    details: { message: 'LearnLens single-server initialized with real account management' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function logActivity(actor, action, targetType, targetId, details = {}) {
  const entry = {
    id: `act-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    actor_id: actor?.id || '00000000-0000-0000-0000-000000000004',
    actor_email: actor?.email || 'admin@learnlens.edu',
    actor_role: actor?.role || 'admin',
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    created_at: new Date().toISOString(),
  };
  activityLog.unshift(entry);
  if (activityLog.length > 250) activityLog.pop();
  return entry;
}

// Generate secure, user-friendly temporary password (e.g. Lens#8X2mP9)
export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `Lens#${randomPart}`;
}

export function getAllUsers() {
  return usersList;
}

/**
 * 1. GET /api/admin/metrics
 * Returns real totals (excluding demo accounts), full user roster,
 * school-wide reports & rankings, classes, and recent activity log
 */
router.get('/metrics', async (req, res) => {
  try {
    const isDemoMode = process.env.DEMO_MODE !== 'false' && process.env.VITE_DEMO_MODE !== 'false';

    // Real counts EXCLUDE demo accounts (is_demo = true)
    const realStudents = usersList.filter((u) => u.role === 'student' && !u.is_demo).length;
    const realTeachers = usersList.filter((u) => u.role === 'teacher' && !u.is_demo).length;
    const realParents = usersList.filter((u) => u.role === 'parent' && !u.is_demo).length;
    const realAdmins = usersList.filter((u) => u.role === 'admin' && !u.is_demo).length;

    // Real reports counts EXCLUDE demo accounts
    const realReports = studentReportsStore.filter((r) => !r.is_demo);
    const reportsSubmitted = realReports.length;
    const reportsNotReviewed = realReports.filter((r) => r.review_status === 'new').length;

    // Total counts including demo
    const totalStudents = usersList.filter((u) => u.role === 'student').length;
    const totalTeachers = usersList.filter((u) => u.role === 'teacher').length;
    const totalParents = usersList.filter((u) => u.role === 'parent').length;

    // Build School-Wide Reports and Ranks Table Data
    const reportsAndRanks = usersList
      .filter((u) => u.role === 'student')
      .map((s) => {
        const studentReports = studentReportsStore.filter((r) => r.student_id === s.id);
        const latestReport = studentReports[0] || null;
        const rankSnap = getStudentRankSnapshot(s.id);
        const clarification = getClarificationForStudent(s.id);
        const attempts = quizAttemptsStore.filter((a) => a.student_id === s.id && a.is_completed);

        return {
          studentId: s.id,
          studentName: s.name,
          studentEmail: s.email,
          className: s.className || 'Class 11-A',
          isDemo: !!s.is_demo,
          status: s.status || 'active',
          schoolRank: rankSnap.school_rank,
          schoolTotal: rankSnap.school_total_students,
          classRank: rankSnap.class_rank,
          classTotal: rankSnap.class_total_students,
          overallPercentage: rankSnap.overall_percentage,
          attemptsCount: attempts.length,
          latestReport: latestReport
            ? {
                id: latestReport.id,
                subject: latestReport.subject || 'Mathematics',
                marksEarned: latestReport.marks_earned,
                marksPossible: latestReport.marks_possible,
                percentage: latestReport.percentage,
                levelAchieved: latestReport.level_achieved,
                reviewStatus: latestReport.review_status,
                weakTopics: latestReport.weak_topics || [],
                submittedAt: latestReport.created_at,
              }
            : null,
          clarification: clarification
            ? {
                status: clarification.status,
                topics: clarification.topics || [],
                comment: clarification.comment,
                teacherName: clarification.teacher_name,
                updatedAt: clarification.updated_at,
              }
            : null,
        };
      });

    res.json({
      status: 'ok',
      isDemoMode,
      counts: {
        real: {
          students: realStudents,
          teachers: realTeachers,
          parents: realParents,
          admins: realAdmins,
          total: realStudents + realTeachers + realParents + realAdmins,
          classes: classesList.length,
          reportsSubmitted,
          reportsNotReviewed,
        },
        all: {
          students: totalStudents,
          teachers: totalTeachers,
          parents: totalParents,
          total: usersList.length,
          classes: classesList.length,
          reportsSubmitted: studentReportsStore.length,
          reportsNotReviewed: studentReportsStore.filter((r) => r.review_status === 'new').length,
        },
        classes: classesList.length,
      },
      users: usersList,
      classes: classesList,
      reportsAndRanks,
      recentActivity: activityLog.slice(0, 30),
    });
  } catch (err) {
    res.status(500).json({ error: 'AdminMetricsError', message: err.message });
  }
});

/**
 * 2. GET /api/admin/reports-and-ranks
 * Dedicated endpoint to query school-wide reports and rankings with optional class filter
 */
router.get('/reports-and-ranks', (req, res) => {
  try {
    const classFilter = req.query.class;
    const includeDemo = req.query.includeDemo !== 'false';

    let list = usersList.filter((u) => u.role === 'student');
    if (!includeDemo) {
      list = list.filter((u) => !u.is_demo);
    }
    if (classFilter && classFilter !== 'all') {
      list = list.filter((u) => (u.className || '').toLowerCase() === classFilter.toLowerCase());
    }

    const reportsAndRanks = list.map((s) => {
      const studentReports = studentReportsStore.filter((r) => r.student_id === s.id);
      const latestReport = studentReports[0] || null;
      const rankSnap = getStudentRankSnapshot(s.id);
      const clarification = getClarificationForStudent(s.id);
      const attempts = quizAttemptsStore.filter((a) => a.student_id === s.id && a.is_completed);

      return {
        studentId: s.id,
        studentName: s.name,
        studentEmail: s.email,
        className: s.className || 'Class 11-A',
        isDemo: !!s.is_demo,
        status: s.status || 'active',
        schoolRank: rankSnap.school_rank,
        schoolTotal: rankSnap.school_total_students,
        classRank: rankSnap.class_rank,
        classTotal: rankSnap.class_total_students,
        overallPercentage: rankSnap.overall_percentage,
        attemptsCount: attempts.length,
        latestReport: latestReport
          ? {
              id: latestReport.id,
              subject: latestReport.subject || 'Mathematics',
              marksEarned: latestReport.marks_earned,
              marksPossible: latestReport.marks_possible,
              percentage: latestReport.percentage,
              levelAchieved: latestReport.level_achieved,
              reviewStatus: latestReport.review_status,
              weakTopics: latestReport.weak_topics || [],
              submittedAt: latestReport.created_at,
            }
          : null,
        clarification: clarification
          ? {
              status: clarification.status,
              topics: clarification.topics || [],
              comment: clarification.comment,
              teacherName: clarification.teacher_name,
              updatedAt: clarification.updated_at,
            }
          : null,
      };
    });

    res.json({
      status: 'ok',
      total: reportsAndRanks.length,
      reportsAndRanks,
    });
  } catch (err) {
    res.status(500).json({ error: 'ReportsAndRanksError', message: err.message });
  }
});

/**
 * 2. POST /api/admin/users/create-single
 * Create ONE real user (Student, Teacher, Parent, Admin)
 * Server generates temporary password and sets must_change_password = true
 */
router.post('/users/create-single', async (req, res) => {
  try {
    const name = req.body.name || req.body.full_name;
    const email = req.body.email;
    const role = req.body.role || 'student';
    const className = req.body.className || req.body.class_name;
    const linkedChild = req.body.linkedChild || req.body.linked_student_email;
    const rollNumber = req.body.rollNumber || req.body.roll_number;
    const subject = req.body.subject;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'ValidationError', message: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'ValidationError', message: 'Please provide a valid email format.' });
    }

    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'ValidationError', message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const existing = usersList.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({
        error: 'DuplicateUser',
        message: `A user with email ${email.trim()} already exists in the system.`,
      });
    }

    // Generate secure temporary password
    const temporaryPassword = generateTemporaryPassword();
    const id = crypto.randomUUID();

    const newUser = {
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      className: className || (role === 'student' ? 'Class 11-A' : ''),
      linkedChild: linkedChild || '',
      roll_number: rollNumber || '',
      status: 'active',
      is_demo: false, // REAL account created by admin
      must_change_password: true, // MUST change password at first login
      createdAt: new Date().toISOString(),
    };

    usersList.unshift(newUser);

    // Save temporary password in credentials map for first-login verification
    dynamicCredentials.set(newUser.email, {
      password: temporaryPassword,
      must_change_password: true,
      role: newUser.role,
      user: newUser,
    });

    // Update class counts if assigned
    if (newUser.role === 'student' && newUser.className) {
      const cls = classesList.find((c) => c.name === newUser.className);
      if (cls) cls.studentsCount += 1;
    } else if (newUser.role === 'teacher' && newUser.className) {
      const cls = classesList.find((c) => c.name === newUser.className);
      if (cls) cls.teacher = newUser.name;
    }

    // Log in activity log
    logActivity(
      req.user,
      'user_created',
      'user',
      newUser.id,
      { name: newUser.name, email: newUser.email, role: newUser.role, className: newUser.className }
    );

    res.status(201).json({
      status: 'ok',
      message: `Account for ${newUser.name} created successfully.`,
      user: { ...newUser, tempPassword: temporaryPassword },
      temporaryPassword,
    });
  } catch (err) {
    res.status(500).json({ error: 'CreateSingleUserError', message: err.message });
  }
});

/**
 * 3. GET /api/admin/users/csv-template
 * Returns standard CSV template
 */
router.get('/users/csv-template', (req, res) => {
  const template = `role,full_name,email,class_name,linked_student_email
student,Rohan Das,rohan.das@school.edu,Class 11-A,
student,Meera Nair,meera.nair@school.edu,Class 11-A,
teacher,Kavita Krishnan,kavita.k@school.edu,Class 11-A,
parent,Suresh Das,suresh.das@gmail.com,,rohan.das@school.edu
parent,Ramesh Nair,ramesh.nair@gmail.com,,meera.nair@school.edu`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="learnlens_users_template.csv"');
  res.send(template);
});

/**
 * 4. POST /api/admin/users/csv-preview
 * Validate CSV rows and return row-by-row error preview before importing
 * Allows at most 500 rows per upload
 */
router.post('/users/csv-preview', (req, res) => {
  try {
    const { rows } = req.body; // Array of row objects: { role, full_name, email, class_name, linked_student_email }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'No CSV rows provided.' });
    }

    if (rows.length > 500) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `CSV exceeds maximum limit of 500 rows. Found ${rows.length} rows. Please split into smaller files.`,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    const seenEmailsInBatch = new Set();

    const previewRows = rows.map((row, index) => {
      const rowNum = index + 1;
      const errors = [];

      const role = (row.role || '').trim().toLowerCase();
      const fullName = (row.full_name || '').trim();
      const email = (row.email || '').trim().toLowerCase();
      const className = (row.class_name || '').trim();
      const linkedStudentEmail = (row.linked_student_email || '').trim().toLowerCase();

      // Validate Role
      if (!role) {
        errors.push('Role is required');
      } else if (!validRoles.includes(role)) {
        errors.push(`Invalid role "${role}". Must be student, teacher, parent, or admin`);
      }

      // Validate Name
      if (!fullName) {
        errors.push('Full name is required');
      }

      // Validate Email
      if (!email) {
        errors.push('Email is required');
      } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      } else if (seenEmailsInBatch.has(email)) {
        errors.push('Duplicate email within this CSV file');
      } else {
        seenEmailsInBatch.add(email);
        const existsInDb = usersList.some((u) => u.email.toLowerCase() === email);
        if (existsInDb) {
          errors.push('Email already registered in system');
        }
      }

      // Validate Class
      if (role === 'student' && className) {
        const classExists = classesList.some((c) => c.name.toLowerCase() === className.toLowerCase());
        if (!classExists) {
          errors.push(`Class "${className}" does not exist in active cohorts`);
        }
      }

      // Validate Parent's linked student
      if (role === 'parent' && linkedStudentEmail) {
        const studentInDb = usersList.some(
          (u) => u.role === 'student' && u.email.toLowerCase() === linkedStudentEmail
        );
        const studentInBatch = rows.some(
          (r, rIdx) =>
            rIdx < index &&
            (r.role || '').trim().toLowerCase() === 'student' &&
            (r.email || '').trim().toLowerCase() === linkedStudentEmail
        );

        if (!studentInDb && !studentInBatch) {
          errors.push(`Linked student "${linkedStudentEmail}" not found in system or earlier rows`);
        }
      }

      return {
        rowNumber: rowNum,
        role: role || 'student',
        full_name: fullName,
        email,
        class_name: className,
        linked_student_email: linkedStudentEmail,
        isValid: errors.length === 0,
        errors,
      };
    });

    const validCount = previewRows.filter((r) => r.isValid).length;
    const errorCount = previewRows.length - validCount;

    res.json({
      status: 'ok',
      totalRows: previewRows.length,
      total: previewRows.length,
      validCount,
      valid_count: validCount,
      errorCount,
      error_count: errorCount,
      previewRows,
    });
  } catch (err) {
    res.status(500).json({ error: 'CSVPreviewError', message: err.message });
  }
});

/**
 * 5. POST /api/admin/users/csv-import
 * Imports valid rows from pre-validated batch.
 * Generates temporary passwords and returns them once for download.
 */
router.post('/users/csv-import', (req, res) => {
  try {
    const { validRows } = req.body;

    if (!Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ error: 'ValidationError', message: 'No valid rows to import.' });
    }

    const createdCredentials = [];

    for (const row of validRows) {
      const email = row.email.trim().toLowerCase();
      // Ensure no duplicate insertion
      if (usersList.some((u) => u.email.toLowerCase() === email)) {
        continue;
      }

      const tempPassword = generateTemporaryPassword();
      const id = crypto.randomUUID();

      // Find parent's linked student name if provided
      let linkedChildName = '';
      if (row.role === 'parent' && row.linked_student_email) {
        const st = usersList.find((u) => u.email.toLowerCase() === row.linked_student_email.toLowerCase());
        if (st) linkedChildName = st.name;
      }

      const newUser = {
        id,
        name: row.full_name.trim(),
        email,
        role: row.role,
        className: row.class_name || (row.role === 'student' ? 'Class 11-A' : ''),
        linkedChild: linkedChildName,
        status: 'active',
        is_demo: false,
        must_change_password: true,
        createdAt: new Date().toISOString(),
      };

      usersList.unshift(newUser);

      // Save credential
      dynamicCredentials.set(newUser.email, {
        password: tempPassword,
        must_change_password: true,
        role: newUser.role,
        user: newUser,
      });

      // Update class count
      if (newUser.role === 'student' && newUser.className) {
        const cls = classesList.find((c) => c.name.toLowerCase() === newUser.className.toLowerCase());
        if (cls) cls.studentsCount += 1;
      }

      createdCredentials.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        className: newUser.className,
        temporaryPassword: tempPassword,
      });
    }

    logActivity(req.user, 'batch_users_imported', 'batch', `batch-${Date.now()}`, {
      importedCount: createdCredentials.length,
    });

    res.status(201).json({
      status: 'ok',
      message: `Successfully imported ${createdCredentials.length} users.`,
      importedCount: createdCredentials.length,
      credentials: createdCredentials,
    });
  } catch (err) {
    res.status(500).json({ error: 'CSVImportError', message: err.message });
  }
});

/**
 * 6. POST /api/admin/users/:id/reset-password
 * Admin resets a user's password (generates new temporary password)
 */
router.post('/users/:id/reset-password', (req, res) => {
  try {
    const { id } = req.params;
    const user = usersList.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }

    const newTempPassword = generateTemporaryPassword();
    user.must_change_password = true;

    // Update credential store
    dynamicCredentials.set(user.email.toLowerCase(), {
      password: newTempPassword,
      must_change_password: true,
      role: user.role,
      user,
    });

    logActivity(req.user, 'password_reset', 'user', user.id, {
      name: user.name,
      email: user.email,
    });

    res.json({
      status: 'ok',
      message: `Password reset for ${user.name}.`,
      temporaryPassword: newTempPassword,
      tempPassword: newTempPassword,
    });
  } catch (err) {
    res.status(500).json({ error: 'ResetPasswordError', message: err.message });
  }
});

/**
 * 7. PATCH /api/admin/users/:id/edit
 * Edit user details (name, email, class, linked child)
 */
router.patch('/users/:id/edit', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, className, linkedChild, status } = req.body;

    const user = usersList.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (className !== undefined) user.className = className;
    if (linkedChild !== undefined) user.linkedChild = linkedChild;
    if (status && ['active', 'disabled'].includes(status)) user.status = status;

    if (email && email.trim().toLowerCase() !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'ValidationError', message: 'Invalid email format.' });
      }
      const existing = usersList.find((u) => u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ error: 'DuplicateEmail', message: 'Email already in use.' });
      }
      // Migrate credentials key
      const oldEmail = user.email;
      user.email = email.trim().toLowerCase();
      if (dynamicCredentials.has(oldEmail)) {
        const cred = dynamicCredentials.get(oldEmail);
        dynamicCredentials.delete(oldEmail);
        dynamicCredentials.set(user.email, cred);
      }
    }

    logActivity(req.user, 'user_edited', 'user', user.id, { name: user.name, email: user.email });

    res.json({
      status: 'ok',
      message: `User ${user.name} updated successfully.`,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: 'EditUserError', message: err.message });
  }
});

/**
 * 8. PATCH /api/admin/users/:id/toggle-status
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

    logActivity(req.user, `user_${user.status}`, 'user', user.id, {
      name: user.name,
      status: user.status,
    });

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
 * 9. POST /api/admin/classes
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

    logActivity(req.user, 'class_created', 'class', newClass.id, {
      name: newClass.name,
      subject: newClass.subject,
    });

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
 * 10. POST /api/admin/assign
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

    logActivity(req.user, 'class_assigned', 'class', targetClass.id, {
      userName: targetUser.name,
      role: targetUser.role,
      className: targetClass.name,
    });

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
 * 11. POST /api/admin/link-parent
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

    if (parent.linkedChild && parent.linkedChild.length > 0) {
      if (!parent.linkedChild.includes(student.name)) {
        parent.linkedChild += `, ${student.name}`;
      }
    } else {
      parent.linkedChild = student.name;
    }

    student.parentName = parent.name;

    logActivity(req.user, 'parent_linked', 'link', `${parent.id}-${student.id}`, {
      parentName: parent.name,
      studentName: student.name,
    });

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

/**
 * 12. GET /api/admin/activity-log
 * Returns activity log entries
 */
router.get('/activity-log', (req, res) => {
  res.json({
    status: 'ok',
    totalEntries: activityLog.length,
    activityLog,
  });
});

export default router;
