import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';
import Logo from '../components/common/Logo';
import { 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  ShieldAlert, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const { loginDemo, currentUser, getDashboardPath } = useAuth();
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
      actionText: t('login.studentBtn'),
    },
    {
      role: 'teacher',
      title: t('roles.teacher_title'),
      name: 'Mr. Rajesh Rao (Maths Faculty)',
      desc: 'Classroom topic heatmaps, per-student gap tracking, quiz assignments & feedback.',
      icon: Users,
      actionText: t('login.teacherBtn'),
    },
    {
      role: 'parent',
      title: t('roles.parent_title'),
      name: 'Sunita Sharma (Parent of Priya)',
      desc: 'Non-technical progress overview, weekly study planner monitoring, teacher notes.',
      icon: HeartHandshake,
      actionText: t('login.parentBtn'),
    },
    {
      role: 'admin',
      title: t('roles.admin_title'),
      name: 'Dr. Vikram Malhotra (Principal)',
      desc: 'School-wide subject health, roster and class management, parent-student linkage.',
      icon: ShieldAlert,
      actionText: t('login.adminBtn'),
    },
  ];

  const handleSelectRole = (role) => {
    loginDemo(role);
    const destination = getDashboardPath(role);
    navigate(destination);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Brand Header with Logo */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <Logo size="lg" showText={true} />
        </div>
        <SectionLabel className="justify-center">ROLE ACCESS</SectionLabel>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D0D0D] tracking-tight">
          Select Your Role to <span className="text-[#F26522]">Sign In</span>
        </h1>
        <p className="text-[#6B6660] text-sm max-w-md mx-auto leading-relaxed">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Active Session Notification */}
      {currentUser && (
        <Card padding="sm" className="bg-[#FBF8F4] border-[#E3DCD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#F26522] shrink-0" />
            <span className="text-[#6B6660]">
              Currently signed in as <strong className="text-[#0D0D0D]">{currentUser.full_name}</strong> ({currentUser.role}).
            </span>
          </div>
          <Button
            onClick={() => navigate(getDashboardPath(currentUser.role))}
            variant="dark"
            size="sm"
            showArrow
          >
            Go to Active Dashboard
          </Button>
        </Card>
      )}

      {/* Demo Roles Grid */}
      <div className="space-y-4">
        {demoAccounts.map((account) => {
          const Icon = account.icon;
          const isCurrent = currentUser?.role === account.role;
          const isPreselected = preselectedRole === account.role;

          return (
            <Card
              key={account.role}
              padding="md"
              hoverLift
              className={`transition-all ${
                isCurrent
                  ? 'border-[#F26522] ring-2 ring-[#F26522]/30 bg-white'
                  : isPreselected
                  ? 'border-[#0D0D0D] bg-white'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className="w-5 h-5 text-[#F26522]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6660]">
                        {account.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] font-bold">
                        Demo Account
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F26522]/15 text-[#F26522] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#0D0D0D]">
                      {account.name}
                    </h3>
                    <p className="text-xs text-[#6B6660] leading-relaxed max-w-md">
                      {account.desc}
                    </p>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <Button
                    onClick={() => handleSelectRole(account.role)}
                    variant={isCurrent ? 'dark' : 'primary'}
                    size="sm"
                    showArrow
                  >
                    {account.actionText}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
