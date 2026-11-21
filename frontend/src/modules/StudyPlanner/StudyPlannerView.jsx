import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { generateStudyPlan } from './studyPlannerLogic';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Flame, 
  BookOpen,
  Filter
} from 'lucide-react';

export default function StudyPlannerView() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // Planner Configuration State
  const [dailyFreeMinutes, setDailyFreeMinutes] = useState(60);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [examDate, setExamDate] = useState('');
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('learnlens_completed_sessions');
    return saved ? JSON.parse(saved) : {};
  });

  // Current Plan State
  const [plan, setPlan] = useState(null);

  // Default gaps from student diagnostic
  const defaultGaps = [
    {
      topicId: '10000000-0000-0000-0000-000000000004',
      topicName: 'Quadratic Equations',
      accuracy: 33,
      rootPrerequisiteId: '10000000-0000-0000-0000-000000000003',
      rootPrerequisiteName: 'Algebraic Identities & Factoring',
    },
  ];

  // Generate / Regenerate plan
  const handleGenerate = (e) => {
    if (e) e.preventDefault();

    const generated = generateStudyPlan({
      learningGaps: defaultGaps,
      dailyFreeMinutes,
      sessionDuration,
      examDate: examDate || null,
      startDate: new Date(),
    });

    setPlan(generated);
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const toggleSessionComplete = (sessionId) => {
    const next = { ...completedSessions, [sessionId]: !completedSessions[sessionId] };
    setCompletedSessions(next);
    localStorage.setItem('learnlens_completed_sessions', JSON.stringify(next));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Prerequisite-First Adaptive Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('nav.planner')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Sessions are strictly 25–30 minutes to prevent fatigue, with foundational prerequisites scheduled first.
          </p>
        </div>

        <Link
          to="/ai-tutor"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all hover:scale-105 shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>{t('nav.aiTutor')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Interactive Planner Controls Form */}
      <form
        onSubmit={handleGenerate}
        className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-5"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-700/50 pb-3">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Customize Your Available Study Time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Daily Free Time Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Daily Free Time</span>
              <span className="text-indigo-400 font-mono font-bold">{dailyFreeMinutes} mins</span>
            </label>
            <div className="flex items-center gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyFreeMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    dailyFreeMinutes === mins
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration Selector (25m vs 30m) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Session Duration</span>
              <span className="text-emerald-400 font-mono font-bold">{sessionDuration} mins</span>
            </label>
            <div className="flex items-center gap-2">
              {[25, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSessionDuration(dur)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    sessionDuration === dur
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-900/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {dur} mins {dur === 25 ? '(Pomodoro)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Target Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Update Adaptive Schedule
          </button>
        </div>
      </form>

      {/* Exam Urgency Alert (if date chosen is <= 7 days) */}
      {plan?.isExamUrgent && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="text-amber-300 font-bold">Exam Proximity Alert: </strong>
            <span className="text-slate-300">
              Your exam is {plan.daysUntilExam} day(s) away! Sessions have been packed into daily slots to ensure complete prerequisite review before test day.
            </span>
          </div>
        </div>
      )}

      {/* Plan Timeline Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Your Scheduled Study Sessions ({plan?.totalSessions || 0})</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Total Time: <strong className="text-white">{plan?.totalMinutes || 0} mins</strong>
          </span>
        </div>

        <div className="space-y-3">
          {plan?.sessions.map((session, index) => {
            const isCompleted = !!completedSessions[session.id];

            return (
              <div
                key={session.id || index}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : session.isPrerequisiteRoot
                    ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Section: Details */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSessionComplete(session.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-600 hover:border-emerald-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          Day {session.dayNumber} • {session.scheduledDate}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {session.durationMinutes} mins
                        </span>
                        {session.isPrerequisiteRoot && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Prerequisite Root Fix
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {session.topicName}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {session.focusNotes}
                      </p>
                    </div>
                  </div>

                  {/* Right Section: Action */}
                  <div className="sm:self-center shrink-0 pl-9 sm:pl-0">
                    <Link
                      to={`/ai-tutor?topic=${encodeURIComponent(session.topicName)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Practice with AI</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
