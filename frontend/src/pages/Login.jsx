import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role');

  const demoAccounts = [
    {
      role: 'student',
      title: t('roles.student_title'),
      name: 'Priya Sharma (Class 9A)',
      desc: 'Takes quizzes, views prerequisite gap tree, generates custom study schedule.',
      icon: GraduationCap,
      color: 'from-indigo-600 to-blue-600',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      actionText: t('login.studentBtn'),
    },
    {
      role: 'teacher',
      title: t('roles.teacher_title'),
      name: 'Mr. Rajesh Rao (Maths Faculty)',
      desc: 'Classroom topic heatmaps, per-student gap tracking, quiz assignments & feedback.',
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      actionText: t('login.teacherBtn'),
    },
    {
      role: 'parent',
      title: t('roles.parent_title'),
      name: 'Sunita Sharma (Parent of Priya)',
      desc: 'Non-technical progress overview, weekly study planner monitoring, teacher notes.',
      icon: HeartHandshake,
      color: 'from-pink-600 to-rose-600',
      border: 'border-pink-500/40 hover:border-pink-400',
      actionText: t('login.parentBtn'),
    },
    {
      role: 'admin',
      title: t('roles.admin_title'),
      name: 'Principal / Academic Coordinator',
      desc: 'School-wide subject health, roster and class management, parent-student linkage.',
      icon: ShieldAlert,
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/40 hover:border-amber-400',
      actionText: t('login.adminBtn'),
    },
  ];

  const handleSelectRole = (role) => {
    // In Phase 3, this will authenticate via Supabase Auth
    // For Phase 1 skeleton, we route cleanly to demonstrate role separation
    if (role === 'student') navigate('/quiz');
    else navigate(`/${role}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('login.demoNotice')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">{t('login.title')}</h1>
        <p className="text-slate-400 text-sm">{t('login.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {demoAccounts.map((account) => {
          const Icon = account.icon;
          const isPreselected = preselectedRole === account.role;

          return (
            <div
              key={account.role}
              className={`p-5 rounded-2xl bg-slate-800/50 border transition-all ${
                isPreselected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-800/80'
                  : account.border
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${account.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {account.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                        Demo
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{account.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{account.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectRole(account.role)}
                  className="sm:self-center flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
                >
                  <span>{account.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
