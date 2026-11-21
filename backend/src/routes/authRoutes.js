import express from 'express';
import { MOCK_USERS } from '../config/mockData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Supported Demo Credentials
const DEMO_CREDENTIALS = {
  'priya.student@learnlens.demo': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'student@learnlens.demo': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'priya.sharma@learnlens.edu': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'rajesh.teacher@learnlens.demo': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'teacher@learnlens.demo': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'rajesh.rao@learnlens.edu': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'sunita.parent@learnlens.demo': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'parent@learnlens.demo': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'sunita.sharma@learnlens.edu': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'admin@learnlens.demo': { role: 'admin', password: 'Admin@123', profile: MOCK_USERS.admin },
  'admin@learnlens.edu': { role: 'admin', password: 'Admin@123', profile: MOCK_USERS.admin },
};

// 1. Interactive Server-Side Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Server-side validation
  if (!email || !email.trim()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Email address is required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Please provide a valid email format.',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Password must be at least 6 characters long.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const demoAccount = DEMO_CREDENTIALS[normalizedEmail];

  // In demo/test mode: verify credentials
  if (demoAccount) {
    if (password === demoAccount.password || password === 'Demo@123' || password === 'Student@123' || password === 'Teacher@123' || password === 'Parent@123' || password === 'Admin@123') {
      const mockToken = `learnlens-jwt-${demoAccount.role}-${Date.now()}`;
      return res.json({
        status: 'ok',
        token: mockToken,
        user: {
          ...demoAccount.profile,
          role: demoAccount.role,
        },
        message: `Welcome back, ${demoAccount.profile.full_name}!`,
      });
    } else {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Incorrect password for this account. Please verify or use the quick demo button.',
      });
    }
  }

  // Fallback for unlisted emails in demo mode
  return res.status(401).json({
    error: 'AccountNotFound',
    message: 'No registered user found with this email. Use one of the 4 demo accounts below to explore.',
  });
});

// 2. List demo profiles for quick evaluation
router.get('/demo-users', (req, res) => {
  res.json({
    status: 'ok',
    demoProfiles: [
      { role: 'student', email: 'priya.student@learnlens.demo', name: 'Priya Sharma (Student)' },
      { role: 'teacher', email: 'rajesh.teacher@learnlens.demo', name: 'Mr. Rajesh Rao (Teacher)' },
      { role: 'parent', email: 'sunita.parent@learnlens.demo', name: 'Sunita Sharma (Parent)' },
      { role: 'admin', email: 'admin@learnlens.demo', name: 'Dr. Vikram Malhotra (Admin)' },
    ],
  });
});

// 3. Check current session
router.get('/me', requireAuth, (req, res) => {
  res.json({
    status: 'ok',
    user: req.user,
  });
});

// 4. Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Session terminated successfully.',
  });
});

export default router;
