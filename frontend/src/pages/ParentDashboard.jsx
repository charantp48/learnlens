import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  HeartHandshake, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Lightbulb, 
  BookOpen 
} from 'lucide-react';

export default function ParentDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/60 border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-14 h-14 rounded-2xl bg-pink-500/20 border-2 border-pink-400 p-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                Parent View
              </span>
              <span className="text-xs text-slate-400">Child: {currentUser?.child_name}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Namaste, {currentUser?.full_name}
            </h1>
          </div>
        </div>
      </div>

      {/* Simple, Jargon-Free Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
        <div className="flex items-center gap-2 text-pink-400">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">How is Priya Doing? (Simple Summary)</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Priya shows strong confidence in <strong>Geometry and Numbers (85%+)</strong>. In Algebra, she scored 50%, but here is the good news: her difficulty in 9th-grade equations is simply due to a minor gap in 8th-grade factoring. Once she completes her 3 short study sessions, she will be back on track!
        </p>
      </div>

      {/* Teacher's Note to Parent */}
      <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <MessageSquare className="w-4 h-4" />
          <span>Note from Mr. Rajesh Rao (Maths Teacher)</span>
        </div>
        <p className="text-xs text-slate-200 italic leading-relaxed">
          "Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete the scheduled sessions on LearnLens."
        </p>
      </div>

      {/* Study Plan Status */}
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Priya's Free-Time Study Schedule</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
            3 Sessions Planned
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white">Prerequisite Review: Algebraic Factoring</div>
              <div className="text-slate-400 mt-0.5">Today • 5:00 PM (30 minutes)</div>
            </div>
            <span className="text-amber-400 font-medium">Scheduled</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white">Prerequisite Review: Polynomial Identities</div>
              <div className="text-slate-400 mt-0.5">Tomorrow • 5:00 PM (25 minutes)</div>
            </div>
            <span className="text-slate-400 font-medium">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
