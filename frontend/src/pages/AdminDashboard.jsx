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
  GraduationCap,
  X,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';

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
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
            alt={currentUser?.full_name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-bg-base border-2 border-accent/40 p-1 shrink-0 object-cover"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-dark-banner text-white">
                {t('admin.consoleBadge')}
              </span>
              <span className="text-xs font-medium text-text-muted">{metrics?.schoolName || 'Kendriya Vidyalaya No. 1'}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main tracking-tight mt-1">
              {currentUser?.full_name || 'Dr. K. S. Sharma'} (Principal)
            </h1>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={() => setAddClassModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            {t('admin.addClass')}
          </Button>
        </div>
      </Card>

      {/* School-Wide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="surface" className="p-5 space-y-2">
          <div className="text-text-muted text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{t('admin.totalClasses')}</span>
            <School className="w-4 h-4 text-accent" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main">
            {metrics?.totalClasses || 2} <span className="text-xs font-normal text-text-muted">Cohorts</span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 space-y-2">
          <div className="text-text-muted text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{t('admin.enrolledStudents')}</span>
            <GraduationCap className="w-4 h-4 text-accent" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main">
            {metrics?.totalStudents || 3} <span className="text-xs font-normal text-text-muted">Students</span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 space-y-2">
          <div className="text-text-muted text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{t('admin.faculty')}</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-text-main">
            {metrics?.totalTeachers || 2} <span className="text-xs font-normal text-text-muted">Teachers</span>
          </div>
        </Card>

        <Card variant="surface" className="p-5 space-y-2">
          <div className="text-text-muted text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{t('admin.schoolAverage')}</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-accent">
            {metrics?.schoolAverageScore || 62.3}%
          </div>
        </Card>
      </div>

      {/* Curriculum Health Bottlenecks */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div>
            <SectionLabel text="CURRICULUM HEALTH" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-text-main flex items-center gap-2 mt-1">
              <AlertTriangle className="w-5 h-5 text-accent" />
              <span>{t('admin.bottlenecksTitle')}</span>
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {(metrics?.prerequisiteBottlenecks || []).map((b, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-bg-base border border-border-warm text-xs sm:text-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-heading font-extrabold text-text-main text-sm sm:text-base">
                  {b.targetTopic}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FFF3EC] text-accent font-bold border border-accent/20 text-xs self-start sm:self-auto">
                  {b.affectedStudentsPercentage}% Students Blocked
                </span>
              </div>

              <div className="text-text-muted">
                <strong className="text-text-main">Identified Prerequisite Bottleneck:</strong>{' '}
                <span className="text-accent font-semibold">{b.bottleneckPrerequisite}</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-surface border border-border-warm text-text-main text-xs font-medium">
                <strong className="text-text-main">Recommended Administrative Action:</strong> {b.actionRecommended}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Class List & Cohort Management */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div>
            <SectionLabel text="COHORTS & FACULTY" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2 mt-1">
              <School className="w-5 h-5 text-accent" />
              <span>{t('admin.classList')}</span>
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border-warm bg-bg-base/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-warm">
              <tr>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Assigned Teacher</th>
                <th className="py-3.5 px-4">Enrolled</th>
                <th className="py-3.5 px-4">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm/60 text-text-muted">
              {(metrics?.classes || []).map((c) => (
                <tr key={c.id} className="hover:bg-surface/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text-main">{c.name}</td>
                  <td className="py-3.5 px-4">{c.subject}</td>
                  <td className="py-3.5 px-4 font-medium text-text-main">{c.teacher}</td>
                  <td className="py-3.5 px-4">{c.studentsCount} Students</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">
                    {c.averageScore > 0 ? `${c.averageScore}%` : 'Pending Quiz'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student & Parent Roster */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border-warm pb-3">
          <div>
            <SectionLabel text="SCHOOL ROSTER" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-accent" />
              <span>{t('admin.rosterTitle')}</span>
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border-warm bg-bg-base/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-warm">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Linked Parent</th>
                <th className="py-3.5 px-4">Teacher</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm/60 text-text-muted">
              {(metrics?.students || []).map((s) => (
                <tr key={s.id} className="hover:bg-surface/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text-main">{s.name}</td>
                  <td className="py-3.5 px-4">{s.class}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">{s.score}</td>
                  <td className="py-3.5 px-4 font-medium text-text-main">{s.parent || 'Unlinked'}</td>
                  <td className="py-3.5 px-4">{s.teacher}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(s);
                        setParentNameInput(s.parent || '');
                        setLinkModalOpen(true);
                      }}
                    >
                      Link Parent
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Class Modal */}
      {addClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="max-w-md w-full p-6 sm:p-8 border border-border-warm space-y-5 shadow-2xl relative">
            <button
              onClick={() => setAddClassModalOpen(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-accent">
              <School className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-lg text-text-main">Create New Cohort</h3>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Class Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Section</label>
                <input
                  type="text"
                  value={newClassSection}
                  onChange={(e) => setNewClassSection(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Assigned Teacher</label>
                <input
                  type="text"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {classSuccess ? (
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Cohort added to school roster!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAddClassModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Create Cohort
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Link Parent Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="max-w-md w-full p-6 sm:p-8 border border-border-warm space-y-5 shadow-2xl relative">
            <button
              onClick={() => setLinkModalOpen(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-accent">
              <LinkIcon className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-lg text-text-main">
                Link Parent to {selectedStudent?.name}
              </h3>
            </div>

            <form onSubmit={handleLinkParent} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-text-main">Parent Full Name</label>
                <input
                  type="text"
                  value={parentNameInput}
                  onChange={(e) => setParentNameInput(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full p-3 rounded-2xl bg-bg-base border border-border-warm text-text-main focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {linkSuccess ? (
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Parent successfully linked to student!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLinkModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Save Link
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
