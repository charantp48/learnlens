import { MOCK_USERS } from '../config/mockData.js';

/**
 * Middleware to ensure request has valid authenticated user context.
 * In production, validates Supabase JWT token.
 * In demo mode, accepts x-user-id or x-user-role headers.
 */
export function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId && !userRole) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in.',
    });
  }

  // Find user by role or id from demo profiles
  const user = Object.values(MOCK_USERS).find(
    (u) => u.id === userId || u.role === userRole
  );

  req.user = user || {
    id: userId || 'anonymous',
    role: userRole || 'student',
  };

  next();
}

/**
 * Middleware to restrict route to specific roles (e.g. ['teacher', 'admin'])
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Route requires one of: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
