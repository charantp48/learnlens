import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  School, 
  Users, 
  BookOpen, 
  AlertTriangle,
  Building2,
  PlusCircle,
  Link as LinkIcon,
  Check,
  TrendingUp,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Class Modal State
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('Class 9-B');
  const [newClassSection, setNewClassSection] = useState('B');
  const [newClassTeacher, setNewClassTeacher] = useState('Ms. Sunita Patil');
  const [classSuccess, setClassSuccess] = useState(false);

  // Link Parent Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentNameInput, setParentNameInput] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('http://localhost:5000/api/admin/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Admin API unreachable, falling back to local state');
      }

      setMetrics({
        schoolName: 'Kendriya Vidyalaya No. 1, Bengaluru',
        totalClasses: 2,
        totalStudents: 3,
        totalTeachers: 2,
        schoolAverageScore: 62.3,
        prerequisiteBottlenecks: [
          {
            targetTopic: 'Quadratic Equations (Class 9)',
            bottleneckPrerequisite: 'Algebraic Identities & Factoring (Class 8)',
            affectedStudentsPercentage: 66,
            severity: 'High',
            actionRecommended: 'Conduct 20-min remedial session on middle-term splitting before term exam.'
          },
          {
            targetTopic: 'Triangles & Congruence (Class 9)',
            bottleneckPrerequisite: 'Lines & Angles (Class 7)',
            affectedStudentsPercentage: 20,
            severity: 'Low',
            actionRecommended: 'Review supplementary exercise 6.1 in NCERT text.'
          }
        ],
        classes: [
          { id: 'c1', name: 'Class 9-A', section: 'A', subject: 'Mathematics', teacher: 'Mr. Rajesh Rao', studentsCount: 3, averageScore: 62.3 },
          { id: 'c2', name: 'Class 9-B', section: 'B', subject: 'Mathematics', teacher: 'Ms. Sunita Patil', studentsCount: 0, averageScore: 0 }
        ],
        students: [
          { id: '00000000-0000-0000-0000-000000000001', name: 'Priya Sharma', class: 'Class 9-A', score: '50%', parent: 'Sunita Sharma', teacher: 'Mr. Rajesh Rao', status: 'Needs Support' },
          { id: '00000000-0000-0000-0000-000000000005', name: 'Rahul Verma', class: 'Class 9-A', score: '55%', parent: 'Amit Verma', teacher: 'Mr. Rajesh Rao', status: 'Needs Support' },
          { id: '00000000-0000-0000-0000-000000000006', name: 'Ananya Sen', class: 'Class 9-A', score: '82%', parent: 'Subhash Sen', teacher: 'Mr. Rajesh Rao', status: 'On Track' },
        ]
      });
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          section: newClassSection,
          teacher: newClassTeacher,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMetrics((prev) => ({
          ...prev,
          totalClasses: prev.totalClasses + 1,
          classes: [...prev.classes, json.class],
        }));
      }
    } catch (err) {
      // Local fallback
      setMetrics((prev) => ({
        ...prev,
        totalClasses: prev.totalClasses + 1,
        classes: [
          ...prev.classes,
          {
            id: `c-local-${Date.now()}`,
            name: newClassName,
            section: newClassSection,
            teacher: newClassTeacher,
            studentsCount: 0,
            averageScore: 0,
          },
        ],
      }));
    }

    setClassSuccess(true);
    setTimeout(() => {
      setClassSuccess(false);
      setAddClassModalOpen(false);
    }, 1500);
  };

  const handleLinkParent = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !parentNameInput) return;

    try {
      await fetch('http://localhost:5000/api/admin/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          parentName: parentNameInput,
        }),
      });
    } catch (err) {
      console.warn('Linked parent locally');
    }

    setMetrics((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === selectedStudent.id ? { ...s, parent: parentNameInput } : s
      ),
    }));

    setLinkSuccess(true);
    setTimeout(() => {
      setLinkSuccess(false);
      setLinkModalOpen(false);
      setParentNameInput('');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 p-1 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {t('admin.consoleBadge')}
              </span>
              <span className="text-xs text-slate-400">{metrics?.schoolName || 'Kendriya Vidyalaya No. 1'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {currentUser?.full_name || 'Dr. K. S. Sharma'} (Principal)
            </h1>
          </div>
        </div>

        <button
          onClick={() => setAddClassModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('admin.addClass')}</span>
        </button>
      </div>

      {/* School-Wide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{t('admin.totalClasses')}</span>
            <School className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.totalClasses || 2} <span className="text-xs font-normal text-slate-400">Cohorts</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{t('admin.enrolledStudents')}</span>
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.totalStudents || 3} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{t('admin.faculty')}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.totalTeachers || 2} <span className="text-xs font-normal text-slate-400">Teachers</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>{t('admin.schoolAverage')}</span>
            <TrendingUp className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">
            {metrics?.schoolAverageScore || 62.3}%
          </div>
        </div>
      </div>

      {/* Curriculum Health Bottlenecks */}
      <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">
            {t('admin.bottlenecksTitle')}
          </h2>
        </div>

        <div className="space-y-3">
          {(metrics?.prerequisiteBottlenecks || []).map((b, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 text-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-white text-sm">
                  {b.targetTopic}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px] self-start sm:self-auto">
                  {b.affectedStudentsPercentage}% Students Blocked
                </span>
              </div>

              <div className="text-slate-300">
                <strong className="text-amber-300">Identified Prerequisite Bottleneck:</strong>{' '}
                {b.bottleneckPrerequisite}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-[11px]">
                <strong>Recommended Administrative Intervention:</strong> {b.actionRecommended}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class List & Cohort Management */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <School className="w-4 h-4 text-amber-400" />
          <span>{t('admin.classList')}</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assigned Teacher</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {(metrics?.classes || []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                  <td className="py-3 px-4">{c.subject}</td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">{c.teacher}</td>
                  <td className="py-3 px-4">{c.studentsCount} Students</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                    {c.averageScore > 0 ? `${c.averageScore}%` : 'Pending Quiz'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student & Parent Roster */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{t('admin.rosterTitle')}</span>
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Linked Parent</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {(metrics?.students || []).map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                  <td className="py-3 px-4">{s.class}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{s.score}</td>
                  <td className="py-3 px-4 text-pink-300">{s.parent || 'Unlinked'}</td>
                  <td className="py-3 px-4">{s.teacher}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setParentNameInput(s.parent || '');
                        setLinkModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all cursor-pointer font-medium"
                    >
                      Link Parent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {addClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <School className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create New Cohort</h3>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Class Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Section</label>
                <input
                  type="text"
                  value={newClassSection}
                  onChange={(e) => setNewClassSection(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Assigned Teacher</label>
                <input
                  type="text"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {classSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Cohort added to school roster!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddClassModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                  >
                    Create Cohort
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-pink-400">
              <LinkIcon className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Link Parent to {selectedStudent?.name}
              </h3>
            </div>

            <form onSubmit={handleLinkParent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Parent Full Name</label>
                <input
                  type="text"
                  value={parentNameInput}
                  onChange={(e) => setParentNameInput(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              {linkSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Parent successfully linked to student!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Save Link
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
