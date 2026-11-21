import React, { createContext, useContext, useState, useEffect } from 'react';

// Demo profiles matching database/seed.sql
export const DEMO_PROFILES = {
  student: {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Priya Sharma',
    email: 'priya.student@learnlens.demo',
    role: 'student',
    class_name: 'Class 9-A',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    school: 'Kendriya Vidyalaya',
  },
  teacher: {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Mr. Rajesh Rao',
    email: 'rajesh.teacher@learnlens.demo',
    role: 'teacher',
    subject: 'Class 9 Mathematics',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    school: 'Kendriya Vidyalaya',
  },
  parent: {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Sunita Sharma',
    email: 'sunita.parent@learnlens.demo',
    role: 'parent',
    linked_student_id: '00000000-0000-0000-0000-000000000001',
    child_name: 'Priya Sharma (Class 9-A)',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Dr. Vikram Malhotra',
    email: 'admin@learnlens.demo',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    school: 'Kendriya Vidyalaya (Main Campus)',
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('learnlens_user');
      const expiry = localStorage.getItem('learnlens_session_expiry');

      if (saved && expiry) {
        if (Date.now() > parseInt(expiry, 10)) {
          // Session expired politely
          localStorage.removeItem('learnlens_user');
          localStorage.removeItem('learnlens_session_expiry');
          localStorage.removeItem('learnlens_token');
          return null;
        }
        return JSON.parse(saved);
      }
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Authenticate with Email & Password
  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const user = data.user;
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      setCurrentUser(user);
      localStorage.setItem('learnlens_user', JSON.stringify(user));
      localStorage.setItem('learnlens_token', data.token || 'demo-token');
      localStorage.setItem('learnlens_session_expiry', expiryTime.toString());

      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Quick 1-Click Demo Login
  const loginDemo = (role) => {
    const profile = DEMO_PROFILES[role];
    if (profile) {
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      setCurrentUser(profile);
      localStorage.setItem('learnlens_user', JSON.stringify(profile));
      localStorage.setItem('learnlens_token', `learnlens-jwt-${role}-${Date.now()}`);
      localStorage.setItem('learnlens_session_expiry', expiryTime.toString());
      return profile;
    }
    return null;
  };

  // Sign out cleanly
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('learnlens_user');
    localStorage.removeItem('learnlens_token');
    localStorage.removeItem('learnlens_session_expiry');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'parent': return '/parent';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithCredentials,
    loginDemo,
    logout,
    getDashboardPath,
    isAuthenticated: !!currentUser,
    isStudent: currentUser?.role === 'student',
    isTeacher: currentUser?.role === 'teacher',
    isParent: currentUser?.role === 'parent',
    isAdmin: currentUser?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
