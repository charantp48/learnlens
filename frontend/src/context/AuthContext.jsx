import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const saved = localStorage.getItem('learnlens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginDemo = (role) => {
    const profile = DEMO_PROFILES[role];
    if (profile) {
      setCurrentUser(profile);
      localStorage.setItem('learnlens_user', JSON.stringify(profile));
      return profile;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('learnlens_user');
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
