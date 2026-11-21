import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { generateStudyPlan } from './studyPlannerLogic';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SectionLabel from '../../components/common/SectionLabel';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Bot, 
  Flame, 
  Filter,
  MessageSquare,
  Sparkles
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
  const [teacherClarification, setTeacherClarification] = useState(null);

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
  const handleGenerate = (e, customClarification = undefined) => {
    if (e) e.preventDefault();

    const activeClarification =
      customClarification !== undefined ? customClarification : teacherClarification;

    const generated = generateStudyPlan({
      learningGaps: defaultGaps,
      dailyFreeMinutes,
      sessionDuration,
      examDate: examDate || null,
      startDate: new Date(),
      teacherClarification: activeClarification,
    });

    setPlan(generated);
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`http://localhost:5000/api/teacher/clarifications/student/${currentUser.id}`, {
        headers: {
          'x-user-role': currentUser.role || 'student',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email || '',
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.clarification) {
            setTeacherClarification(data.clarification);
            handleGenerate(null, data.clarification);
          } else {
            handleGenerate(null, null);
          }
        })
        .catch(() => {
          handleGenerate(null, null);
        });
    } else {
      handleGenerate(null, null);
    }
  }, [currentUser]);

  const toggleSessionComplete = (sessionId) => {
    const next = { ...completedSessions, [sessionId]: !completedSessions[sessionId] };
    setCompletedSessions(next);
    localStorage.setItem('learnlens_completed_sessions', JSON.stringify(next));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header Banner */}
      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <SectionLabel>COGNITIVE LOAD AWARE</SectionLabel>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
            Adaptive <span className="text-[#F26522]">Study Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6660] max-w-lg leading-relaxed">
            Sessions are strictly 25–30 minutes to prevent fatigue, with foundational prerequisites scheduled chronologically first.
          </p>
        </div>

        <div className="shrink-0">
          <Button to="/ai-tutor" variant="primary" size="md" showArrow icon={Bot}>
            {t('nav.aiTutor')}
          </Button>
        </div>
      </Card>

      {/* Interactive Planner Controls Form */}
      <form
        onSubmit={handleGenerate}
        className="p-6 sm:p-8 rounded-[24px] bg-[#FBF8F4] border border-[#E3DCD3] card-shadow space-y-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#0D0D0D] border-b border-[#E3DCD3] pb-3">
          <Filter className="w-4 h-4 text-[#F26522]" />
          <span>Customize Your Available Study Time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Daily Free Time Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0D0D0D] flex items-center justify-between">
              <span>Daily Free Time</span>
              <span className="text-[#F26522] font-mono">{dailyFreeMinutes} mins</span>
            </label>
            <div className="flex items-center gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyFreeMinutes(mins)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    dailyFreeMinutes === mins
                      ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-xs'
                      : 'bg-white text-[#6B6660] border-[#E3DCD3] hover:border-[#0D0D0D]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration Selector (25m vs 30m) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0D0D0D] flex items-center justify-between">
              <span>Session Duration</span>
              <span className="text-[#F26522] font-mono">{sessionDuration} mins</span>
            </label>
            <div className="flex items-center gap-2">
              {[25, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSessionDuration(dur)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    sessionDuration === dur
                      ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-xs'
                      : 'bg-white text-[#6B6660] border-[#E3DCD3] hover:border-[#0D0D0D]'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Target Exam Date Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0D0D0D] flex items-center justify-between">
              <span>Target Exam Date (Optional)</span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full py-2 px-3 rounded-full bg-white border border-[#E3DCD3] text-xs font-medium text-[#0D0D0D] focus:outline-none focus:border-[#F26522]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="sm" showArrow>
            Regenerate Adaptive Schedule
          </Button>
        </div>
      </form>

      {/* Plan Summary & Sessions Timeline */}
      {plan && (
        <div className="space-y-6">
          {/* Teacher Recommendation Alert Card if active */}
          {teacherClarification && (
            <div className="p-5 sm:p-6 rounded-[24px] bg-[#FFF3EC] border-2 border-[#F26522]/40 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F26522]/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F26522]/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#F26522]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522]">Teacher Priority Recommendation</span>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0D0D0D]">
                      Guidance from {teacherClarification.teacher_name || 'Your Teacher'}
                    </h3>
                  </div>
                </div>

                <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full self-start sm:self-auto ${
                  teacherClarification.status === 'needs_extra_help'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : teacherClarification.status === 'improve_focus'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {teacherClarification.status === 'needs_extra_help'
                    ? 'Needs Extra Help'
                    : teacherClarification.status === 'improve_focus'
                    ? 'Improve Focus'
                    : 'Doing Well'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#0D0D0D] font-medium italic bg-white/70 p-3 rounded-xl border border-[#F26522]/20">
                "{teacherClarification.comment}"
              </p>

              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] font-bold text-[#6B6660]">Teacher Focus Topics:</span>
                {(teacherClarification.topics || []).map((top, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0D0D0D] text-white"
                  >
                    {top}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Plan KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card padding="sm" hoverLift={false}>
              <div className="text-[11px] text-[#6B6660] font-semibold">Total Sessions</div>
              <div className="font-heading text-2xl font-black text-[#0D0D0D] mt-0.5">
                {plan.totalSessions}
              </div>
            </Card>

            <Card padding="sm" hoverLift={false}>
              <div className="text-[11px] text-[#6B6660] font-semibold">Total Study Time</div>
              <div className="font-heading text-2xl font-black text-[#0D0D0D] mt-0.5">
                {plan.totalMinutes} mins
              </div>
            </Card>

            <Card padding="sm" hoverLift={false}>
              <div className="text-[11px] text-[#6B6660] font-semibold">Session Pace</div>
              <div className="font-heading text-2xl font-black text-[#0D0D0D] mt-0.5">
                {sessionDuration}m/session
              </div>
            </Card>

            <Card padding="sm" hoverLift={false}>
              <div className="text-[11px] text-[#6B6660] font-semibold">Prerequisite Sessions</div>
              <div className="font-heading text-2xl font-black text-[#F26522] mt-0.5">
                {plan.prerequisiteSessionsCount || 2} Scheduled
              </div>
            </Card>
          </div>

          {/* Urgency Alert if exam is near */}
          {plan.isUrgent && (
            <Card padding="sm" className="bg-[#F26522]/10 border-[#F26522] text-[#0D0D0D] flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#F26522]" />
              <div className="text-xs">
                <strong>Exam Proximity Acceleration Active:</strong> Sessions are scheduled compactly to complete prerequisites 48 hours prior to your exam.
              </div>
            </Card>
          )}

          {/* Chronological Sessions Schedule */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#0D0D0D] flex items-center justify-between">
              <span>Your Daily Focused Sessions</span>
              <span className="text-xs text-[#6B6660] font-normal">Strict 25–30 min intervals</span>
            </h3>

            <div className="space-y-3">
              {plan.sessions.map((sess, idx) => {
                const isCompleted = completedSessions[sess.id];
                return (
                  <Card
                    key={sess.id || idx}
                    padding="md"
                    hoverLift={false}
                    className={`transition-all ${
                      isCompleted ? 'bg-white opacity-60' : 'bg-[#FBF8F4]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleSessionComplete(sess.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-[#E3DCD3] hover:border-[#F26522] bg-white'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0D0D0D] text-white">
                              Day {sess.day} • Session {sess.sessionNumber}
                            </span>
                            {sess.isPrerequisite && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F26522]/15 text-[#F26522]">
                                Prerequisite Review
                              </span>
                            )}
                            {sess.isTeacherPriority && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F26522] text-white">
                                Teacher Priority
                              </span>
                            )}
                          </div>

                          <h4 className={`text-base font-bold text-[#0D0D0D] ${isCompleted ? 'line-through text-[#6B6660]' : ''}`}>
                            {sess.topicName}
                          </h4>

                          <p className="text-xs text-[#6B6660]">
                            {sess.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <span className="text-xs font-mono font-bold text-[#0D0D0D] bg-[#F5F0EA] px-3 py-1 rounded-full border border-[#E3DCD3]">
                          {sess.duration} mins
                        </span>

                        <Button
                          to="/ai-tutor"
                          variant="secondary"
                          size="sm"
                          icon={Bot}
                        >
                          Practice with AI
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
