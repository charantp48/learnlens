import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Phase 1 placeholder page components (will be populated in corresponding phases)
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
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="quiz" element={<PhasePlaceholder title="Student Diagnostic Quiz Flow" phaseNumber={4} />} />
        <Route path="gaps" element={<PhasePlaceholder title="Prerequisite Gap Finder" phaseNumber={5} />} />
        <Route path="planner" element={<PhasePlaceholder title="Adaptive Study Planner" phaseNumber={6} />} />
        <Route path="ai-tutor" element={<PhasePlaceholder title="Responsible AI Learning Assistant" phaseNumber={7} />} />
        <Route path="teacher" element={<PhasePlaceholder title="Teacher Class Portal & Heatmaps" phaseNumber={8} />} />
        <Route path="parent" element={<PhasePlaceholder title="Parent Progress View" phaseNumber={9} />} />
        <Route path="admin" element={<PhasePlaceholder title="Administrator Console" phaseNumber={10} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
