import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SectionLabel from '../components/common/SectionLabel';
import { 
  BookOpen, 
  GitFork, 
  Calendar, 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles,
  KeyRound,
  Compass,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { t, tName } = useTranslation();

  // Top weak topics identified by diagnostic
  const weakTopics = [
    { name: 'Rotational Dynamics & Torque', subject: 'Physics', accuracy: '42%', rootCause: 'Vector Cross Products (Cl. 11)' },
    { name: 'Chemical Equilibrium & Le Chatelier', subject: 'Chemistry', accuracy: '48%', rootCause: 'Reaction Stoichiometry' },
    { name: 'Algebraic Identities & Factoring', subject: 'Mathematics', accuracy: '45%', rootCause: 'Middle-Term Splitting' },
    { name: 'Recursion & Stack Frames', subject: 'Computer Science', accuracy: '50%', rootCause: 'Function Call Scope' },
  ];

  const quickLinks = [
    {
      title: 'Diagnostic Assessment',
      desc: 'Untimed multi-level evaluation across Physics, Chemistry, Maths & CS with confidence weighting.',
      icon: BookOpen,
      to: '/quiz',
      btnText: 'Start Assessment',
    },
    {
      title: 'Prerequisite Gap Tree',
      desc: 'Visualize your curriculum graph and inspect how foundational blocks cause current errors.',
      icon: GitFork,
      to: '/gaps',
      btnText: 'View Gap Graph',
    },
    {
      title: 'Adaptive Study Planner',
      desc: 'Generate 25–30 minute focused sessions scheduled strictly around your daily free hours.',
      icon: Calendar,
      to: '/planner',
      btnText: 'Open Planner',
    },
    {
      title: 'LearnLens AI Coach',
      desc: 'Ask questions, get hints, and practice misconceptions with textbook-aligned safe AI.',
      icon: Bot,
      to: '/ai-tutor',
      btnText: 'Ask Coach',
    },
    {
      title: 'Escape the Library',
      desc: '3-room diagnostic game: unlock rooms by solving core prerequisite and logic puzzles.',
      icon: KeyRound,
      to: '/student/escape-library',
      btnText: 'Enter Escape Room',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 sm:py-8">
      {/* Top Welcome Card with Current Level */}
      <Card variant="surface" className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#E3DCD3]">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'}
            alt={currentUser?.full_name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F5F0EA] border-2 border-[#F26522]/40 p-1 shrink-0 object-cover"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0D0D0D] text-white">
                Student Portal
              </span>
              <span className="text-xs font-semibold text-[#6B6660]">
                {currentUser?.class_name || 'Class 11 / JEE-KCET Track'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0D0D0D] tracking-tight">
              {t('student.welcome', { name: tName(currentUser?.full_name || 'Priya Sharma') })}
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] shrink-0 text-left sm:text-right space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B6660] flex items-center sm:justify-end gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#F26522]" />
            <span>Current Track</span>
          </div>
          <div className="font-heading font-extrabold text-base text-[#0D0D0D]">
            Level 2: Intermediate
          </div>
          <div className="text-[11px] text-[#6B6660]">
            Physics, Chemistry, Maths & CS
          </div>
        </div>
      </Card>

      {/* Coach Tip Banner */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-[#FFF3EC] border border-[#F26522]/30 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#F26522]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-[#F26522]" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded-full">
              Coach Tip of the Day
            </span>
          </div>
          <p className="text-[#0D0D0D] font-medium leading-relaxed">
            Master your Class 11 vector resolution and algebraic factoring first. Over <strong>65% of test errors</strong> in 12th-grade rotational dynamics and calculus trace back directly to these two foundational concepts.
          </p>
        </div>
      </div>

      {/* Top Weak Topics Identified */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border border-[#E3DCD3]">
        <div className="flex items-center justify-between border-b border-[#E3DCD3] pb-3">
          <div>
            <SectionLabel text="DIAGNOSTIC SUMMARY" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0D0D0D] flex items-center gap-2 mt-1">
              <AlertTriangle className="w-5 h-5 text-[#F26522]" />
              <span>Priority Focus Areas (Weak Topics)</span>
            </h2>
          </div>
          <span className="text-xs text-[#6B6660] font-medium">
            Threshold: &lt; 60% Mastery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {weakTopics.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] space-y-2 hover:border-[#F26522]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#6B6660] border border-[#E3DCD3]">
                  {item.subject}
                </span>
                <span className="font-mono font-bold text-xs text-[#F26522]">
                  {item.accuracy}
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-[#0D0D0D]">
                {item.name}
              </h3>
              <div className="text-[11px] text-[#6B6660]">
                Root Prerequisite: <strong className="text-[#0D0D0D]">{item.rootCause}</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons to Student Sub-Modules */}
      <div className="space-y-4">
        <div>
          <SectionLabel text="STUDENT MODULES" />
          <h2 className="font-heading font-extrabold text-xl text-[#0D0D0D] mt-1">
            Learning Pathways
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                variant="surface"
                className="p-5 flex flex-col justify-between space-y-4 border border-[#E3DCD3] hover:border-[#F26522]/50 hover:shadow-md transition-all"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#0D0D0D] text-white flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#F26522]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#0D0D0D]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B6660] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E3DCD3]/60">
                  <Link to={item.to}>
                    <Button variant="secondary" size="sm" className="w-full justify-center" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {item.btnText}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
