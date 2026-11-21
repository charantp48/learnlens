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
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const journeySteps = [
    {
      step: '01',
      title: 'Take Diagnostic Quiz',
      desc: 'Test your knowledge with confidence tags (Sure / Not Sure / Guessing). Guessing is recognized and weighted.',
      icon: BookOpen,
      to: '/quiz',
      cta: 'Start Assessment',
    },
    {
      step: '02',
      title: 'Prerequisite Gap Finder',
      desc: 'View your prerequisite tree. See exactly which foundational topic is causing errors in current coursework.',
      icon: GitFork,
      to: '/gaps',
      cta: 'View Graph',
    },
    {
      step: '03',
      title: 'Adaptive Study Planner',
      desc: 'Enter your free hours. The algorithm schedules bite-sized 25-minute sessions tackling root gaps first.',
      icon: Calendar,
      to: '/planner',
      cta: 'Generate Plan',
    },
    {
      step: '04',
      title: 'AI Learning Assistant',
      desc: 'Get step-by-step hints and practice questions from Gemini AI with offline fallback reliability.',
      icon: Bot,
      to: '/ai-tutor',
      cta: 'Ask Assistant',
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4 sm:py-8">
      {/* Top Welcome Banner */}
      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Ambient Decorative Swoosh */}
        <svg className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none text-[#F26522]" viewBox="0 0 300 200" fill="none">
          <circle cx="200" cy="100" r="100" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
        </svg>

        <div className="flex items-center gap-5 relative z-10">
          <img
            src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'}
            alt={currentUser?.full_name}
            className="w-16 h-16 rounded-full bg-[#E3DCD3] border-2 border-[#0D0D0D] p-0.5 shadow-sm shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] font-bold">
                {currentUser?.class_name || 'Class 9-A'}
              </span>
              <span className="text-xs text-[#6B6660]">Class 9 Mathematics</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0D0D0D] tracking-tight">
              Welcome back, {currentUser?.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6660] max-w-lg leading-relaxed">
              Your personalized learning roadmap is active. Ready to turn weak topics into strengths?
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <Button to="/quiz" variant="primary" size="md" showArrow>
            {t('nav.quiz')}
          </Button>
        </div>
      </Card>

      {/* 4 Snapshot KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" hoverLift className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6B6660] font-semibold">
            <span>Diagnostic Score</span>
            <TrendingUp className="w-4 h-4 text-[#F26522]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#0D0D0D]">
            50% <span className="text-xs font-normal text-[#6B6660]">(5/10)</span>
          </div>
          <div className="text-[11px] text-[#F26522] font-semibold flex items-center gap-1 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>1 prerequisite gap identified</span>
          </div>
        </Card>

        <Card padding="sm" hoverLift className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6B6660] font-semibold">
            <span>Root Prerequisite Gap</span>
            <GitFork className="w-4 h-4 text-[#F26522]" />
          </div>
          <div className="font-heading text-base font-bold text-[#0D0D0D] truncate">
            Algebraic Factoring
          </div>
          <div className="text-[11px] text-[#6B6660] pt-1">
            Blocking Quadratic Equations (Cl. 9)
          </div>
        </Card>

        <Card padding="sm" hoverLift className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6B6660] font-semibold">
            <span>Adaptive Study Plan</span>
            <Clock className="w-4 h-4 text-[#F26522]" />
          </div>
          <div className="font-heading text-2xl font-black text-[#0D0D0D]">
            3 Sessions
          </div>
          <div className="text-[11px] text-[#0D0D0D] font-semibold flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F26522] shrink-0" />
            <span>25-30 mins per session</span>
          </div>
        </Card>

        <Card padding="sm" hoverLift className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#6B6660] font-semibold">
            <span>AI Practice Coach</span>
            <Sparkles className="w-4 h-4 text-[#F26522]" />
          </div>
          <div className="font-heading text-base font-bold text-[#0D0D0D]">
            Active & Ready
          </div>
          <div className="text-[11px] text-[#6B6660] pt-1">
            Offline textbook fallback active
          </div>
        </Card>
      </div>

      {/* 4-Step Learning Journey Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SectionLabel>RECOMMENDED LEARNING ROADMAP</SectionLabel>
          <span className="text-xs text-[#6B6660]">Step-by-step unblocking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {journeySteps.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} padding="lg" hoverLift className="flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5 text-[#F26522]" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D]">
                      Step {item.step}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-[#E3DCD3]">
                  <span className="text-xs font-bold text-[#0D0D0D]">{item.cta}</span>
                  <Link
                    to={item.to}
                    className="w-9 h-9 rounded-full bg-[#0D0D0D] text-white group-hover:bg-[#F26522] flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ArrowRight className="w-4 h-4" />
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
