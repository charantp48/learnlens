import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  BookOpen, 
  GitFork, 
  Calendar, 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-800 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400 p-1 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {currentUser?.class_name || 'Class 9-A'}
              </span>
              <span className="text-xs text-slate-400">Class 9 Mathematics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {currentUser?.full_name}! 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Your personalized learning roadmap is active. Ready to turn weak topics into strengths?
            </p>
          </div>
        </div>

        <Link
          to="/quiz"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('nav.quiz')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Snapshot KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Diagnostic Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">50% <span className="text-xs font-normal text-slate-400">(5/10)</span></div>
          <p className="text-[11px] text-amber-400 flex items-center gap-1 pt-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 1 prerequisite gap identified
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Root Prerequisite Gap</span>
            <GitFork className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 truncate">Algebraic Factoring</div>
          <p className="text-[11px] text-slate-400 pt-1">
            Blocking Quadratic Equations
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Study Plan</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">3 Sessions</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 25-30 mins per session
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>AI Practice Coach</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-300">Active & Ready</div>
          <p className="text-[11px] text-slate-400 pt-1">
            Safe offline fallback verified
          </p>
        </div>
      </div>

      {/* Core Student Journey Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Your 4-Step Learning Journey</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1: Quiz */}
          <Link
            to="/quiz"
            className="group p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 1</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Take Diagnostic Quiz
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test your knowledge with confidence tags (Sure / Not Sure / Guessing). Guessing is recognized and weighted.
              </p>
            </div>
          </Link>

          {/* Step 2: Gap Finder */}
          <Link
            to="/gaps"
            className="group p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/50 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Step 2</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Prerequisite Gap Finder
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                View your prerequisite tree. See exactly which foundational topic is causing errors in current coursework.
              </p>
            </div>
          </Link>

          {/* Step 3: Study Planner */}
          <Link
            to="/planner"
            className="group p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/50 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 3</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Adaptive Study Planner
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your free hours. The algorithm schedules bite-sized 25-minute sessions tackling root gaps first.
              </p>
            </div>
          </Link>

          {/* Step 4: AI Tutor */}
          <Link
            to="/ai-tutor"
            className="group p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/50 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Step 4</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                AI Learning Assistant
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get step-by-step hints and practice questions from Gemini AI with offline fallback reliability.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
