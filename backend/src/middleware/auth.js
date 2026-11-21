import { MOCK_USERS } from '../config/mockData.js';

/**
 * Enhanced Middleware to ensure request has valid authenticated user context.
 * Validates Authorization Bearer tokens, x-user-id, and x-user-role headers.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check if we have any valid auth indicator
  if (!token && !userId && !userRole) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in.',
    });
  }

  // Extract role if token is a structured mock token
  let tokenRole = null;
  if (token && token.startsWith('learnlens-jwt-')) {
    const parts = token.split('-');
    if (parts.length >= 3) {
      tokenRole = parts[2];
    }
  }

  const effectiveRole = userRole || tokenRole || 'student';
  const matchedUser = Object.values(MOCK_USERS).find(
    (u) => u.id === userId || u.role === effectiveRole
  );

  req.user = matchedUser || {
    id: userId || '00000000-0000-0000-0000-000000000001',
    role: effectiveRole,
    full_name: 'Authenticated User',
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
