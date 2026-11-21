import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  School, 
  Users, 
  BookOpen, 
  AlertTriangle,
  Building2
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 p-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Administrator Console
              </span>
              <span className="text-xs text-slate-400">School-Wide Academic Health</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              {currentUser?.full_name} (Principal)
            </h1>
          </div>
        </div>
      </div>

      {/* School-Wide Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="text-slate-400 text-xs">Total Cohorts</div>
          <div className="text-2xl font-bold text-white">1 Class <span className="text-xs text-slate-400">(Class 9-A)</span></div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="text-slate-400 text-xs">Enrolled Students</div>
          <div className="text-2xl font-bold text-white">3 Students</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="text-slate-400 text-xs">Faculty</div>
          <div className="text-2xl font-bold text-white">1 Teacher <span className="text-xs text-slate-400">(Mr. Rao)</span></div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="text-slate-400 text-xs">School Average Score</div>
          <div className="text-2xl font-bold text-indigo-400">62.3%</div>
        </div>
      </div>

      {/* Curriculum Health Notice */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Curriculum Health: Prerequisite Bottlenecks</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Diagnostic analysis shows that <strong>Class 8 Algebraic Factoring</strong> is the single largest prerequisite bottleneck across Class 9 Mathematics cohorts. Addressing this in remedial sessions can prevent 70% of downstream failures in Quadratic and Polynomial chapters.
        </p>
      </div>
    </div>
  );
}
