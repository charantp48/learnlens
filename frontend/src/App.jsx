import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import StyleGuide from './pages/StyleGuide';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';

// Role Dashboards
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Interactive Modules
import QuizContainer from './modules/Quiz/QuizContainer';
import LearningGapView from './modules/LearningGap/LearningGapView';
import StudyPlannerView from './modules/StudyPlanner/StudyPlannerView';
import AIChatView from './modules/AIChat/AIChatView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="styleguide" element={<StyleGuide />} />

        {/* Student Journey Routes (Protected) */}
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
              <QuizContainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="gaps"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <LearningGapView />
            </ProtectedRoute>
          }
        />
        <Route
          path="planner"
          element={
            <ProtectedRoute allowedRoles={['student', 'parent', 'teacher', 'admin']}>
              <StudyPlannerView />
            </ProtectedRoute>
          }
        />
        <Route
          path="ai-tutor"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <AIChatView />
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
