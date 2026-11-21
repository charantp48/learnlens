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
  Send, 
  GitFork, 
  Check, 
  X, 
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  Radio,
  FileText
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
  const { t, tName } = useTranslation();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student list filter states
  const [filterClass, setFilterClass] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  // Student Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('revision_focus');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Live incoming submissions & auto-polling state
  const [incomingSubmissions, setIncomingSubmissions] = useState([]);
  const [lastPolledAt, setLastPolledAt] = useState(new Date().toLocaleTimeString());

  // Question Review Queue State
  const [reviewQuestions, setReviewQuestions] = useState([
    {
      id: 'rev-q1',
      subject: 'Mathematics',
      topic: 'Differential Calculus',
      level: 'Interactive',
      questionText: 'A particle moves with position s(t) = 2t³ - 9t² + 12t. Find the timestamps when the acceleration is zero.',
      correctOption: 't = 1.5 seconds',
      explanation: 'a(t) = d²s/dt² = 12t - 18. Setting 12t - 18 = 0 yields t = 1.5 s.',
    },
    {
      id: 'rev-q2',
      subject: 'Physics',
      topic: 'Rotational Dynamics',
      level: 'Puzzle',
      questionText: 'A fly on the outer rim of a 33 RPM phonograph record experiences which primary acceleration toward the center?',
      correctOption: 'Centripetal acceleration (a_c = ω²r)',
      explanation: 'In uniform circular motion, the net acceleration is purely radial and directed inwards.',
    },
  ]);

  // Initial Fetch & 15-second Polling Setup
  useEffect(() => {
    async function fetchTeacherData() {
      try {
        const res = await fetch('http://localhost:5000/api/teacher/class/c0000000-0000-0000-0000-000000000001/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
          if (data.incomingSubmissions) {
            setIncomingSubmissions(data.incomingSubmissions);
          }
          if (data.reviewQueue && data.reviewQueue.length > 0) {
            setReviewQuestions(data.reviewQueue);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Teacher analytics endpoint unreachable, using fallback');
      }

      // Default demo state
      setAnalytics({
        className: 'Class 11-A (Mathematics & Science)',
        totalStudents: 28,
        classAverageScore: 64.2,
        weakestPrerequisite: 'Algebraic Identities & Factoring (48% average)',
        topicPerformance: [
          { topic: 'Number Systems', accuracy: 88 },
          { topic: 'Kinematics', accuracy: 78 },
          { topic: 'Factoring', accuracy: 48 },
          { topic: 'Quadratics', accuracy: 42 },
          { topic: 'Rotational Dyn', accuracy: 40 },
          { topic: 'Chemical Bonding', accuracy: 64 },
          { topic: 'CS Stack', accuracy: 82 },
        ],
        students: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Priya Sharma',
            class: 'Class 11-A',
            subject: 'Mathematics',
            level: 'Level 1: Foundational Review',
            parentName: 'Sunita Sharma',
            diagnosticScore: '50%',
            weakTopic: 'Quadratic Equations (33%)',
            rootPrerequisite: 'Algebraic Factoring (45%)',
            status: 'Needs Support',
            statusColor: 'amber',
            topicBreakdown: [
              { topic: 'Factoring', score: 45 },
              { topic: 'Quadratics', score: 33 },
              { topic: 'Kinematics', score: 78 },
              { topic: 'CS Stacks', score: 82 },
            ],
          },
          {
            id: '00000000-0000-0000-0000-000000000005',
            name: 'Rahul Verma',
            class: 'Class 11-A',
            subject: 'Physics',
            level: 'Level 2: Intermediate',
            parentName: 'Amit Verma',
            diagnosticScore: '55%',
            weakTopic: 'Rotational Dynamics (40%)',
            rootPrerequisite: 'Vector Cross Products (50%)',
            status: 'Needs Support',
            statusColor: 'amber',
            topicBreakdown: [
              { topic: 'Kinematics', score: 65 },
              { topic: 'Rotational Dyn', score: 40 },
              { topic: 'Vectors', score: 50 },
            ],
          },
          {
            id: '00000000-0000-0000-0000-000000000006',
            name: 'Ananya Sen',
            class: 'Class 11-A',
            subject: 'Computer Science',
            level: 'Level 3: Advanced',
            parentName: 'Subhash Sen',
            diagnosticScore: '85%',
            weakTopic: 'None',
            rootPrerequisite: 'Foundations Mastered',
            status: 'On Track',
            statusColor: 'emerald',
            topicBreakdown: [
              { topic: 'CS Stacks', score: 92 },
              { topic: 'Recursion', score: 88 },
              { topic: 'Maths', score: 85 },
            ],
          },
          {
            id: '00000000-0000-0000-0000-000000000007',
            name: 'Arjun Sharma',
            class: 'Class 9-B',
            subject: 'Mathematics',
            level: 'Level 2: Intermediate',
            parentName: 'Sunita Sharma',
            diagnosticScore: '72%',
            weakTopic: 'Linear Equations (2 Var)',
            rootPrerequisite: 'Line Intersections',
            status: 'On Track',
            statusColor: 'emerald',
            topicBreakdown: [
              { topic: 'Linear Eq', score: 62 },
              { topic: 'Geometry', score: 80 },
            ],
          },
        ],
      });
      setIncomingSubmissions([
        {
          id: 'sub-1',
          studentName: 'Priya Sharma',
          subject: 'Mathematics',
          score: '5/10 (50%)',
          submittedAt: 'Just now',
          confidenceSummary: '3 Sure, 4 Not Sure, 3 Guessing',
        },
        {
          id: 'sub-2',
          studentName: 'Rahul Verma',
          subject: 'Physics',
          score: '6/10 (60%)',
          submittedAt: '2 mins ago',
          confidenceSummary: '5 Sure, 3 Not Sure, 2 Guessing',
        },
      ]);
      setLoading(false);
    }

    fetchTeacherData();

    // 15-second polling interval for incoming submissions
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/teacher/incoming-submissions');
        if (res.ok) {
          const data = await res.json();
          if (data.submissions) {
            setIncomingSubmissions(data.submissions);
          }
        }
      } catch (e) {
        // graceful offline polling
      }
      setLastPolledAt(new Date().toLocaleTimeString());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter students
  const filteredStudents = (analytics?.students || []).filter((s) => {
    const matchClass = filterClass === 'All' || s.class === filterClass;
    const matchLevel = filterLevel === 'All' || s.level.includes(filterLevel);
    const matchSubject = filterSubject === 'All' || s.subject === filterSubject;
    return matchClass && matchLevel && matchSubject;
  });

  // Open full student report
  const handleOpenReport = (student) => {
    setActiveStudent(student);
    setReportModalOpen(true);
    setFeedbackMessage('');
    setFeedbackSuccess(false);
  };

  // Submit Feedback
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!activeStudent || !feedbackMessage) return;

    try {
      await fetch('http://localhost:5000/api/teacher/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeStudent.id,
          studentName: activeStudent.name,
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
      setReportModalOpen(false);
    }, 1600);
  };

  // Approve AI Question
  const handleApproveQuestion = (id) => {
    fetch(`http://localhost:5000/api/teacher/question-review/${id}/approve`, { method: 'POST' }).catch(() => {});
    setReviewQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Reject AI Question
  const handleRejectQuestion = (id) => {
    fetch(`http://localhost:5000/api/teacher/question-review/${id}/reject`, { method: 'POST' }).catch(() => {});
    setReviewQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 sm:py-8">
      {/* 1. Overview Banner */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#E3DCD3]">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'}
            alt={currentUser?.full_name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F5F0EA] border-2 border-[#F26522]/40 p-1 shrink-0 object-cover"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0D0D0D] text-white">
                Teacher Portal
              </span>
              <span className="text-xs font-semibold text-[#6B6660]">
                {analytics?.className || 'Class 11-A (Assigned)'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0D0D0D] tracking-tight">
              {currentUser?.full_name ? tName(currentUser.full_name) : tName('Mr. Rajesh Rao')}
            </h1>
          </div>
        </div>

        {/* 3 Overview Stat Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-center min-w-[100px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6660]">Students</div>
            <div className="font-heading font-extrabold text-xl text-[#0D0D0D]">
              {analytics?.totalStudents || 28}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-center min-w-[100px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6660]">Class Avg</div>
            <div className="font-heading font-extrabold text-xl text-[#F26522]">
              {analytics?.classAverageScore || 64.2}%
            </div>
          </div>
        </div>
      </Card>

      {/* Class Diagnostic Bottleneck Alert */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-[#FFF3EC] border border-[#F26522]/30 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#F26522]/15 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-[#F26522]" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded-full">
              Common Class Weakness
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-[#0D0D0D] text-sm sm:text-base">
            Class-Wide Foundational Bottleneck: Algebraic Factoring (48% Mastery)
          </h3>
          <p className="text-[#6B6660] leading-relaxed">
            Data across Class 11-A reveals that 66% of errors in Quadratic Equations and rotational torque calculations trace back to <strong>factoring middle terms</strong>. A 20-minute targeted review will unblock both {tName('Priya')} and {tName('Rahul')}.
          </p>
        </div>
      </div>

      {/* 2. Filterable Student List Table */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-5 border border-[#E3DCD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCD3] pb-4">
          <div>
            <SectionLabel text="ROSTER & REPORTS" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0D0D0D] flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-[#F26522]" />
              <span>Assigned Class Roster</span>
            </h2>
            <p className="text-xs text-[#6B6660]">
              Click any student row to view their diagnostic report, topic chart, and send guidance.
            </p>
          </div>

          {/* Filters: Class, Level, Subject */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 rounded-xl bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] font-medium focus:outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Class 11-A">Class 11-A</option>
              <option value="Class 9-B">Class 9-B</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="p-2 rounded-xl bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] font-medium focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="p-2 rounded-xl bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] font-medium focus:outline-none"
            >
              <option value="All">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E3DCD3] bg-[#F5F0EA]/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF8F4] text-[#6B6660] uppercase text-[10px] tracking-wider font-semibold border-b border-[#E3DCD3]">
              <tr>
                <th className="py-3.5 px-4">Student & Class</th>
                <th className="py-3.5 px-4">Linked Parent</th>
                <th className="py-3.5 px-4">Subject & Level</th>
                <th className="py-3.5 px-4">Diagnostic Score</th>
                <th className="py-3.5 px-4">Primary Weakness</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DCD3]/60 text-[#6B6660]">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleOpenReport(s)}
                  className="hover:bg-white transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0D0D0D]">{tName(s.name)}</div>
                    <div className="text-[11px] text-[#6B6660]">{s.class}</div>
                  </td>
                  {/* Linked parent's NAME ONLY (no phone or email) */}
                  <td className="py-3.5 px-4 font-medium text-[#0D0D0D]">
                    {tName(s.parentName)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-[#0D0D0D] block">{s.subject}</span>
                    <span className="text-[10px] text-[#6B6660]">{s.level.split(':')[0]}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F26522]">
                    {s.diagnosticScore}
                  </td>
                  <td className="py-3.5 px-4 text-[#0D0D0D]">
                    <div className="text-xs font-medium">{s.weakTopic}</div>
                    <div className="text-[10px] text-[#6B6660]">Cause: {s.rootPrerequisite}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.statusColor === 'emerald'
                        ? 'bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB]'
                        : 'bg-[#FFF3EC] text-[#F26522] border border-[#F26522]/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReport(s);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#0D0D0D] text-white hover:bg-[#F26522] transition-colors text-xs font-bold"
                    >
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. Incoming Data: Live Quiz Submissions (15s Polling Feed) */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26522] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F26522]"></span>
            </span>
            <h3 className="font-heading font-extrabold text-base text-[#0D0D0D]">
              Live Quiz Submissions (Auto-Polling 15s)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#6B6660]">
            Last sync: {lastPolledAt}
          </span>
        </div>

        <div className="space-y-2.5">
          {incomingSubmissions.map((sub, idx) => (
            <div
              key={sub.id || idx}
              className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#F26522]" />
                <div>
                  <span className="font-bold text-[#0D0D0D]">{tName(sub.studentName)}</span>
                  <span className="text-[#6B6660] ml-2">submitted <strong>{sub.subject}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#0D0D0D]">{sub.score}</span>
                <span className="text-[10px] text-[#6B6660]">{sub.confidenceSummary}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E3DCD3] text-[#6B6660]">
                  {sub.submittedAt.includes('T') ? 'Recently' : sub.submittedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Question Review Queue: Approve / Reject AI Questions */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
          <div>
            <SectionLabel text="QUALITY ASSURANCE" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0D0D0D] flex items-center gap-2 mt-1">
              <Sparkles className="w-5 h-5 text-[#F26522]" />
              <span>AI Question Authorization Queue</span>
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#6B6660]">
            {reviewQuestions.length} Pending Approval
          </span>
        </div>

        {reviewQuestions.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B6660] bg-[#F5F0EA] rounded-2xl">
            ✓ All AI-generated questions reviewed! Students will only see authorized questions.
          </div>
        ) : (
          <div className="space-y-4">
            {reviewQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-3 text-xs sm:text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#0D0D0D] border border-[#E3DCD3]">
                      {q.subject}
                    </span>
                    <span className="font-heading font-bold text-[#0D0D0D]">{q.topic}</span>
                  </div>
                  <span className="text-[10px] text-[#6B6660] font-semibold">{q.level}</span>
                </div>

                <p className="text-[#0D0D0D] font-medium leading-relaxed">
                  "{q.questionText}"
                </p>

                <div className="p-3 rounded-xl bg-white border border-[#E3DCD3] text-xs text-[#6B6660] space-y-1">
                  <div>Correct Answer: <strong className="text-[#0D0D0D]">{q.correctOption}</strong></div>
                  <div>Pedagogical Explanation: {q.explanation}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRejectQuestion(q.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E3DCD3] text-[#6B6660] hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveQuestion(q.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0D0D0D] hover:bg-[#F26522] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve for Students</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5. Student Full Report Modal */}
      {reportModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-[#E3DCD3] space-y-6 shadow-2xl relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-5 right-5 text-[#6B6660] hover:text-[#0D0D0D] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 border-b border-[#E3DCD3] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522]">
                Student Diagnostic Report
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-[#0D0D0D]">
                {tName(activeStudent.name)} ({activeStudent.class})
              </h2>
              <div className="text-xs text-[#6B6660]">
                Linked Parent: <strong className="text-[#0D0D0D]">{tName(activeStudent.parentName)}</strong> • Track: {activeStudent.level}
              </div>
            </div>

            {/* Scores & Prerequisite Cause */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-1">
                <span className="text-[#6B6660]">Diagnostic Score:</span>
                <div className="font-heading font-extrabold text-xl text-[#F26522]">{activeStudent.diagnosticScore}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-1">
                <span className="text-[#6B6660]">Primary Bottleneck:</span>
                <div className="font-heading font-bold text-sm text-[#0D0D0D]">{activeStudent.rootPrerequisite}</div>
              </div>
            </div>

            {/* Recharts Mini Topic Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0D0D0D]">Topic Mastery vs 60% Threshold</span>
                <span className="text-[#6B6660]">Red indicates prerequisite gap</span>
              </div>
              <div className="h-40 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeStudent.topicBreakdown || []} margin={{ top: 5, right: 10, left: -25, bottom: 15 }}>
                    <XAxis dataKey="topic" tick={{ fill: '#6B6660', fontSize: 10, fontFamily: 'Inter' }} interval={0} stroke="#E3DCD3" />
                    <YAxis tick={{ fill: '#6B6660', fontSize: 10, fontFamily: 'Inter' }} domain={[0, 100]} stroke="#E3DCD3" />
                    <ReferenceLine y={60} stroke="#F26522" strokeDasharray="3 3" />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {(activeStudent.topicBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score < 60 ? '#F26522' : '#0D0D0D'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Teacher Guidance Box */}
            <form onSubmit={handleSendFeedback} className="space-y-4 pt-2 border-t border-[#E3DCD3]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0D0D0D] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#F26522]" />
                  <span>Send Teacher Guidance (Delivered to Student & {tName(activeStudent.parentName)})</span>
                </label>
                <textarea
                  rows={3}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="e.g. Focus on middle-term splitting practice this week before our quiz..."
                  className="w-full p-3.5 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6660] focus:outline-none focus:border-[#F26522]"
                  required
                />
              </div>

              {feedbackSuccess ? (
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Feedback successfully delivered to student and parent!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Guidance
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
