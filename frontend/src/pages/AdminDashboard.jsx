import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';

export default function AdminDashboard() {
  const { t, tName } = useTranslation();

  const [metrics, setMetrics] = useState({
    counts: { students: 4, teachers: 2, parents: 2, classes: 2, totalUsers: 9 },
    users: [],
    classes: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    className: 'Class 11-A',
  });

  const [newClass, setNewClass] = useState({
    name: '',
    section: 'A',
    subject: 'Mathematics',
    teacher: '',
  });

  const [assignment, setAssignment] = useState({
    classId: '',
    userId: '',
  });

  const [parentLink, setParentLink] = useState({
    parentId: '',
    studentId: '',
  });

  // Fetch admin metrics from server
  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
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
    setTimeout(() => setFeedback(null), 5000);
  };

  // 1. Toggle user status (Enable / Disable)
  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
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
      // Local fallback
      setMetrics((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId
            ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
            : u
        ),
      }));
      showFeedback('success', 'User status updated');
    }
  };

  // 2. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      showFeedback('error', 'Name and email are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', t('admin.successUserCreated') || 'User created successfully!');
        setNewUser({ name: '', email: '', role: 'student', password: '', className: 'Class 11-A' });
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to create user');
      }
    } catch (err) {
      showFeedback('error', 'Network error creating user');
    }
  };

  // 3. Create Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.name) {
      showFeedback('error', 'Class name is required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', t('admin.successClassCreated') || 'Class created successfully!');
        setNewClass({ name: '', section: 'A', subject: 'Mathematics', teacher: '' });
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to create class');
      }
    } catch (err) {
      showFeedback('error', 'Network error creating class');
    }
  };

  // 4. Assign Teacher or Student to Class
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignment.classId || !assignment.userId) {
      showFeedback('error', 'Select both a class and a user');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', t('admin.successAssigned') || 'Assignment saved successfully!');
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to assign to class');
      }
    } catch (err) {
      showFeedback('error', 'Network error saving assignment');
    }
  };

  // 5. Link Parent to Child
  const handleLinkParent = async (e) => {
    e.preventDefault();
    if (!parentLink.parentId || !parentLink.studentId) {
      showFeedback('error', 'Select both a parent and a student');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentLink),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', t('admin.successParentLinked') || 'Parent linked to student successfully!');
        fetchMetrics();
      } else {
        showFeedback('error', data.message || 'Failed to link parent');
      }
    } catch (err) {
      showFeedback('error', 'Network error linking parent');
    }
  };

  // Filtered users for table
  const filteredUsers = metrics.users.filter((user) => {
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.className && user.className.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const studentsList = metrics.users.filter((u) => u.role === 'student');
  const teachersList = metrics.users.filter((u) => u.role === 'teacher');
  const parentsList = metrics.users.filter((u) => u.role === 'parent');

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

  return (
    <div className="min-h-screen bg-[#F5F0EA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header (ONE SINGLE PAGE - strictly NO Home button) */}
        <div>
          <SectionLabel text={t('admin.consoleBadge') || 'Administrator Console'} />
          <h1 className="text-3xl font-extrabold text-[#0D0D0D] tracking-tight mt-1">
            {t('admin.title') || 'School Administration Console'}
          </h1>
          <p className="text-sm text-[#736B63] mt-1 max-w-2xl">
            {t('admin.subtitle') || 'Manage users, classes, assignments, and permissions on one single page.'}
          </p>
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

        {/* 1. Counts of Students, Teachers, Parents, and Cohorts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                {t('admin.studentsCount') || 'Students'}
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{metrics.counts.students}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                {t('admin.teachersCount') || 'Teachers'}
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{metrics.counts.teachers}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                {t('admin.parentsCount') || 'Parents'}
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{metrics.counts.parents}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                {t('admin.classesCount') || 'Cohorts'}
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{metrics.counts.classes}</p>
            </div>
          </Card>
        </div>

        {/* 2. User Table with Role Filters and Status Toggle */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E3DCD3] pb-5">
            <div>
              <h2 className="text-lg font-bold text-[#0D0D0D]">
                {t('admin.userTableTitle') || 'User Directory'}
              </h2>
              <p className="text-xs text-[#736B63]">
                {t('admin.userTableSubtitle') || 'View and manage all registered accounts across roles.'}
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

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
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
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#0D0D0D] text-white shadow-xs'
                    : 'bg-[#FBF8F4] text-[#736B63] border border-[#E3DCD3] hover:border-[#0D0D0D]'
                }`}
              >
                {f.label}
              </button>
            ))}
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
                  <th className="py-3 px-3">{t('admin.colStatus') || 'Status'}</th>
                  <th className="py-3 px-3 text-right">{t('admin.colActions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCD3]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#736B63]">
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
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
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

        {/* 3. Forms Section (All 4 forms on this one single page) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Form 1: Create User */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3]">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  {t('admin.createUserTitle') || 'Create User'}
                </h3>
                <p className="text-[11px] text-[#736B63]">Register a student, teacher, parent, or admin</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.fullName') || 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.emailAddress') || 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@learnlens.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                    {t('admin.role') || 'Role'}
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                    {t('admin.password') || 'Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="Temporary password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
                {t('admin.submitCreateUser') || 'Create User'}
              </Button>
            </form>
          </Card>

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

            <form onSubmit={handleCreateClass} className="space-y-3">
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

            <form onSubmit={handleAssign} className="space-y-3">
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

          {/* Form 4: Link Parent to Child */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3]">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F26522]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0D0D0D]">
                  {t('admin.linkParentTitle') || 'Link Parent to Child'}
                </h3>
                <p className="text-[11px] text-[#736B63]">Establish guardianship link for parent portal</p>
              </div>
            </div>

            <form onSubmit={handleLinkParent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.selectParent') || 'Select Parent'}
                </label>
                <select
                  value={parentLink.parentId}
                  onChange={(e) => setParentLink({ ...parentLink, parentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                >
                  <option value="">Select parent...</option>
                  {parentsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {tName(p.name)} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0D0D0D] mb-1">
                  {t('admin.selectStudent') || 'Select Student (Child)'}
                </label>
                <select
                  value={parentLink.studentId}
                  onChange={(e) => setParentLink({ ...parentLink, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E3DCD3] bg-[#FBF8F4] text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                >
                  <option value="">Select student...</option>
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {tName(s.name)} ({s.className || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="dark" size="sm" className="w-full mt-2">
                {t('admin.submitLinkParent') || 'Link Parent'}
              </Button>
            </form>
          </Card>

        </div>

      </div>
    </div>
  );
}
