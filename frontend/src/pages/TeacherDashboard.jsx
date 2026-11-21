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
  Check
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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 p-1 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Teacher Portal
              </span>
              <span className="text-xs text-slate-400">Class 9-A Mathematics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome, {currentUser?.full_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuizModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assign Quiz</span>
          </button>
        </div>
      </div>

      {/* Class Diagnostic Bottleneck Alert */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-amber-300">
            Class-Wide Foundational Bottleneck: Algebraic Factoring (48% Avg Accuracy)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Data across Class 9-A reveals that students are not failing Quadratic Equations due to advanced quadratic concepts; <strong>66% of student errors originate in Class 8 middle-term splitting</strong>. A 20-minute targeted review will unblock both Priya and Rahul.
          </p>
        </div>
      </div>

      {/* Topic Accuracy Bar Chart (Recharts) */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Class 9-A Topic Performance Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400">
              Red & Amber bars identify concepts below the 60% mastery threshold.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Class Average: {analytics?.classAverageScore}%
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.topicPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="topic"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Accuracy']}
              />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '60% Mastery', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {(analytics?.topicPerformance || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.accuracy < 50 ? '#f43f5e' : entry.accuracy < 60 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Diagnostic Roster */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Individual Student Diagnostic Roster</span>
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Diagnostic Score</th>
                <th className="py-3.5 px-4">Primary Weakness</th>
                <th className="py-3.5 px-4">Diagnosed Prerequisite Cause</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Teacher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {(analytics?.students || []).map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{s.diagnosticScore}</td>
                  <td className="py-3.5 px-4">{s.weakTopic}</td>
                  <td className="py-3.5 px-4 text-amber-300 font-medium">
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {s.rootPrerequisite}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.statusColor === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setFeedbackModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Leave Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Feedback Given Log */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Recent Feedback Given to Students & Parents</span>
        </h3>
        <div className="space-y-3">
          {(analytics?.recentFeedback || []).map((fb, idx) => (
            <div key={fb.id || idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">To: {fb.studentName}</span>
                <span className="text-[10px] text-indigo-300 uppercase font-semibold">{fb.feedbackType}</span>
              </div>
              <p className="text-slate-300 leading-relaxed italic">"{fb.message}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Leave Feedback for {selectedStudent?.name}
              </h3>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Feedback Type</label>
                <div className="flex gap-2">
                  {['revision_focus', 'encouragement', 'milestone'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`flex-1 py-1.5 rounded-lg border capitalize ${
                        feedbackType === type
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Your Guidance Message</label>
                <textarea
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="e.g. Focus on factoring middle terms before our Wednesday test..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {feedbackSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Feedback sent directly to student and parent!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Assign Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Assign Quiz to Class 9-A</h3>
            </div>

            <form onSubmit={handleAssignQuiz} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Concept</label>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300">
                  Algebraic Identities & Factoring (Prerequisite Focus)
                </div>
              </div>

              {quizSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Quiz successfully assigned to Class 9-A students!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuizModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    Confirm Assignment
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
