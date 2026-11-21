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
  Sparkles
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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita'}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-2xl bg-pink-500/20 border-2 border-pink-400 p-1 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                {t('parent.viewBadge')}
              </span>
              <span className="text-xs text-slate-400">
                {t('parent.child', { childName })} ({data?.profile?.grade || 'Class 9-A'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {t('parent.greeting', { name: currentUser?.full_name || 'Sunita Sharma' })}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Kendriya Vidyalaya No. 1</span>
        </div>
      </div>

      {/* Jargon-Free Summary Card */}
      <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-pink-400">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">
            {t('parent.summaryTitle')}
          </h2>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          {t('parent.plainEnglish')}
        </p>
      </div>

      {/* Progress Chart: Topic Mastery at a Glance */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">{childName}'s Subject Strengths</h3>
          </div>
          <span className="text-xs text-slate-400">Passing Threshold: 60%</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.topicScores || []} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
              <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Score']}
              />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {(data?.topicScores || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score < 50 ? '#f43f5e' : entry.score < 60 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher's Note & Quick Acknowledgment */}
      <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <MessageSquare className="w-5 h-5" />
            <span>{t('parent.teacherNoteTitle')}: Mr. Rajesh Rao (Maths)</span>
          </div>
          <span className="text-xs text-indigo-300 font-mono">Today</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-200 italic leading-relaxed">
          "{data?.feedback?.[0]?.message || 'Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete her scheduled sessions on LearnLens.'}"
        </div>

        {/* Parent Reply / Acknowledgment */}
        <form onSubmit={handleAcknowledge} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              <span>{t('parent.acknowledgeBtn')}</span>
            </label>
            <input
              type="text"
              value={ackMessage}
              onChange={(e) => setAckMessage(e.target.value)}
              placeholder={t('parent.replyPlaceholder')}
              className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          {ackSubmitted ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t('parent.ackSuccess')}</span>
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('parent.sendAck')}</span>
            </button>
          )}
        </form>
      </div>

      {/* Active 25-30 Min Study Schedule */}
      <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              {t('parent.studyScheduleTitle')}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {t('parent.sessionsPlanned', { count: data?.studySchedule?.length || 3 })}
          </span>
        </div>

        <div className="space-y-3">
          {(data?.studySchedule || []).map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-600 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {sess.title}
                </div>
                <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{sess.day} • {sess.time}</span>
                  <span>({sess.duration})</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                sess.statusColor === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-700 text-slate-300 border border-slate-600'
              }`}>
                {sess.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
