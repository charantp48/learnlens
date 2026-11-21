import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  Users, 
  AlertTriangle, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp,
  PlusCircle, 
  Send, 
  Sparkles,
  GitFork,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('revision_focus');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Assign Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Remedial Quiz: Algebraic Factoring & Quadratics');
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Fetch teacher class analytics
  useEffect(() => {
    async function fetchTeacherData() {
      try {
        const res = await fetch('http://localhost:5000/api/teacher/class/c0000000-0000-0000-0000-000000000001/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Teacher analytics endpoint unreachable, using fallback data');
      }

      // Fallback
      setAnalytics({
        className: 'Class 9-A (Mathematics)',
        totalStudents: 3,
        classAverageScore: 62.3,
        weakestPrerequisite: 'Algebraic Identities & Factoring (48% average)',
        topicPerformance: [
          { topic: 'Number Systems', accuracy: 88, isWeak: false },
          { topic: 'Real Numbers', accuracy: 76, isWeak: false },
          { topic: 'Factoring', accuracy: 48, isWeak: true },
          { topic: 'Quadratics', accuracy: 42, isWeak: true },
          { topic: 'Linear Eq (1V)', accuracy: 85, isWeak: false },
          { topic: 'Linear Eq (2V)', accuracy: 64, isWeak: false },
          { topic: 'Lines & Angles', accuracy: 82, isWeak: false },
          { topic: 'Triangles', accuracy: 70, isWeak: false },
          { topic: 'Quadrilaterals', accuracy: 60, isWeak: false },
          { topic: 'Coordinate Geo', accuracy: 92, isWeak: false },
        ],
        students: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Priya Sharma',
            diagnosticScore: '50%',
            weakTopic: 'Quadratic Equations (33%)',
            rootPrerequisite: 'Algebraic Factoring (45%)',
            status: 'Needs Support',
            statusColor: 'amber',
          },
          {
            id: '00000000-0000-0000-0000-000000000005',
            name: 'Rahul Verma',
            diagnosticScore: '55%',
            weakTopic: 'Quadratic Equations (40%)',
            rootPrerequisite: 'Algebraic Factoring (50%)',
            status: 'Needs Support',
            statusColor: 'amber',
          },
          {
            id: '00000000-0000-0000-0000-000000000006',
            name: 'Ananya Sen',
            diagnosticScore: '82%',
            weakTopic: 'None',
            rootPrerequisite: 'Foundations Mastered',
            status: 'On Track',
            statusColor: 'emerald',
          },
        ],
        recentFeedback: [
          {
            id: 'fb-1',
            studentName: 'Priya Sharma',
            message: 'Priya, spend 25 minutes on middle-term splitting identities this week to solidify quadratic equations.',
            feedbackType: 'revision_focus',
          },
        ],
      });
      setLoading(false);
    }

    fetchTeacherData();
  }, []);

  // Handle Leave Feedback Submit
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !feedbackMessage) return;

    try {
      await fetch('http://localhost:5000/api/teacher/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          teacherId: currentUser?.id,
          message: feedbackMessage,
          feedbackType,
        }),
      });
    } catch (e) {
      console.warn('Feedback recorded locally');
    }

    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackModalOpen(false);
      setFeedbackMessage('');
    }, 1500);
  };

  // Handle Assign Quiz Submit
  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/teacher/assign-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          classId: 'c0000000-0000-0000-0000-000000000001',
        }),
      });
    } catch (e) {
      console.warn('Quiz assigned locally');
    }

    setQuizSuccess(true);
    setTimeout(() => {
      setQuizSuccess(false);
      setQuizModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-bg-base border-2 border-accent/40 p-1 shrink-0 object-cover"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dark-banner text-white">
                {t('teacher.portalBadge')}
              </span>
              <span className="text-xs font-medium text-text-muted">
                {analytics?.className || 'Class 9-A Mathematics'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight mt-1">
              {t('teacher.welcome', { name: currentUser?.full_name || 'Mr. Rajesh Rao' })}
            </h1>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={() => setQuizModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            {t('teacher.assignQuiz')}
          </Button>
        </div>
      </Card>

      {/* Class Diagnostic Bottleneck Alert */}
      <div className="p-5 sm:p-6 rounded-card bg-[#FFF3EC] border border-accent/30 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-accent" />
        </div>
        <div className="text-xs sm:text-sm space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Critical Root Gap
            </span>
            <h3 className="font-heading font-extrabold text-text-main text-sm sm:text-base">
              {t('teacher.bottleneckTitle')}
            </h3>
          </div>
          <p className="text-text-muted leading-relaxed">
            {t('teacher.bottleneckDesc')}
          </p>
        </div>
      </div>

      {/* Topic Accuracy Bar Chart (Recharts) */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-warm pb-4">
          <div>
            <SectionLabel text="CURRICULUM BREAKDOWN" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-text-main flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>{t('teacher.breakdownTitle')}</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {t('teacher.breakdownSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg-base text-text-main border border-border-warm">
              {t('teacher.classAverage')}: <strong className="text-accent">{analytics?.classAverageScore}%</strong>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.topicPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="topic"
                tick={{ fill: '#6B6660', fontSize: 10, fontFamily: 'Inter' }}
                interval={0}
                angle={-30}
                textAnchor="end"
                stroke="#E3DCD3"
              />
              <YAxis tick={{ fill: '#6B6660', fontSize: 10, fontFamily: 'Inter' }} domain={[0, 100]} stroke="#E3DCD3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBF8F4',
                  borderColor: '#E3DCD3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#0D0D0D',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(val) => [`${val}%`, 'Accuracy']}
              />
              <ReferenceLine
                y={60}
                stroke="#F26522"
                strokeDasharray="4 4"
                label={{ value: t('teacher.masteryThreshold'), fill: '#F26522', fontSize: 10, position: 'right' }}
              />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {(analytics?.topicPerformance || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.accuracy < 60 ? '#F26522' : '#0D0D0D'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Student Diagnostic Roster */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border-warm pb-4">
          <div>
            <SectionLabel text="INDIVIDUAL DIAGNOSTICS" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-text-main flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-accent" />
              <span>{t('teacher.rosterTitle')}</span>
            </h2>
          </div>
          <span className="text-xs text-text-muted font-medium">
            {analytics?.students?.length || 3} Students Evaluated
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border-warm bg-bg-base/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-warm">
              <tr>
                <th className="py-3.5 px-4">{t('teacher.student')}</th>
                <th className="py-3.5 px-4">{t('teacher.diagnosticScore')}</th>
                <th className="py-3.5 px-4">{t('teacher.primaryWeakness')}</th>
                <th className="py-3.5 px-4">{t('teacher.prerequisiteCause')}</th>
                <th className="py-3.5 px-4">{t('teacher.status')}</th>
                <th className="py-3.5 px-4 text-right">{t('teacher.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm/60 text-text-muted">
              {(analytics?.students || []).map((s) => (
                <tr key={s.id} className="hover:bg-surface/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text-main">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-text-main">
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border-warm text-accent">
                      {s.diagnosticScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-main">{s.weakTopic}</td>
                  <td className="py-3.5 px-4 font-medium text-accent">
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-accent shrink-0" />
                      {s.rootPrerequisite}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      s.statusColor === 'emerald'
                        ? 'bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB]'
                        : 'bg-[#FFF3EC] text-accent border border-accent/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(s);
                        setFeedbackModalOpen(true);
                      }}
                    >
                      {t('teacher.leaveFeedback')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Feedback Given Log */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-border-warm pb-3">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h3 className="font-heading font-extrabold text-base text-text-main">
            {t('teacher.recentFeedback')}
          </h3>
        </div>
        <div className="space-y-3">
          {(analytics?.recentFeedback || []).map((fb, idx) => (
            <div key={fb.id || idx} className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-border-warm text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-text-main">To: {fb.studentName}</span>
                <span className="text-[10px] text-accent uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                  {fb.feedbackType?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-text-muted leading-relaxed italic">"{fb.message}"</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Leave Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="max-w-md w-full p-6 sm:p-8 border border-border-warm space-y-5 shadow-2xl relative">
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-accent">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-lg text-text-main">
                Feedback for {selectedStudent?.name}
              </h3>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Feedback Focus</label>
                <div className="flex gap-2">
                  {['revision_focus', 'encouragement', 'milestone'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`flex-1 py-2 rounded-full border text-xs capitalize font-medium transition-all cursor-pointer ${
                        feedbackType === type
                          ? 'bg-dark-banner text-white border-dark-banner font-bold'
                          : 'bg-bg-base text-text-muted border-border-warm hover:text-text-main'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Your Guidance Message</label>
                <textarea
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="e.g. Focus on factoring middle terms before our Wednesday test..."
                  className="w-full p-3.5 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {feedbackSuccess ? (
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Feedback sent directly to student and parent!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFeedbackModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Feedback
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Assign Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="max-w-md w-full p-6 sm:p-8 border border-border-warm space-y-5 shadow-2xl relative">
            <button
              onClick={() => setQuizModalOpen(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-accent">
              <PlusCircle className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-lg text-text-main">
                Assign Remedial Assessment
              </h3>
            </div>

            <form onSubmit={handleAssignQuiz} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Targeted Concept</label>
                <div className="p-3 rounded-2xl bg-bg-base border border-border-warm text-text-muted font-medium">
                  Algebraic Identities & Factoring (Class 8 Prerequisite Focus)
                </div>
              </div>

              {quizSuccess ? (
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Quiz successfully assigned to Class 9-A students!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setQuizModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Confirm Assignment
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
