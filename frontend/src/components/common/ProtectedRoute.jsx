import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Guard
 * 1. Unauthenticated users are redirected to /login.
 * 2. Authenticated users attempting to access another role's area
 *    are immediately redirected to their own designated dashboard.
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { currentUser, isAuthenticated, getDashboardPath } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role isolation: if role is not allowed, redirect to own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  }

  return children;
}
