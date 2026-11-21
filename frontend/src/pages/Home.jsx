import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { 
  GitFork, 
  Target, 
  Calendar, 
  Bot, 
  ArrowRight, 
  ArrowUpRight,
  GraduationCap, 
  Users, 
  HeartHandshake, 
  ShieldAlert,
  Sparkles,
  Play,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  Activity,
  ChevronDown,
  Layers,
  Leaf
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const solutions = [
    {
      title: t('features.gapFinder_title'),
      desc: t('features.gapFinder_desc'),
      icon: GitFork,
      color: 'emerald',
      bgBadge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      link: '/gaps',
    },
    {
      title: t('features.confidence_title'),
      desc: t('features.confidence_desc'),
      icon: Target,
      color: 'cyan',
      bgBadge: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      link: '/quiz',
    },
    {
      title: t('features.studyPlanner_title'),
      desc: t('features.studyPlanner_desc'),
      icon: Calendar,
      color: 'amber',
      bgBadge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      link: '/planner',
    },
    {
      title: t('features.aiTutor_title'),
      desc: t('features.aiTutor_desc'),
      icon: Bot,
      color: 'purple',
      bgBadge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      link: '/ai-tutor',
    },
  ];

  const roles = [
    {
      title: t('roles.student_title'),
      desc: t('roles.student_desc'),
      icon: GraduationCap,
      badge: 'Core Priority',
      badgeColor: 'bg-lime-400/20 text-lime-300 border-lime-400/30',
      link: '/login?role=student',
    },
    {
      title: t('roles.teacher_title'),
      desc: t('roles.teacher_desc'),
      icon: Users,
      badge: 'Class Heatmaps',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      link: '/login?role=teacher',
    },
    {
      title: t('roles.parent_title'),
      desc: t('roles.parent_desc'),
      icon: HeartHandshake,
      badge: 'Jargon-Free',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      link: '/login?role=parent',
    },
    {
      title: t('roles.admin_title'),
      desc: t('roles.admin_desc'),
      icon: ShieldAlert,
      badge: 'School-Wide',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      link: '/login?role=admin',
    },
  ];

  return (
    <div className="space-y-24 py-4 sm:py-8">
      {/* =========================================================================
          HERO SECTION (Matching Figma Hero with Farmer / Atmospheric Backdrop)
      ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a1e16] via-[#091b13] to-[#07130e] border border-emerald-500/20 p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Ambient Organic Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11291e] border border-emerald-500/30 text-lime-400 text-xs font-semibold tracking-wider uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Massive Two-Tone Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              {t('hero.title')}{' '}
              <span className="text-lime-400 block mt-1">
                {t('hero.highlight')}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-emerald-100/75 max-w-xl leading-relaxed">
              {t('hero.description')}
            </p>

            {/* CTA Buttons Pair */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/quiz"
                className="px-6 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-lime-400/25 transition-all hover:scale-105 cursor-pointer"
              >
                <span>{t('hero.startQuiz')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="px-5 py-3.5 rounded-full bg-[#0e261d]/80 hover:bg-[#123126] text-white border border-emerald-500/30 font-semibold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400">
                  <Play className="w-3 h-3 fill-lime-400 ml-0.5" />
                </div>
                <span>{t('hero.viewDemo')}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual with Floating Live Insights Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/25 bg-gradient-to-tr from-[#081711] via-[#0d271e] to-[#123629] p-6 shadow-2xl min-h-[320px] flex flex-col justify-between">
              {/* Background Atmospheric Visual Pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Student Learner Avatar / Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
                    alt="Priya"
                    className="w-12 h-12 rounded-2xl bg-[#143527] border-2 border-lime-400 p-0.5 shadow-md"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Priya Sharma</span>
                      <span className="w-2 h-2 rounded-full bg-lime-400"></span>
                    </div>
                    <div className="text-[11px] text-emerald-300/80">Class 9-A Mathematics</div>
                  </div>
                </div>

                <span className="text-[10px] px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-300 font-bold border border-lime-400/30">
                  Diagnostic Active
                </span>
              </div>

              {/* Floating Live Diagnostic Insights Card (Matching Figma "Live Farm Insights") */}
              <div className="relative z-10 mt-6 p-4 rounded-2xl bg-[#06140f]/90 backdrop-blur-md border border-emerald-500/30 space-y-3.5 shadow-2xl">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <span>Live Diagnostic Insights</span>
                  </div>
                  <Link to="/gaps" className="text-[10px] text-lime-400 hover:underline flex items-center gap-0.5 font-semibold">
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Metric 1: Concept Mastery Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">Concept Mastery</span>
                    <span className="text-lime-300 font-bold">68% (Optimal)</span>
                  </div>
                  <div className="w-full bg-[#0a1e16] h-2 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                    <div className="bg-gradient-to-r from-emerald-400 to-lime-400 h-full rounded-full w-[68%]" />
                  </div>
                </div>

                {/* Metric 2 & 3: Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-[#0c2219] border border-emerald-500/15">
                    <div className="text-slate-400 text-[10px]">Class Average</div>
                    <div className="text-white font-bold text-xs mt-0.5">62.3%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0c2219] border border-emerald-500/15">
                    <div className="text-slate-400 text-[10px]">Root Bottleneck</div>
                    <div className="text-amber-300 font-bold text-[11px] truncate mt-0.5">Factoring (Cl. 8)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 4-Metric Glass Bar (Matching Figma bottom hero stats) */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-6 rounded-3xl bg-[#081a13]/85 backdrop-blur-md border border-emerald-500/20 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-emerald-500/15">
          <div className="flex items-center gap-3.5 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">25K+</div>
              <div className="text-[11px] text-slate-400">Active Students</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:pl-6 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">1.2M+</div>
              <div className="text-[11px] text-slate-400">Questions Evaluated</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:pl-6 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">40%</div>
              <div className="text-[11px] text-slate-400">Avg Mastery Increase</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:pl-6 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">30%</div>
              <div className="text-[11px] text-slate-400">Study Time Saved</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Mouse Pill */}
        <div className="flex flex-col items-center justify-center pt-8 text-[11px] text-emerald-300/60 gap-1.5">
          <div className="w-5 h-8 rounded-full border-2 border-emerald-500/30 flex justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-lime-400 animate-bounce" />
          </div>
          <span className="tracking-widest uppercase text-[10px]">Scroll to explore</span>
        </div>
      </section>


      {/* =========================================================================
          "WHAT WE DO" / SOLUTIONS SECTION (Matching Figma 4-Card Solutions)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-lime-400 uppercase">
              WHAT WE DO
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Intelligent Diagnostics for Every Student
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100/70 max-w-md leading-relaxed">
            From root-cause gap tracing to adaptive study schedules, we provide end-to-end learning tools that help every student master foundational concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#091d15]/75 hover:bg-[#0c241b] border border-emerald-500/15 hover:border-lime-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  {/* Colored Icon Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bgBadge}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to={item.link}
                    className="w-10 h-10 rounded-full bg-[#102a20] group-hover:bg-lime-400 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-md"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          "OUR TECHNOLOGY" SECTION (Matching Figma Tech Dashboard Showcase)
      ========================================================================= */}
      <section className="p-6 sm:p-10 rounded-3xl bg-[#081a13]/85 border border-emerald-500/20 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Tech Overview */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-lime-400 uppercase">
              OUR TECHNOLOGY
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Diagnostics. DAG. AI.{' '}
              <span className="text-lime-400 block mt-1">Better Together.</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
              We traverse curriculum dependency graphs to diagnose root-cause knowledge gaps and generate personalized learning roadmaps you can trust.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Real-time prerequisite graph traversal (Pure JavaScript)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Confidence-weighted uncertainty scoring (Sure / Guess)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Strict 25–30 minute adaptive sessions fitted to free hours</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                <span>Responsible Gemini AI with verified offline fallback</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/ai-tutor"
                className="px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-lime-400/25 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Explore AI Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity Dark Mode Dashboard Mockup (Matching Figma Farm Overview) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-emerald-500/30 bg-[#05110c] p-5 sm:p-6 shadow-2xl space-y-4">
              {/* Dashboard Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">Diagnostic Learning Overview</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0d261c] text-emerald-300 border border-emerald-500/25">
                    Class 9-A
                  </span>
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                </div>
              </div>

              {/* 4 Mini Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-[#091f16] border border-emerald-500/15">
                  <div className="text-[10px] text-slate-400">Total Topics</div>
                  <div className="text-base font-bold text-white mt-0.5">10 Topics</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#091f16] border border-emerald-500/15">
                  <div className="text-[10px] text-slate-400">Active Gaps</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">1 Root Gap</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#091f16] border border-emerald-500/15">
                  <div className="text-[10px] text-slate-400">Study Pace</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">3.6 sess/wk</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#091f16] border border-emerald-500/15">
                  <div className="text-[10px] text-slate-400">Field Health</div>
                  <div className="text-base font-bold text-lime-400 mt-0.5">85% Mastered</div>
                </div>
              </div>

              {/* Interactive Prerequisite DAG Graph Preview (Matching Figma visual map) */}
              <div className="p-4 rounded-2xl bg-[#081811] border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <GitFork className="w-3.5 h-3.5 text-lime-400" />
                    <span>Curriculum Prerequisite Tracing Engine (DAG)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">Root Cause Diagnosed</span>
                </div>

                {/* Nodes representation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#05110c] border border-emerald-500/15 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 w-full sm:w-auto text-center sm:text-left">
                    <div className="text-[9px] uppercase font-bold text-amber-400">Class 8 Prerequisite</div>
                    <div className="font-bold">Algebraic Factoring</div>
                    <div className="text-[10px] text-amber-200/70">45% Mastery (Weak Link)</div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />

                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 w-full sm:w-auto text-center sm:text-left">
                    <div className="text-[9px] uppercase font-bold text-rose-400">Class 9 Target Topic</div>
                    <div className="font-bold">Quadratic Equations</div>
                    <div className="text-[10px] text-rose-200/70">33% Score (Blocked)</div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />

                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 w-full sm:w-auto text-center sm:text-left">
                    <div className="text-[9px] uppercase font-bold text-emerald-400">Class 9 Downstream</div>
                    <div className="font-bold">Polynomial Roots</div>
                    <div className="text-[10px] text-emerald-200/70">Ready after unblocking</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed italic">
                  💡 <strong>System Finding:</strong> Solving middle-term splitting unblocks 66% of quadratic equation errors before exam day.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          FOUR ROLE EXPERIENCES (Student, Teacher, Parent, Admin)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-lime-400 uppercase">
            ONE DATABASE • FOUR PERSPECTIVES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('roles.title')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70">
            {t('roles.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#091d15]/75 hover:bg-[#0c241b] border border-emerald-500/15 hover:border-lime-500/40 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lime-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">
                    {r.title}
                  </h3>

                  <p className="text-xs text-slate-300/80 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to={r.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    <span>{t('roles.enterRole')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          BOTTOM CONVERSION BANNER (Matching Figma "Together, let's build..." Banner)
      ========================================================================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#071711] via-[#0d2a1e] to-[#071711] border border-emerald-500/25 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            Together, let's build an inclusive and smarter classroom.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
            Join LearnLens and experience personalized education that fixes foundational gaps instead of merely counting lost marks.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <div className="flex -space-x-2">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
                alt="Student"
                className="w-8 h-8 rounded-full border-2 border-[#0d2a1e] bg-slate-800"
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
                alt="Teacher"
                className="w-8 h-8 rounded-full border-2 border-[#0d2a1e] bg-slate-800"
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita"
                alt="Parent"
                className="w-8 h-8 rounded-full border-2 border-[#0d2a1e] bg-slate-800"
              />
            </div>
            <span className="text-[11px] text-emerald-200/80 font-medium">
              Trusted by students, teachers & parents
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            to="/quiz"
            className="px-8 py-4 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-xl shadow-lime-400/25 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Start Free Diagnostic</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
