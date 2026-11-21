import express from 'express';
import { MOCK_USERS } from '../config/mockData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List demo profiles for quick 1-click evaluation
router.get('/demo-users', (req, res) => {
  res.json({
    status: 'ok',
    demoProfiles: MOCK_USERS,
  });
});

// Check current session
router.get('/me', requireAuth, (req, res) => {
  res.json({
    status: 'ok',
    user: req.user,
  });
});

export default router;
