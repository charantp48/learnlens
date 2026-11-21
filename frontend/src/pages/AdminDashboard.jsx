import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  PlusCircle, 
  Link as LinkIcon, 
  UserPlus, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
  KeyRound,
  Copy,
  Check,
  Edit,
  X,
  Shield,
  Activity,
  History,
  Award,
  MessageSquare,
  Eye
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';

export default function AdminDashboard() {
  const { t, tName } = useTranslation();

  const [metrics, setMetrics] = useState({
    counts: {
      real: { students: 2, teachers: 1, parents: 1, admins: 0, total: 4, classes: 2, reportsSubmitted: 1, reportsNotReviewed: 1 },
      all: { students: 4, teachers: 2, parents: 2, total: 9, classes: 2, reportsSubmitted: 2, reportsNotReviewed: 1 },
      classes: 2,
    },
    users: [],
    classes: [],
    reportsAndRanks: [],
    recentActivity: [],
    isDemoMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'disabled'
  const [searchQuery, setSearchQuery] = useState('');
  const [reportsClassFilter, setReportsClassFilter] = useState('all');
  const [reportsSearchQuery, setReportsSearchQuery] = useState('');
  const [selectedReportModal, setSelectedReportModal] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // Password Reveal Modal / Banner state
  const [latestCredentials, setLatestCredentials] = useState(null); // { title: '', users: [ { name, email, role, temporaryPassword } ] }

  // 1. Single User Form State
  const [singleUser, setSingleUser] = useState({
    name: '',
    email: '',
    role: 'student',
    className: 'Class 11-A',
    linkedChild: '',
    subject: 'Mathematics',
  });

  // 2. CSV Upload & Preview State
  const fileInputRef = useRef(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null); // { totalRows, validCount, errorCount, previewRows }
  const [csvLoading, setCsvLoading] = useState(false);

  // 3. Edit User Modal State
  const [editModalUser, setEditModalUser] = useState(null);

  // 4. Create Class State
  const [newClass, setNewClass] = useState({
    name: '',
    section: 'A',
    subject: 'Mathematics',
    teacher: '',
  });

  // 5. Assignment State
  const [assignment, setAssignment] = useState({
    classId: '',
    userId: '',
  });

  // 6. Link Parent State
  const [parentLink, setParentLink] = useState({
    parentId: '',
    studentId: '',
  });

  // Fetch admin metrics & data
  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics((prev) => ({
          ...prev,
          ...data,
          counts: {
            ...prev.counts,
            ...(data.counts || {}),
          },
          users: data.users || [],
          classes: data.classes || [],
          reportsAndRanks: data.reportsAndRanks || [],
          recentActivity: data.recentActivity || [],
        }));
        if (data.classes?.length > 0 && !assignment.classId) {
          setAssignment((prev) => ({ ...prev, classId: data.classes[0].id }));
        }
        if (data.users?.length > 0) {
          const firstTeacher = data.users.find((u) => u.role === 'teacher');
          if (firstTeacher && !newClass.teacher) {
            setNewClass((prev) => ({ ...prev, teacher: firstTeacher.name }));
          }
        }
      }
    } catch (err) {
      console.warn('Using local metrics fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // 1. Create ONE real user
  const handleCreateSingleUser = async (e) => {
    e.preventDefault();
    if (!singleUser.name || !singleUser.email) {
      showFeedback('error', 'Name and email are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users/create-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleUser),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `Created account for ${data.user.name}.`);
        setLatestCredentials({
          title: `Account Created: ${data.user.name}`,
          users: [
            {
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              className: data.user.className,
              temporaryPassword: data.temporaryPassword,
            },
          ],
        });
        setSingleUser({
          name: '',
          email: '',
          role: 'student',
          className: 'Class 11-A',
          linkedChild: '',
          subject: 'Mathematics',
        });
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to create user');
      }
    } catch (err) {
      showFeedback('error', 'Network error creating user');
    }
  };

  // 2. CSV File Parse & Preview
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          showFeedback('error', 'CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length === 0 || !cols.some((c) => c.length > 0)) continue;

          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });
          rows.push(rowObj);
        }

        setCsvLoading(true);

        const res = await fetch('/api/admin/users/csv-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows }),
        });

        const previewData = await res.json();
        if (res.ok) {
          setCsvPreview(previewData);
        } else {
          showFeedback('error', previewData.message || 'Error validating CSV rows');
        }
      } catch (err) {
        showFeedback('error', 'Failed to read or parse CSV file.');
      } finally {
        setCsvLoading(false);
      }
    };

    reader.readAsText(file);
  };

  // 3. Confirm and Import Valid CSV Rows
  const handleImportCSV = async () => {
    if (!csvPreview || csvPreview.validCount === 0) return;

    setCsvLoading(true);
    const validRows = csvPreview.previewRows.filter((r) => r.isValid);

    try {
      const res = await fetch('/api/admin/users/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validRows }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `Imported ${data.importedCount} users successfully!`);
        setLatestCredentials({
          title: `Batch Import Results (${data.importedCount} Users Created)`,
          users: data.credentials,
        });
        setCsvPreview(null);
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Error importing CSV users');
      }
    } catch (err) {
      showFeedback('error', 'Network error during CSV import');
    } finally {
      setCsvLoading(false);
    }
  };

  // Download Temporary Passwords CSV
  const handleDownloadCredentialsCSV = () => {
    if (!latestCredentials?.users?.length) return;
    const header = 'Name,Email,Role,Class,Temporary_Password\n';
    const lines = latestCredentials.users.map(
      (u) => `"${u.name}","${u.email}","${u.role}","${u.className || ''}","${u.temporaryPassword}"`
    );
    const blob = new Blob([header + lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnlens_temporary_passwords.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset User Password (generates new temporary password)
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Generate a new temporary password for ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setLatestCredentials({
          title: `Password Reset: ${user.name}`,
          users: [
            {
              name: user.name,
              email: user.email,
              role: user.role,
              className: user.className,
              temporaryPassword: data.temporaryPassword,
            },
          ],
        });
        showFeedback('success', `New temporary password generated for ${user.name}.`);
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to reset password');
      }
    } catch (err) {
      showFeedback('error', 'Network error resetting password');
    }
  };

  // Toggle user status (Enable / Disable)
  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok) {
        setMetrics((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? data.user : u)),
        }));
        showFeedback('success', data.message);
      } else {
        showFeedback('error', data.message || 'Failed to toggle status');
      }
    } catch (err) {
      showFeedback('error', 'Error toggling user status');
    }
  };

  // Edit User Details
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editModalUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editModalUser.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editModalUser.name,
          email: editModalUser.email,
          className: editModalUser.className,
          linkedChild: editModalUser.linkedChild,
          status: editModalUser.status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `User ${data.user.name} updated successfully.`);
        setEditModalUser(null);
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to update user');
      }
    } catch (err) {
      showFeedback('error', 'Network error updating user');
    }
  };

  // Filtered users for table
  const filteredUsers = (metrics.users || []).filter((user) => {
    if (!user) return false;
    if (metrics.isDemoMode === false && user.is_demo) return false;
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const q = (searchQuery || '').toLowerCase().trim();
    const nameStr = (user.name || user.full_name || '').toLowerCase();
    const emailStr = (user.email || '').toLowerCase();
    const classStr = (user.className || user.class_name || '').toLowerCase();
    const statusStr = (user.status || '').toLowerCase();
    const matchesSearch =
      !q ||
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      classStr.includes(q) ||
      statusStr.includes(q);
    return matchesFilter && matchesStatus && matchesSearch;
  });

  // Filtered reports & ranks for school-wide reports table
  const filteredReports = (metrics.reportsAndRanks || []).filter((r) => {
    if (!r) return false;
    if (metrics.isDemoMode === false && r.isDemo) return false;
    const matchesClass =
      reportsClassFilter === 'all' || (r.className || '').toLowerCase() === reportsClassFilter.toLowerCase();
    const q = (reportsSearchQuery || '').toLowerCase().trim();
    const studentNameStr = (r.studentName || r.name || '').toLowerCase();
    const studentEmailStr = (r.studentEmail || r.email || '').toLowerCase();
    const classStr = (r.className || '').toLowerCase();
    const matchesSearch =
      !q ||
      studentNameStr.includes(q) ||
      studentEmailStr.includes(q) ||
      classStr.includes(q);
    return matchesClass && matchesSearch;
  });

  const studentsList = (metrics.users || []).filter((u) => u.role === 'student');
  const teachersList = (metrics.users || []).filter((u) => u.role === 'teacher');
  const parentsList = (metrics.users || []).filter((u) => u.role === 'parent');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#736B63]">{t('common.loading') || 'Loading console...'}</p>
        </div>
      </div>
    );
  }

  const realCounts = metrics.counts?.real || { students: 0, teachers: 0, parents: 0, total: 0 };

  return (
    <div className="min-h-screen bg-[#F5F0EA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header (ONE SINGLE PAGE - strictly NO Home button) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <SectionLabel text={t('admin.consoleBadge') || 'Administrator Console'} />
            <h1 className="text-3xl font-extrabold text-[#0D0D0D] tracking-tight mt-1">
              {t('admin.title') || 'School Administration Console'}
            </h1>
            <p className="text-sm text-[#736B63] mt-1 max-w-2xl">
              Onboard real students, teachers, and parents with secure temporary passwords and automated audit tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Accounts Mode Active</span>
            </span>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xs transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {/* TEMPORARY PASSWORDS REVEAL MODAL / BANNER (Shown once on screen with CSV download) */}
        {latestCredentials && (
          <Card className="p-6 bg-amber-50/70 border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <KeyRound className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{latestCredentials.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadCredentialsCSV}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Passwords CSV
                </Button>
                <button
                  onClick={() => setLatestCredentials(null)}
                  className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Dismiss Credentials Notice"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Notice:</strong> These temporary passwords are shown <strong>once</strong>. Share them with users securely. Every user has been flagged with <code>must_change_password = true</code> and will be required to set their permanent password upon their first login.
            </p>

            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs bg-white rounded-xl border border-amber-200">
                <thead>
                  <tr className="border-b border-amber-200 bg-amber-100/50 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Class / Info</th>
                    <th className="py-2.5 px-3">Temporary Password</th>
                    <th className="py-2.5 px-3 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {latestCredentials.users.map((u, i) => (
                    <tr key={i} className="hover:bg-amber-50/50">
                      <td className="py-2 px-3 font-semibold text-[#0D0D0D]">{u.name}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#6B6660]">{u.email}</td>
                      <td className="py-2 px-3 capitalize font-medium">{u.role}</td>
                      <td className="py-2 px-3 text-[#6B6660]">{u.className || '—'}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#F26522] tracking-wider text-xs">
                        {u.temporaryPassword}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(u.temporaryPassword, `cred-${i}`)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                        >
                          {copiedKey === `cred-${i}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 1. Real Totals Monitoring Cards (Demo accounts strictly excluded) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                {t('admin.studentsCount') || 'Students'} (Real)
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{realCounts.students}</p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Demo excluded</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                {t('admin.teachersCount') || 'Teachers'} (Real)
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{realCounts.teachers}</p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Demo excluded</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                {t('admin.parentsCount') || 'Parents'} (Real)
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{realCounts.parents}</p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Demo excluded</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                {t('admin.classesCount') || 'Classes'}
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{metrics.counts?.real?.classes || metrics.classes?.length || 2}</p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Curriculum cohorts</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                Reports Submitted
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">
                {metrics.counts?.real?.reportsSubmitted ?? (metrics.reportsAndRanks?.filter((r) => !r.isDemo && r.latestReport).length || 0)}
              </p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Real assessments</p>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-2 border border-[#E3DCD3]">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
                Pending Review
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">
                {metrics.counts?.real?.reportsNotReviewed ?? (metrics.reportsAndRanks?.filter((r) => !r.isDemo && r.latestReport?.reviewStatus === 'new').length || 0)}
              </p>
              <p className="text-[10px] text-[#6B6660] mt-0.5">Awaiting teacher</p>
            </div>
          </Card>
        </div>

        {/* 2. Account Onboarding Section (Single User Form & Batch CSV Upload) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Form 1: Add ONE Real Person */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3]">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  Add Individual Person
                </h3>
                <p className="text-[11px] text-[#736B63]">Creates real account with random temporary password</p>
              </div>
            </div>

            <form onSubmit={handleCreateSingleUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Role *
                  </label>
                  <select
                    value={singleUser.role}
                    onChange={(e) => setSingleUser({ ...singleUser, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={singleUser.name}
                    onChange={(e) => setSingleUser({ ...singleUser, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.kumar@school.edu"
                  value={singleUser.email}
                  onChange={(e) => setSingleUser({ ...singleUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              {/* Role specific assignment */}
              {singleUser.role === 'student' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Assign Class
                  </label>
                  <select
                    value={singleUser.className}
                    onChange={(e) => setSingleUser({ ...singleUser, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  >
                    {metrics.classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.subject})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleUser.role === 'teacher' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                      Teaching Class
                    </label>
                    <select
                      value={singleUser.className}
                      onChange={(e) => setSingleUser({ ...singleUser, className: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                    >
                      {metrics.classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={singleUser.subject}
                      onChange={(e) => setSingleUser({ ...singleUser, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                    />
                  </div>
                </div>
              )}

              {singleUser.role === 'parent' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    Link to Student (Child)
                  </label>
                  <select
                    value={singleUser.linkedChild}
                    onChange={(e) => setSingleUser({ ...singleUser, linkedChild: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  >
                    <option value="">Select registered student...</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {tName(s.name)} ({s.className || 'Class 11-A'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-[11px] text-[#736B63]">
                💡 The server automatically generates a secure temporary password. User will be forced to set their permanent password at first login.
              </p>

              <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
                Generate Account & Password
              </Button>
            </form>
          </Card>

          {/* Form 2: Add MANY via CSV Upload with Live Pre-Validation */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0D0D0D]">
                    Batch CSV Onboarding
                  </h3>
                  <p className="text-[11px] text-[#736B63]">Upload up to 500 rows with instant row preview</p>
                </div>
              </div>

              {/* Download CSV Template */}
              <a
                href="/api/admin/users/csv-template"
                download="learnlens_users_template.csv"
              >
                <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                  Template
                </Button>
              </a>
            </div>

            {/* Upload Area */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-[#E3DCD3] bg-[#F5F0EA]/60 hover:bg-[#F5F0EA] transition-colors text-center space-y-2">
              <Upload className="w-6 h-6 text-[#736B63] mx-auto" />
              <div>
                <label className="text-xs font-bold text-[#0D0D0D] cursor-pointer hover:text-[#F26522]">
                  <span>Click to select CSV file</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleCSVFileChange}
                  />
                </label>
                <p className="text-[10px] text-[#736B63]">Columns: role, full_name, email, class_name, linked_student_email</p>
              </div>
              {csvFile && (
                <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Loaded: {csvFile.name}
                </span>
              )}
            </div>

            {/* CSV PREVIEW TABLE (Before Importing) */}
            {csvPreview && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0D0D0D]">
                    Validation Preview: {csvPreview.totalRows} rows parsed
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ {csvPreview.validCount} Valid
                    </span>
                    {csvPreview.errorCount > 0 && (
                      <span className="text-rose-700 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        ✗ {csvPreview.errorCount} Errors
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto overflow-x-auto border border-[#E3DCD3] rounded-xl bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#E3DCD3] bg-[#FBF8F4] text-[#736B63] uppercase tracking-wider font-semibold">
                        <th className="py-2 px-2.5">Row</th>
                        <th className="py-2 px-2.5">Role</th>
                        <th className="py-2 px-2.5">Name</th>
                        <th className="py-2 px-2.5">Email</th>
                        <th className="py-2 px-2.5">Status</th>
                        <th className="py-2 px-2.5">Validation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3DCD3]">
                      {csvPreview.previewRows.map((r) => (
                        <tr key={r.rowNumber} className={r.isValid ? 'hover:bg-emerald-50/30' : 'bg-rose-50/40'}>
                          <td className="py-2 px-2.5 font-mono">{r.rowNumber}</td>
                          <td className="py-2 px-2.5 font-semibold capitalize">{r.role}</td>
                          <td className="py-2 px-2.5 font-medium">{r.full_name}</td>
                          <td className="py-2 px-2.5 font-mono text-[10px] text-[#6B6660]">{r.email}</td>
                          <td className="py-2 px-2.5">
                            {r.isValid ? (
                              <span className="text-emerald-700 font-bold text-[10px]">Valid</span>
                            ) : (
                              <span className="text-rose-700 font-bold text-[10px]">Invalid</span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-[10px] text-rose-700 font-medium">
                            {r.isValid ? <span className="text-emerald-600">Ready to import</span> : r.errors.join('; ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={csvLoading || csvPreview.validCount === 0}
                  onClick={handleImportCSV}
                  className="w-full"
                >
                  {csvLoading ? 'Importing...' : `Import ${csvPreview.validCount} Valid Accounts`}
                </Button>
              </div>
            )}
          </Card>

        </div>

        {/* 3. User Accounts Directory Table with Role Filters & Status Toggle */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E3DCD3] pb-5">
            <div>
              <h2 className="text-lg font-bold text-[#0D0D0D]">
                {t('admin.userTableTitle') || 'User Directory'}
              </h2>
              <p className="text-xs text-[#736B63]">
                Manage real accounts and demo personas. Demo accounts are flagged and excluded from real rankings.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-xs text-[#0D0D0D] placeholder-[#736B63] focus:outline-hidden focus:border-[#F26522]"
              />
            </div>
          </div>

          {/* Filter Pills: Role Filter & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#736B63] mr-1">Role:</span>
              {[
                { id: 'all', label: t('admin.filterAll') || 'All Users' },
                { id: 'student', label: t('admin.filterStudents') || 'Students' },
                { id: 'teacher', label: t('admin.filterTeachers') || 'Teachers' },
                { id: 'parent', label: t('admin.filterParents') || 'Parents' },
                { id: 'admin', label: t('admin.filterAdmins') || 'Admins' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-[#0D0D0D] text-white shadow-xs'
                      : 'bg-[#FBF8F4] text-[#736B63] border border-[#E3DCD3] hover:border-[#0D0D0D]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-[#736B63] mr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'disabled', label: 'Disabled' },
              ].map((sf) => (
                <button
                  key={sf.id}
                  onClick={() => setStatusFilter(sf.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    statusFilter === sf.id
                      ? 'bg-[#F26522] text-white shadow-xs'
                      : 'bg-[#FBF8F4] text-[#736B63] border border-[#E3DCD3] hover:border-[#F26522]'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3DCD3] text-[#736B63] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">{t('admin.colName') || 'Name'}</th>
                  <th className="py-3 px-3">{t('admin.colEmail') || 'Email'}</th>
                  <th className="py-3 px-3">{t('admin.colRole') || 'Role'}</th>
                  <th className="py-3 px-3">{t('admin.colClass') || 'Class / Details'}</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">{t('admin.colStatus') || 'Status'}</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCD3]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#736B63]">
                      No users match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isActive = u.status === 'active';
                    return (
                      <tr key={u.id} className="hover:bg-[#FBF8F4]/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#0D0D0D]">{tName(u.name)}</td>
                        <td className="py-3 px-3 text-[#736B63] font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-semibold capitalize text-[11px] ${
                              u.role === 'student'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : u.role === 'teacher'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.role === 'parent'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-orange-50 text-[#F26522] border border-orange-200'
                            }`}
                          >
                            {tName(u.role)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#0D0D0D]">
                          {u.className || (u.linkedChild ? tName(u.linkedChild) : '—')}
                        </td>
                        <td className="py-3 px-3">
                          {u.is_demo ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Demo
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Real
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            {isActive
                              ? t('admin.statusActive') || 'Active'
                              : t('admin.statusDisabled') || 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditModalUser({ ...u })}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border border-[#E3DCD3] text-[#0D0D0D] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* Reset Password button */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(u)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Reset</span>
                          </button>

                          {/* Toggle Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5" />
                                {t('admin.btnDisable') || 'Disable'}
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5" />
                                {t('admin.btnEnable') || 'Enable'}
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 4. School-Wide Reports and Ranks Table (Filterable by Class) */}
        <Card className="p-6 space-y-6 border border-[#E3DCD3]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E3DCD3] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0D]">
                    School-Wide Reports & Student Rankings
                  </h2>
                  <p className="text-xs text-[#736B63]">
                    Cumulative ranks based on total marks earned / total possible across completed diagnostic attempts. Ties share rank.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#736B63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or email..."
                value={reportsSearchQuery}
                onChange={(e) => setReportsSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-xs text-[#0D0D0D] placeholder-[#736B63] focus:outline-hidden focus:border-[#F26522]"
              />
            </div>
          </div>

          {/* Class Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#736B63] mr-1">Filter Class:</span>
            <button
              type="button"
              onClick={() => setReportsClassFilter('all')}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${
                reportsClassFilter === 'all'
                  ? 'bg-[#0D0D0D] text-white shadow-xs'
                  : 'bg-[#FBF8F4] text-[#736B63] border border-[#E3DCD3] hover:border-[#0D0D0D]'
              }`}
            >
              All Classes ({metrics.reportsAndRanks?.length || 0})
            </button>
            {metrics.classes?.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setReportsClassFilter(c.name)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  reportsClassFilter === c.name
                    ? 'bg-[#0D0D0D] text-white shadow-xs'
                    : 'bg-[#FBF8F4] text-[#736B63] border border-[#E3DCD3] hover:border-[#0D0D0D]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3DCD3] text-[#736B63] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">School Rank</th>
                  <th className="py-3 px-3">Class Rank</th>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Overall Avg</th>
                  <th className="py-3 px-3">Latest Report</th>
                  <th className="py-3 px-3">Teacher Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCD3]">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#736B63]">
                      No student reports match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    return (
                      <tr key={r.studentId} className="hover:bg-[#FBF8F4]/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#0D0D0D]">
                          #{r.schoolRank}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#0D0D0D]">
                          Rank {r.classRank} of {r.classTotal}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#0D0D0D]">{tName(r.studentName)}</div>
                          <div className="text-[10px] text-[#736B63] font-mono">{r.studentEmail}</div>
                        </td>
                        <td className="py-3 px-3 text-[#0D0D0D] font-medium">
                          {r.className}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#0D0D0D]">{r.overallPercentage}%</div>
                          <div className="text-[10px] text-[#736B63]">{r.attemptsCount} attempt(s)</div>
                        </td>
                        <td className="py-3 px-3">
                          {r.latestReport ? (
                            <div>
                              <span className="font-medium text-[#0D0D0D]">{r.latestReport.subject}</span>
                              <div className="text-[10px] text-[#736B63] font-mono">
                                {r.latestReport.marksEarned}/{r.latestReport.marksPossible} ({r.latestReport.percentage}%)
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#736B63] text-[11px] italic">No attempts yet</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {r.clarification ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.clarification.status === 'needs_extra_help'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : r.clarification.status === 'improve_focus'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {r.clarification.status === 'needs_extra_help'
                                ? 'Needs Extra Help'
                                : r.clarification.status === 'improve_focus'
                                ? 'Improve Focus'
                                : 'Doing Well'}
                            </span>
                          ) : r.latestReport?.reviewStatus === 'new' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                              Pending Review
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#736B63]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {r.latestReport ? (
                            <button
                              type="button"
                              onClick={() => setSelectedReportModal(r)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#E3DCD3] text-[#0D0D0D] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-[#F26522]" />
                              <span>View Report</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#736B63]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 5. Cohorts, Assignments, and Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Form 2: Create Class */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3]">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  {t('admin.createClassTitle') || 'Create Class'}
                </h3>
                <p className="text-[11px] text-[#736B63]">Add a new academic cohort or section</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newClass.name) return;
                try {
                  const res = await fetch('/api/admin/classes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClass),
                  });
                  if (res.ok) {
                    showFeedback('success', 'Class created successfully!');
                    setNewClass({ name: '', section: 'A', subject: 'Mathematics', teacher: '' });
                    fetchMetrics();
                  }
                } catch (err) {
                  showFeedback('error', 'Network error creating class');
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    {t('admin.className') || 'Class Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 12-A"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    {t('admin.section') || 'Section'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={newClass.section}
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.subject') || 'Subject'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics & Physics"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.teacher') || 'Assigned Teacher'}
                </label>
                <select
                  value={newClass.teacher}
                  onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                >
                  <option value="">Select teacher (optional)...</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.name}>
                      {tName(t.name)}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
                {t('admin.submitCreateClass') || 'Create Class'}
              </Button>
            </form>
          </Card>

          {/* Form 3: Assign Teacher / Student to Class */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3]">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  {t('admin.assignClassTitle') || 'Assign to Class'}
                </h3>
                <p className="text-[11px] text-[#736B63]">Enroll student or assign teacher to a cohort</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!assignment.classId || !assignment.userId) return;
                try {
                  const res = await fetch('/api/admin/assign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(assignment),
                  });
                  if (res.ok) {
                    showFeedback('success', 'Assignment saved successfully!');
                    fetchMetrics();
                  }
                } catch (err) {
                  showFeedback('error', 'Network error saving assignment');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.selectClass') || 'Select Class'}
                </label>
                <select
                  value={assignment.classId}
                  onChange={(e) => setAssignment({ ...assignment, classId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                >
                  <option value="">Select a class cohort...</option>
                  {metrics.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.selectUser') || 'Select User (Teacher or Student)'}
                </label>
                <select
                  value={assignment.userId}
                  onChange={(e) => setAssignment({ ...assignment, userId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                >
                  <option value="">Select user...</option>
                  <optgroup label="Teachers">
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {tName(t.name)} ({t('roles.teacher_title') || 'Teacher'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Students">
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {tName(s.name)} ({t('roles.student_title') || 'Student'})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <Button type="submit" variant="dark" size="sm" className="w-full mt-2">
                {t('admin.submitAssign') || 'Save Assignment'}
              </Button>
            </form>
          </Card>

        </div>

        {/* 5. EDIT USER MODAL */}
        {editModalUser && (
          <div className="fixed inset-0 z-50 bg-[#0D0D0D]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4 bg-white border border-[#E3DCD3] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#F26522]" />
                  <h3 className="font-bold text-sm text-[#0D0D0D]">Edit Account: {editModalUser.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="p-1 rounded-lg text-[#736B63] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editModalUser.name}
                    onChange={(e) => setEditModalUser({ ...editModalUser, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editModalUser.email}
                    onChange={(e) => setEditModalUser({ ...editModalUser, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">Class / Cohort</label>
                  <select
                    value={editModalUser.className || ''}
                    onChange={(e) => setEditModalUser({ ...editModalUser, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  >
                    <option value="">None / Unassigned</option>
                    {metrics.classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editModalUser.role === 'parent' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">Linked Student (Child)</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={editModalUser.linkedChild || ''}
                      onChange={(e) => setEditModalUser({ ...editModalUser, linkedChild: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3DCD3]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditModalUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* 6. REPORT INSPECTION MODAL FOR ADMIN */}
        {selectedReportModal && (
          <div className="fixed inset-0 z-50 bg-[#0D0D0D]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 space-y-4 bg-white border border-[#E3DCD3] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F26522]" />
                  <h3 className="font-bold text-sm text-[#0D0D0D]">
                    Diagnostic Report: {tName(selectedReportModal.studentName)} ({selectedReportModal.className})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReportModal(null)}
                  className="p-1 rounded-lg text-[#736B63] hover:bg-[#F5F0EA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#F5F0EA]">
                  <div className="text-[10px] text-[#736B63] uppercase font-bold">Class Rank</div>
                  <div className="font-bold text-sm text-[#0D0D0D]">
                    Rank {selectedReportModal.classRank} of {selectedReportModal.classTotal}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F0EA]">
                  <div className="text-[10px] text-[#736B63] uppercase font-bold">School Rank</div>
                  <div className="font-bold text-sm text-[#0D0D0D]">
                    #{selectedReportModal.schoolRank} of {selectedReportModal.schoolTotal}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F0EA]">
                  <div className="text-[10px] text-[#736B63] uppercase font-bold">Score</div>
                  <div className="font-bold text-sm text-[#F26522]">
                    {selectedReportModal.latestReport?.marksEarned}/{selectedReportModal.latestReport?.marksPossible} ({selectedReportModal.latestReport?.percentage}%)
                  </div>
                </div>
              </div>

              {selectedReportModal.latestReport?.weakTopics?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#736B63] uppercase">
                    Diagnosed Weak Topics & Root Causes:
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedReportModal.latestReport.weakTopics.map((wt, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#F5F0EA] text-xs">
                        <div className="font-bold text-[#0D0D0D]">{wt.topicName}</div>
                        <div className="text-[11px] text-[#6B6660]">Root Cause: {wt.rootPrerequisite || 'Foundation Gap'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReportModal.clarification ? (
                <div className="p-3.5 rounded-xl bg-[#FFF3EC] border border-[#F26522]/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D0D0D]">Teacher Note ({selectedReportModal.clarification.teacherName})</span>
                    <span className="font-bold text-[10px] uppercase text-[#F26522]">{selectedReportModal.clarification.status}</span>
                  </div>
                  <p className="text-xs text-[#0D0D0D] italic">"{selectedReportModal.clarification.comment}"</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#736B63] text-center">
                  Teacher clarification pending review.
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-[#E3DCD3]">
                <Button variant="ghost" size="sm" onClick={() => setSelectedReportModal(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 7. Recent Administrative Activity Log */}
        {metrics.recentActivity?.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#F26522]" />
                <h3 className="font-bold text-sm text-[#0D0D0D]">Recent Administrative Activity Log</h3>
              </div>
              <span className="text-[11px] text-[#736B63]">
                {metrics.recentActivity.length} recent audit records
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {metrics.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#F5F0EA] border border-[#E3DCD3] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#E3DCD3] text-[#F26522]">
                      {log.action}
                    </span>
                    <span className="text-[#0D0D0D] font-medium">
                      {log.details?.name || log.details?.email || log.details?.message || log.target_id}
                    </span>
                    <span className="text-[#736B63] text-[11px]">by {log.actor_email}</span>
                  </div>
                  <span className="text-[10px] text-[#736B63] font-mono shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
