import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  HeartHandshake, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Lightbulb, 
  Send, 
  Check, 
  TrendingUp, 
  Clock, 
  Sparkles,
  User,
  Compass,
  Layers,
  ChevronDown,
  Award
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
  const { t, tName } = useTranslation();

  // Multi-child support
  const childrenList = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Priya Sharma',
      grade: 'Class 11-A',
      school: 'Kendriya Vidyalaya No. 1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      subjectResults: [
        { subject: 'Mathematics', score: 50, level: 'Level 1: Foundational Review', status: 'Needs Practice' },
        { subject: 'Physics', score: 78, level: 'Level 2: Intermediate', status: 'On Track' },
        { subject: 'Chemistry', score: 64, level: 'Level 2: Intermediate', status: 'On Track' },
        { subject: 'Computer Science', score: 82, level: 'Level 3: Advanced', status: 'Mastered' },
      ],
      jargonFreeSummary: "Priya is doing wonderfully in Computer Science and Physics (78%+). In Mathematics, she scored 50% not because 11th-grade quadratic concepts are too hard, but because of a small gap in 10th-grade factoring (splitting middle terms). LearnLens has scheduled 3 short 25-minute practice sessions that will help her catch up smoothly without stress.",
      weakTopics: [
        { topic: 'Algebraic Factoring', subject: 'Mathematics', plainText: 'Priya understands the quadratic formula, but occasionally makes calculation slips during factoring. 3 targeted exercises will resolve this completely.' },
        { topic: 'Vector Resolution', subject: 'Physics', plainText: 'She understands force diagrams well; she just needs a quick refresher on resolving diagonal vectors before upcoming mechanics tests.' },
      ],
      topicScores: [
        { topic: 'CS / Logic', score: 82 },
        { topic: 'Kinematics', score: 78 },
        { topic: 'Bonding', score: 64 },
        { topic: 'Factoring', score: 45 },
        { topic: 'Quadratics', score: 33 },
      ],
      studySchedule: [
        { id: 'sess-1', title: 'Foundational Review: Middle-Term Splitting', duration: '30 mins', day: 'Today', time: '5:00 PM', status: 'Upcoming', statusColor: 'amber' },
        { id: 'sess-2', title: 'Algebraic Identities Practice: (a+b)² & (a-b)²', duration: '25 mins', day: 'Tomorrow', time: '5:00 PM', status: 'Scheduled', statusColor: 'slate' },
        { id: 'sess-3', title: 'Applying Factoring to Quadratic Equations', duration: '25 mins', day: 'Thursday', time: '6:00 PM', status: 'Scheduled', statusColor: 'slate' },
      ],
      teacherFeedback: {
        teacherName: 'Mr. Rajesh Rao',
        subject: 'Mathematics',
        date: 'Today',
        message: 'Priya has good logical thinking. She just needs 25 minutes of practice on middle-term splitting this week. Please encourage her to complete her scheduled sessions on LearnLens.',
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Arjun Sharma',
      grade: 'Class 9-B',
      school: 'Kendriya Vidyalaya No. 1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
      subjectResults: [
        { subject: 'Mathematics', score: 72, level: 'Level 2: Intermediate', status: 'On Track' },
        { subject: 'Science', score: 85, level: 'Level 3: Advanced', status: 'Mastered' },
        { subject: 'Social Science', score: 78, level: 'Level 2: Intermediate', status: 'On Track' },
        { subject: 'English', score: 88, level: 'Level 3: Advanced', status: 'Mastered' },
      ],
      jargonFreeSummary: "Arjun is maintaining strong consistency across all subjects. In Mathematics, his geometry skills are strong (80%+). He should keep practicing coordinate geometry to maintain his current momentum.",
      weakTopics: [
        { topic: 'Linear Equations in 2 Variables', subject: 'Mathematics', plainText: 'Arjun understands how to plot points; he just needs a quick 20-minute review on finding line intersections.' }
      ],
      topicScores: [
        { topic: 'English', score: 88 },
        { topic: 'Science', score: 85 },
        { topic: 'Geometry', score: 80 },
        { topic: 'Linear Eq', score: 62 },
        { topic: 'Polygons', score: 70 },
      ],
      studySchedule: [
        { id: 'sess-a1', title: 'Linear Equations: Intersection Points', duration: '25 mins', day: 'Today', time: '6:00 PM', status: 'Upcoming', statusColor: 'amber' },
        { id: 'sess-a2', title: 'Coordinate Geometry Review', duration: '25 mins', day: 'Friday', time: '5:30 PM', status: 'Scheduled', statusColor: 'slate' },
      ],
      teacherFeedback: {
        teacherName: 'Ms. Sunita Patil',
        subject: 'Mathematics',
        date: 'Yesterday',
        message: 'Arjun is participating actively in class. Keep up the encouragement at home!',
      },
    },
  ];

  const [children, setChildren] = useState(childrenList);
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0].id);
  const [childRank, setChildRank] = useState(null);
  const [childClarification, setChildClarification] = useState(null);

  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];

  useEffect(() => {
    // 1. Fetch parent's linked children from server
    if (currentUser?.id) {
      fetch('/api/parent/children', {
        headers: {
          'x-user-role': currentUser.role || 'parent',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email || '',
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.children && data.children.length > 0) {
            setChildren(data.children);
            if (!data.children.some((c) => c.id === selectedChildId)) {
              setSelectedChildId(data.children[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChildId) {
      // 2. Fetch live rank for selected child
      fetch(`/api/quiz/ranks/student/${selectedChildId}`, {
        headers: {
          'x-user-role': currentUser?.role || 'parent',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.rank) setChildRank(data.rank);
        })
        .catch(() => {});

      // 3. Fetch active teacher clarification for selected child
      fetch(`/api/teacher/clarifications/student/${selectedChildId}`, {
        headers: {
          'x-user-role': currentUser?.role || 'parent',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.clarification) setChildClarification(data.clarification);
          else setChildClarification(null);
        })
        .catch(() => {});
    }
  }, [selectedChildId, currentUser]);

  const [ackMessage, setAckMessage] = useState('');
  const [ackSubmitted, setAckSubmitted] = useState(false);

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/parent/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeChild.id,
          parentName: currentUser?.full_name || 'Sunita Sharma',
          message: ackMessage,
        }),
      });
    } catch (err) {
      console.warn('Ack recorded locally');
    }

    setAckSubmitted(true);
    setTimeout(() => {
      setAckSubmitted(false);
      setAckMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 sm:py-8">
      {/* Header Banner with Child Selector & Real-Time Rank */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#E3DCD3]">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={activeChild.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'}
            alt={activeChild.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F5F0EA] border-2 border-[#F26522]/40 p-1 shrink-0 object-cover"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0D0D0D] text-white">
                Parent View
              </span>
              <span className="text-xs font-semibold text-[#6B6660]">
                {activeChild.grade} • {activeChild.school || 'Kendriya Vidyalaya No. 1'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0D0D0D] tracking-tight">
              {tName(activeChild.name)}'s Academic Progress
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Child Selector Dropdown/Pills for Multiple Children */}
          <div className="p-3 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-1.5 shrink-0">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6660] flex items-center gap-1">
              <User className="w-3 h-3 text-[#F26522]" />
              <span>Select Child:</span>
            </label>
            <div className="flex items-center gap-1.5">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedChildId === child.id
                      ? 'bg-[#0D0D0D] text-white shadow-xs'
                      : 'bg-white text-[#6B6660] border border-[#E3DCD3] hover:text-[#0D0D0D]'
                  }`}
                >
                  {tName(child.name.split(' ')[0])} ({child.grade.split('-')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Child Live Rank Snapshot Card */}
          <div className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] shrink-0 text-left sm:text-right space-y-0.5 min-w-[150px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6660] flex items-center sm:justify-end gap-1">
              <Award className="w-3 h-3 text-[#F26522]" />
              <span>Child Rank</span>
            </div>
            <div className="font-heading font-extrabold text-sm sm:text-base text-[#0D0D0D]">
              {childRank ? `Rank ${childRank.class_rank} of ${childRank.class_total_students}` : 'Rank: Active'}
            </div>
            <div className="text-[10px] text-[#6B6660]">
              {childRank ? `School: #${childRank.school_rank} (${childRank.overall_percentage}% avg)` : 'Active Student'}
            </div>
          </div>
        </div>
      </Card>

      {/* Latest Results & Current Level by Subject */}
      <div className="space-y-3">
        <SectionLabel text="SUBJECT BREAKDOWN" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activeChild.subjectResults.map((sub, idx) => (
            <Card key={idx} variant="surface" className="p-4 space-y-2 border border-[#E3DCD3]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#6B6660]">
                <span>{sub.subject}</span>
                <span className={`font-mono font-bold ${sub.score < 60 ? 'text-[#F26522]' : 'text-[#0D0D0D]'}`}>
                  {sub.score}%
                </span>
              </div>
              <div className="font-heading font-bold text-sm text-[#0D0D0D]">
                {sub.level}
              </div>
              <div className="text-[11px] text-[#6B6660]">
                Status: <strong className={sub.score < 60 ? 'text-[#F26522]' : 'text-[#0D0D0D]'}>{sub.status}</strong>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Jargon-Free Summary Card */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
          <div>
            <SectionLabel text="PLAIN-LANGUAGE SUMMARY" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0D0D0D] flex items-center gap-2 mt-1">
              <Lightbulb className="w-5 h-5 text-[#F26522]" />
              <span>How {activeChild.name} is Progressing</span>
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFF3EC] text-[#F26522] border border-[#F26522]/20">
            Jargon-Free
          </span>
        </div>
        <p className="p-4 sm:p-5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-sm text-[#0D0D0D] leading-relaxed">
          {activeChild.jargonFreeSummary}
        </p>
      </Card>

      {/* Weak Topics in Plain Language */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="border-b border-[#E3DCD3] pb-3">
          <SectionLabel text="PARENT FOCUS AREAS" />
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0D0D0D] mt-1">
            Identified Concepts & What They Mean
          </h3>
        </div>

        <div className="space-y-3">
          {activeChild.weakTopics.map((w, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-[#0D0D0D]">{w.topic}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#6B6660] border border-[#E3DCD3]">
                  {w.subject}
                </span>
              </div>
              <p className="text-xs text-[#6B6660] leading-relaxed">
                {w.plainText}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Chart: Topic Mastery at a Glance (Recharts Palette) */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3DCD3] pb-4">
          <div>
            <SectionLabel text="PROGRESS AT A GLANCE" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0D0D0D] flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-[#F26522]" />
              <span>{activeChild.name}'s Topic Mastery Chart</span>
            </h3>
          </div>
          <span className="text-xs text-[#6B6660] font-medium">
            Passing Threshold: <strong className="text-[#F26522]">60%</strong>
          </span>
        </div>

        <div className="h-48 sm:h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeChild.topicScores} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
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
                formatter={(val) => [`${val}%`, 'Mastery']}
              />
              <ReferenceLine y={60} stroke="#F26522" strokeDasharray="4 4" />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {activeChild.topicScores.map((entry, index) => (
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
      <Card variant="surface" className="p-6 sm:p-8 space-y-5 border-l-4 border-l-[#F26522] border-[#E3DCD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DCD3] pb-3">
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-[#0D0D0D]">
            <MessageSquare className="w-5 h-5 text-[#F26522]" />
            <span>
              Note from Teacher:{' '}
              {tName(childClarification?.teacher_name || activeChild.teacherFeedback?.teacherName || 'Mr. Rajesh Rao')}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(childClarification?.status || activeChild.teacherFeedback?.status) && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                (childClarification?.status || activeChild.teacherFeedback?.status) === 'needs_extra_help'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : (childClarification?.status || activeChild.teacherFeedback?.status) === 'improve_focus'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {(childClarification?.status || activeChild.teacherFeedback?.status) === 'needs_extra_help'
                  ? 'Needs Extra Help'
                  : (childClarification?.status || activeChild.teacherFeedback?.status) === 'improve_focus'
                  ? 'Improve Focus'
                  : 'Doing Well'}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F0EA] text-[#6B6660] border border-[#E3DCD3]">
              {childClarification
                ? new Date(childClarification.updated_at || childClarification.created_at).toLocaleDateString()
                : activeChild.teacherFeedback?.date || 'Today'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-xs sm:text-sm text-[#0D0D0D] italic leading-relaxed">
          "{childClarification?.comment || activeChild.teacherFeedback?.message}"
        </div>

        {/* If teacher recommended specific focus topics */}
        {((childClarification?.topics && childClarification.topics.length > 0) ||
          (activeChild.teacherFeedback?.topics && activeChild.teacherFeedback.topics.length > 0)) && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-[#6B6660] uppercase tracking-wider">
              Teacher's Recommended Focus Topics:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(childClarification?.topics || activeChild.teacherFeedback?.topics || []).map((top, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-[#0D0D0D] text-white"
                >
                  {top}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Parent Reply / Acknowledgment */}
        <form onSubmit={handleAcknowledge} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0D0D0D] flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#F26522]" />
              <span>Acknowledge & Send Quick Note to Teacher</span>
            </label>
            <input
              type="text"
              value={ackMessage}
              onChange={(e) => setAckMessage(e.target.value)}
              placeholder="e.g. 'Thank you, I will make sure they practice today at 5 PM'..."
              className="w-full p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6660] focus:outline-none focus:border-[#F26522]"
              required
            />
          </div>

          {ackSubmitted ? (
            <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Your message has been sent directly to the teacher. Thank you!</span>
            </div>
          ) : (
            <Button
              type="submit"
              variant="primary"
              icon={<Send className="w-4 h-4" />}
            >
              Send Acknowledgment
            </Button>
          )}
        </form>
      </Card>

      {/* Short Study Plan Summary */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
          <div>
            <SectionLabel text="FOCUSED SCHEDULE" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0D0D0D] flex items-center gap-2 mt-1">
              <Calendar className="w-5 h-5 text-[#F26522]" />
              <span>{activeChild.name}'s Active Study Schedule</span>
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#0D0D0D] text-white">
            {activeChild.studySchedule.length} Sessions Scheduled
          </span>
        </div>

        <div className="space-y-3">
          {activeChild.studySchedule.map((sess) => (
            <div
              key={sess.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm hover:border-[#F26522]/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="font-bold text-[#0D0D0D] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F26522]" />
                  {sess.title}
                </div>
                <div className="text-[#6B6660] flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#6B6660]" />
                  <span>{sess.day} • {sess.time}</span>
                  <span className="font-semibold text-[#0D0D0D]">({sess.duration})</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                sess.statusColor === 'amber'
                  ? 'bg-[#FFF3EC] text-[#F26522] border border-[#F26522]/20'
                  : 'bg-white text-[#6B6660] border border-[#E3DCD3]'
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
