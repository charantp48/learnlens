import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  Users, 
  AlertTriangle, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const students = [
    { id: '1', name: 'Priya Sharma', score: '50%', weakTopic: 'Quadratic Equations', rootCause: 'Factoring Gaps', status: 'Needs Attention' },
    { id: '2', name: 'Rahul Verma', score: '55%', weakTopic: 'Quadratic Equations', rootCause: 'Factoring Gaps', status: 'Needs Attention' },
    { id: '3', name: 'Ananya Sen', score: '82%', weakTopic: 'None', rootCause: 'Mastered', status: 'On Track' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 p-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Teacher Portal
              </span>
              <span className="text-xs text-slate-400">Class 9-A Mathematics</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome, {currentUser?.full_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            3 Students Enrolled
          </span>
        </div>
      </div>

      {/* Class Diagnostic Alert */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-300">
            Class-Wide Foundational Pattern Detected
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            66% of Class 9-A students are stumbling in <strong>Quadratic Equations</strong> not because of the quadratic formula, but because of foundational deficits in <strong>Class 8 Algebraic Factoring</strong>. We recommend a 20-minute whole-class review on middle-term splitting.
          </p>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Class 9-A Student Diagnostic Roster</span>
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Diagnostic Score</th>
                <th className="py-3 px-4">Primary Weak Topic</th>
                <th className="py-3 px-4">Diagnosed Root Cause</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono">{s.score}</td>
                  <td className="py-3.5 px-4">{s.weakTopic}</td>
                  <td className="py-3.5 px-4 text-amber-300 font-medium">{s.rootCause}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === 'On Track' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-medium transition-colors">
                      Leave Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
