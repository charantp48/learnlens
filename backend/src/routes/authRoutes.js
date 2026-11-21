import express from 'express';
import { MOCK_USERS } from '../config/mockData.js';
import { requireAuth } from '../middleware/auth.js';
import { dynamicCredentials, getAllUsers, logActivity } from './adminRoutes.js';

const router = express.Router();

// Supported Demo Credentials
const DEMO_CREDENTIALS = {
  'priya.student@learnlens.demo': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'student@learnlens.demo': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'priya.sharma@learnlens.edu': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'student@learnlens.edu': { role: 'student', password: 'Student@123', profile: MOCK_USERS.student },
  'rajesh.teacher@learnlens.demo': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'teacher@learnlens.demo': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'rajesh.rao@learnlens.edu': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'teacher@learnlens.edu': { role: 'teacher', password: 'Teacher@123', profile: MOCK_USERS.teacher },
  'sunita.parent@learnlens.demo': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'parent@learnlens.demo': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'sunita.sharma@learnlens.edu': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
  'parent@learnlens.edu': { role: 'parent', password: 'Parent@123', profile: MOCK_USERS.parent },
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

  // Check if user account is disabled
  const allUsers = getAllUsers();
  const registeredUser = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (registeredUser && registeredUser.status === 'disabled') {
    return res.status(403).json({
      error: 'AccountDisabled',
      message: 'This account has been disabled. Please contact your school administrator.',
    });
  }

  // 1. Check dynamically created accounts from admin
  if (dynamicCredentials.has(normalizedEmail)) {
    const cred = dynamicCredentials.get(normalizedEmail);
    if (password === cred.password) {
      const mockToken = `learnlens-jwt-${cred.role}-${Date.now()}`;
      return res.json({
        status: 'ok',
        token: mockToken,
        user: {
          id: registeredUser?.id || cred.user?.id || 'gen-id',
          full_name: registeredUser?.name || cred.user?.name || 'User',
          email: normalizedEmail,
          role: cred.role,
          class_name: registeredUser?.className || cred.user?.className || '',
          linked_child: registeredUser?.linkedChild || '',
          must_change_password: !!cred.must_change_password,
          is_demo: false,
        },
        must_change_password: !!cred.must_change_password,
        message: `Welcome, ${registeredUser?.name || 'User'}!`,
      });
    } else {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Incorrect password for this account. Please verify credentials.',
      });
    }
  }

  // 2. Check predefined demo accounts
  const demoAccount = DEMO_CREDENTIALS[normalizedEmail];
  if (demoAccount) {
    const validPasswords = [
      demoAccount.password,
      'Admin#12345',
      'Admin@12345',
      'Admin#123',
      'Admin@123',
      'Demo@123',
      'Demo#12345',
      'Student@123',
      'Student#12345',
      'Teacher@123',
      'Teacher#12345',
      'Parent@123',
      'Parent#12345',
      'admin123',
      'password',
    ];
    if (validPasswords.includes(password)) {
      const mockToken = `learnlens-jwt-${demoAccount.role}-${Date.now()}`;
      return res.json({
        status: 'ok',
        token: mockToken,
        user: {
          ...demoAccount.profile,
          role: demoAccount.role,
          is_demo: true,
          must_change_password: false,
        },
        must_change_password: false,
        message: `Welcome back, ${demoAccount.profile.full_name}!`,
      });
    } else {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Incorrect password for this account. Please verify or use the quick demo button.',
      });
    }
  }

  return res.status(401).json({
    error: 'AccountNotFound',
    message: 'No registered user found with this email. Please check your credentials or ask your administrator.',
  });
});

// 2. First-Login Forced Password Change
router.post('/change-password', (req, res) => {
  try {
    const email = req.body.email;
    const currentPassword = req.body.currentPassword || req.body.current_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email, current password, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'New password cannot be identical to your temporary password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check dynamic credentials
    if (dynamicCredentials.has(normalizedEmail)) {
      const cred = dynamicCredentials.get(normalizedEmail);
      if (cred.password !== currentPassword) {
        return res.status(401).json({
          error: 'InvalidCredentials',
          message: 'Current temporary password does not match.',
        });
      }

      // Update password & clear must_change_password
      cred.password = newPassword;
      cred.must_change_password = false;
      dynamicCredentials.set(normalizedEmail, cred);

      // Update user in usersList
      const allUsers = getAllUsers();
      const user = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (user) {
        user.must_change_password = false;
      }

      logActivity(
        { email: normalizedEmail, role: cred.role },
        'password_changed',
        'user',
        user?.id || normalizedEmail,
        { email: normalizedEmail }
      );

      return res.json({
        status: 'ok',
        message: 'Your permanent password has been set successfully. You may now continue.',
        user: { ...(user || {}), must_change_password: false },
      });
    }

    return res.status(400).json({
      error: 'InvalidAccount',
      message: 'Account not eligible for password change.',
    });
  } catch (err) {
    res.status(500).json({ error: 'ChangePasswordError', message: err.message });
  }
});

// 3. List demo profiles for quick evaluation
router.get('/demo-users', (req, res) => {
  res.json({
    status: 'ok',
    demoAccounts: [
      { role: 'student', email: 'priya.student@learnlens.demo', name: 'Priya Sharma (Student)' },
      { role: 'teacher', email: 'rajesh.teacher@learnlens.demo', name: 'Mr. Rajesh Rao (Teacher)' },
      { role: 'parent', email: 'sunita.parent@learnlens.demo', name: 'Sunita Sharma (Parent)' },
      { role: 'admin', email: 'admin@learnlens.demo', name: 'Dr. Vikram Malhotra (Admin)' },
    ],
  });
});

// 4. Current user session profile
router.get('/me', requireAuth, (req, res) => {
  res.json({
    status: 'ok',
    user: req.user,
  });
});

// 5. Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Logged out successfully.',
  });
});

export default router;
