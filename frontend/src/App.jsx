import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';

// Role Dashboards
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder for remaining phases (Quiz, Gaps, Planner, AI Tutor)
function PhasePlaceholder({ title, phaseNumber }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
      <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
        Scheduled for Phase {phaseNumber}
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        This module is scaffolded in the project structure and will be connected in its dedicated phase.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />

        {/* Student Routes (Protected) */}
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <PhasePlaceholder title="Student Diagnostic Quiz Flow" phaseNumber={4} />
            </ProtectedRoute>
          }
        />
        <Route
          path="gaps"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <PhasePlaceholder title="Prerequisite Gap Finder" phaseNumber={5} />
            </ProtectedRoute>
          }
        />
        <Route
          path="planner"
          element={
            <ProtectedRoute allowedRoles={['student', 'parent', 'teacher', 'admin']}>
              <PhasePlaceholder title="Adaptive Study Planner" phaseNumber={6} />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-tutor"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <PhasePlaceholder title="Responsible AI Learning Assistant" phaseNumber={7} />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes (Protected) */}
        <Route
          path="teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent Routes (Protected) */}
        <Route
          path="parent"
          element={
            <ProtectedRoute allowedRoles={['parent', 'admin']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes (Protected) */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
