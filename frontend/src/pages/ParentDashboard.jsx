import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  HeartHandshake, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Lightbulb, 
  BookOpen,
  Send,
  Check,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';

export default function ParentDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ackMessage, setAckMessage] = useState('');
  const [ackSubmitted, setAckSubmitted] = useState(false);

  useEffect(() => {
    async function fetchParentData() {
      try {
        const studentId = currentUser?.child_id || '00000000-0000-0000-0000-000000000001';
        const res = await fetch(`http://localhost:5000/api/parent/child/${studentId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Parent API unreachable, falling back');
      }

      // Default demo fallback
      setData({
        profile: {
          full_name: 'Priya Sharma',
          grade: 'Class 9-A',
          school: 'Kendriya Vidyalaya No. 1',
        },
        overview: {
          diagnosticScore: 50,
          status: 'Needs Foundational Review',
          plainEnglishSummary: t('parent.plainEnglish'),
        },
        topicScores: [
          { topic: 'Numbers', score: 88 },
          { topic: 'Real No.', score: 76 },
          { topic: 'Factoring', score: 45 },
          { topic: 'Quadratics', score: 33 },
          { topic: 'Linear Eq', score: 85 },
          { topic: 'Geometry', score: 82 },
        ],
        studySchedule: [
          {
            id: 'sess-1',
            title: 'Foundational Review: Middle-Term Splitting',
            duration: '30 mins',
            day: 'Today',
            time: '5:00 PM',
            status: 'Upcoming',
            statusColor: 'amber',
          },
          {
            id: 'sess-2',
            title: 'Algebraic Identities Practice (a+b)² & (a-b)²',
            duration: '25 mins',
            day: 'Tomorrow',
            time: '5:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
          {
            id: 'sess-3',
            title: 'Applying Factoring to Quadratic Equations',
            duration: '25 mins',
            day: 'Thursday',
            time: '6:00 PM',
            status: 'Scheduled',
            statusColor: 'slate',
          },
        ],
        feedback: [
          {
            id: 'tf-1',
            teacherName: 'Mr. Rajesh Rao',
            subject: 'Class 9 Mathematics',
            date: 'Today',
            message: 'Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete her scheduled sessions on LearnLens.',
          },
        ],
      });
      setLoading(false);
    }

    fetchParentData();
  }, [t, currentUser]);

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/parent/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.child_id || '00000000-0000-0000-0000-000000000001',
          parentName: currentUser?.full_name || 'Sunita Sharma',
          message: ackMessage,
        }),
      });
    } catch (err) {
      console.warn('Ack sent locally');
    }

    setAckSubmitted(true);
    setTimeout(() => {
      setAckSubmitted(false);
      setAckMessage('');
    }, 3000);
  };

  const childName = data?.profile?.full_name || currentUser?.child_name || 'Priya Sharma';

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita'}
            alt={currentUser?.full_name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-bg-base border-2 border-accent/40 p-1 shrink-0 object-cover"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dark-banner text-white">
                {t('parent.viewBadge')}
              </span>
              <span className="text-xs font-medium text-text-muted">
                {t('parent.child', { childName })} ({data?.profile?.grade || 'Class 9-A'})
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight mt-1">
              {t('parent.greeting', { name: currentUser?.full_name || 'Sunita Sharma' })}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-bg-base border border-border-warm text-xs font-semibold text-text-muted shrink-0">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Kendriya Vidyalaya No. 1</span>
        </div>
      </Card>

      {/* Jargon-Free Summary Card */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div>
            <SectionLabel text="PARENT INSIGHT" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-text-main flex items-center gap-2 mt-1">
              <Lightbulb className="w-5 h-5 text-accent" />
              <span>{t('parent.summaryTitle')}</span>
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFF3EC] text-accent border border-accent/20">
            Jargon-Free
          </span>
        </div>
        <div className="bg-bg-base p-5 sm:p-6 rounded-2xl border border-border-warm text-sm text-text-main leading-relaxed">
          {t('parent.plainEnglish')}
        </div>
      </Card>

      {/* Progress Chart: Topic Mastery at a Glance */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-warm pb-4">
          <div>
            <SectionLabel text="PROGRESS AT A GLANCE" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>{childName}'s Subject Strengths</span>
            </h3>
          </div>
          <span className="text-xs text-text-muted font-medium">
            Passing Threshold: <strong className="text-accent">60%</strong>
          </span>
        </div>

        <div className="h-48 sm:h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.topicScores || []} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
              <XAxis dataKey="topic" tick={{ fill: '#6B6660', fontSize: 11, fontFamily: 'Inter' }} interval={0} stroke="#E3DCD3" />
              <YAxis tick={{ fill: '#6B6660', fontSize: 11, fontFamily: 'Inter' }} domain={[0, 100]} stroke="#E3DCD3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBF8F4',
                  borderColor: '#E3DCD3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#0D0D0D',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(val) => [`${val}%`, 'Score']}
              />
              <ReferenceLine y={60} stroke="#F26522" strokeDasharray="4 4" />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {(data?.topicScores || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score < 60 ? '#F26522' : '#0D0D0D'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Teacher's Note & Quick Acknowledgment */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-5 border-l-4 border-l-accent">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-text-main">
            <MessageSquare className="w-5 h-5 text-accent" />
            <span>{t('parent.teacherNoteTitle')}: Mr. Rajesh Rao (Maths)</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-bg-base text-text-muted border border-border-warm">
            Today
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-border-warm text-xs sm:text-sm text-text-main italic leading-relaxed">
          "{data?.feedback?.[0]?.message || 'Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete her scheduled sessions on LearnLens.'}"
        </div>

        {/* Parent Reply / Acknowledgment */}
        <form onSubmit={handleAcknowledge} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-accent" />
              <span>{t('parent.acknowledgeBtn')}</span>
            </label>
            <input
              type="text"
              value={ackMessage}
              onChange={(e) => setAckMessage(e.target.value)}
              placeholder={t('parent.replyPlaceholder')}
              className="w-full p-3.5 rounded-2xl bg-bg-base border border-border-warm text-xs sm:text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent"
              required
            />
          </div>

          {ackSubmitted ? (
            <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{t('parent.ackSuccess')}</span>
            </div>
          ) : (
            <Button
              type="submit"
              variant="primary"
              icon={<Send className="w-4 h-4" />}
            >
              {t('parent.sendAck')}
            </Button>
          )}
        </form>
      </Card>

      {/* Active 25-30 Min Study Schedule */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div>
            <SectionLabel text="FOCUSED SCHEDULE" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2 mt-1">
              <Calendar className="w-5 h-5 text-accent" />
              <span>{t('parent.studyScheduleTitle')}</span>
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-dark-banner text-white">
            {t('parent.sessionsPlanned', { count: data?.studySchedule?.length || 3 })}
          </span>
        </div>

        <div className="space-y-3">
          {(data?.studySchedule || []).map((sess) => (
            <div
              key={sess.id}
              className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-border-warm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm hover:border-accent/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-bold text-text-main flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {sess.title}
                </div>
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span>{sess.day} • {sess.time}</span>
                  <span className="font-semibold text-text-main">({sess.duration})</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                sess.statusColor === 'amber'
                  ? 'bg-[#FFF3EC] text-accent border border-accent/20'
                  : 'bg-surface text-text-muted border border-border-warm'
              }`}>
                {sess.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
