import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SectionLabel from '../components/common/SectionLabel';
import StepList from '../components/common/StepList';
import CtaBanner from '../components/common/CtaBanner';
import { 
  GitFork, 
  Target, 
  Calendar, 
  Bot, 
  ArrowRight, 
  Play, 
  Sparkles, 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  ShieldAlert,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const processSteps = [
    {
      number: '01',
      title: t('process.step1_title'),
      description: t('process.step1_desc'),
    },
    {
      number: '02',
      title: t('process.step2_title'),
      description: t('process.step2_desc'),
    },
    {
      number: '03',
      title: t('process.step3_title'),
      description: t('process.step3_desc'),
    },
  ];

  const roleCards = [
    {
      roleKey: 'student',
      title: t('roles.student_title'),
      desc: t('roles.student_desc'),
      icon: GraduationCap,
      badge: 'Core Priority',
      link: '/login?role=student',
    },
    {
      roleKey: 'teacher',
      title: t('roles.teacher_title'),
      desc: t('roles.teacher_desc'),
      icon: Users,
      badge: 'Class Heatmaps',
      link: '/login?role=teacher',
    },
    {
      roleKey: 'parent',
      title: t('roles.parent_title'),
      desc: t('roles.parent_desc'),
      icon: HeartHandshake,
      badge: 'Jargon-Free',
      link: '/login?role=parent',
    },
    {
      roleKey: 'admin',
      title: t('roles.admin_title'),
      desc: t('roles.admin_desc'),
      icon: ShieldAlert,
      badge: 'School-Wide',
      link: '/login?role=admin',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 py-4">
      {/* =========================================================================
          1. HERO SECTION (Editorial Headline + Original Orange Ribbon Visual)
      ========================================================================= */}
      <section className="relative pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Eyebrow, All-Caps Headline & Dual CTA Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <SectionLabel>{t('hero.badge')}</SectionLabel>

            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0D0D0D] tracking-tight uppercase leading-[1.05]">
              {t('hero.title')}<br />
              FIX THE ROOT <span className="text-[#F26522]">GAP.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B6660] max-w-xl leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button to="/quiz" variant="primary" size="lg" showArrow>
                {t('hero.startQuiz')}
              </Button>

              <Button to="/login" variant="secondary" size="lg" icon={Play}>
                {t('hero.viewDemo')}
              </Button>
            </div>
          </div>

          {/* Right Column: Original Visual with Dynamic Orange Light-Trails & Floating Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Visual Container */}
            <div className="relative w-full max-w-md h-[380px] sm:h-[420px] rounded-[24px] bg-[#FBF8F4] border border-[#E3DCD3] card-shadow p-6 overflow-hidden flex flex-col justify-between">
              {/* Original Glowing Sun Disk in Background */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-gradient-to-b from-[#F26522] to-[#F26522]/30 opacity-90 blur-xs pointer-events-none" />

              {/* Original Dynamic Swirling Orange SVG Energy Ribbon */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 400"
                fill="none"
              >
                <path
                  d="M20 280C80 200 180 80 320 120C400 140 380 280 260 320C160 350 100 240 180 180C260 120 360 220 380 260"
                  stroke="#F26522"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="opacity-90"
                />
                <path
                  d="M40 300C100 220 200 100 340 140"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="opacity-60"
                />
              </svg>

              {/* Top Row: Mini Badge & Live Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#0D0D0D] text-white text-[11px] font-bold">
                  Class 9 Mathematics
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#F26522]">
                  <span className="w-2 h-2 rounded-full bg-[#F26522] animate-pulse" />
                  Live Diagnostic
                </span>
              </div>

              {/* Floating Live Diagnostic Insights Card */}
              <div className="relative z-10 p-4 rounded-[18px] bg-white/95 backdrop-blur-md border border-[#E3DCD3] shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E3DCD3]">
                  <span className="font-heading font-bold text-[#0D0D0D]">Live Learning Diagnostic</span>
                  <Link to="/gaps" className="text-[10px] text-[#F26522] font-bold hover:underline flex items-center gap-0.5">
                    View Graph <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B6660] font-medium">Concept Mastery</span>
                    <span className="text-[#0D0D0D] font-bold">68%</span>
                  </div>
                  <div className="w-full bg-[#F5F0EA] h-2 rounded-full overflow-hidden p-0.5 border border-[#E3DCD3]">
                    <div className="bg-[#F26522] h-full rounded-full w-[68%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-[#FBF8F4] border border-[#E3DCD3]">
                    <div className="text-[#6B6660] text-[10px]">Class Average</div>
                    <div className="text-[#0D0D0D] font-bold text-xs mt-0.5">62.3%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FBF8F4] border border-[#E3DCD3]">
                    <div className="text-[#6B6660] text-[10px]">Diagnosed Gap</div>
                    <div className="text-[#F26522] font-bold text-[11px] truncate mt-0.5">Factoring (Cl. 8)</div>
                  </div>
                </div>
              </div>

              {/* Small Vertical Indicator (01 / 03 with arrow matching reference) */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-[10px] font-mono font-bold text-[#6B6660]">
                <span>01</span>
                <span className="w-3 h-px bg-[#E3DCD3]" />
                <span>03</span>
                <ChevronDown className="w-3 h-3 text-[#F26522] animate-bounce mt-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ABOUT STRIP WITH 3 STATS (Matching Reference About Section)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Card with Silhouette & Orange Sun Orb */}
          <div className="lg:col-span-5">
            <Card padding="none" className="h-[280px] sm:h-[320px] overflow-hidden relative flex flex-col justify-between p-6">
              {/* Graphic Composition */}
              <div className="absolute inset-0 bg-[#0D0D0D]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#F26522] opacity-90" />
              
              {/* Abstract Architectural Diagonal Silhouette */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 200" fill="none">
                <path d="M0 200L150 50L300 200H0Z" fill="#FFFFFF" />
              </svg>

              {/* Pill Badge */}
              <div className="relative z-10 self-start">
                <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F26522]" />
                  <span>About Platform</span>
                </span>
              </div>

              <div className="relative z-10 text-white space-y-1">
                <div className="font-heading font-extrabold text-lg">Prerequisite Graph Engine</div>
                <div className="text-xs text-[#A8A29E]">100% Deterministic Pure JavaScript Logic</div>
              </div>
            </Card>
          </div>

          {/* Right Column: Headline, Narrative & 3 Stats Strip */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <SectionLabel>{t('about.label')}</SectionLabel>
              {/* Subtle Asterisk / Starburst Motif */}
              <div className="w-6 h-6 text-[#F26522] hidden sm:block">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight leading-tight">
              {t('about.title')} <span className="text-[#F26522]">{t('about.highlight')}</span>
            </h2>

            <p className="text-sm text-[#6B6660] leading-relaxed max-w-xl">
              {t('about.desc')}
            </p>

            {/* 3 Stats Strip with Hairline Dividers */}
            <div className="pt-4 border-t border-[#E3DCD3] grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="font-heading text-2xl sm:text-3xl font-black text-[#0D0D0D]">
                  {t('about.stat1_num')}
                </div>
                <div className="text-xs text-[#6B6660] mt-1 font-medium">
                  {t('about.stat1_label')}
                </div>
              </div>

              <div className="border-l border-[#E3DCD3] pl-4 sm:pl-6">
                <div className="font-heading text-2xl sm:text-3xl font-black text-[#0D0D0D]">
                  {t('about.stat2_num')}
                </div>
                <div className="text-xs text-[#6B6660] mt-1 font-medium">
                  {t('about.stat2_label')}
                </div>
              </div>

              <div className="border-l border-[#E3DCD3] pl-4 sm:pl-6">
                <div className="font-heading text-2xl sm:text-3xl font-black text-[#0D0D0D]">
                  {t('about.stat3_num')}
                </div>
                <div className="text-xs text-[#6B6660] mt-1 font-medium">
                  {t('about.stat3_label')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURES SECTION AS 3 ROUNDED CARDS (Matching Reference Services Grid)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <SectionLabel>OUR CAPABILITIES</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
              From diagnostic assessment to adaptive planning —{' '}
              <span className="text-[#F26522]">we do it all.</span>
            </h2>
          </div>

          <Button to="/quiz" variant="secondary" size="sm" showArrow className="self-start md:self-auto">
            View All Capabilities
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Prerequisite Gap Tracing */}
          <Card variant="surface" hoverLift padding="lg" className="flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                <GitFork className="w-5 h-5 text-[#F26522]" />
              </div>

              <h3 className="font-heading text-xl font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors">
                {t('features.gapFinder_title')}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed">
                {t('features.gapFinder_desc')}
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D0D0D]">Traverse Curriculum DAG</span>
              <Link
                to="/gaps"
                className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white group-hover:bg-[#F26522] flex items-center justify-center transition-colors shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Card 2: Confidence-Weighted Diagnostics */}
          <Card variant="surface" hoverLift padding="lg" className="flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                <Target className="w-5 h-5 text-[#F26522]" />
              </div>

              <h3 className="font-heading text-xl font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors">
                {t('features.confidence_title')}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed">
                {t('features.confidence_desc')}
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D0D0D]">Sure / Not Sure / Guess</span>
              <Link
                to="/quiz"
                className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white group-hover:bg-[#F26522] flex items-center justify-center transition-colors shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Card 3: Adaptive Study Planner */}
          <Card variant="surface" hoverLift padding="lg" className="flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5 text-[#F26522]" />
              </div>

              <h3 className="font-heading text-xl font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors">
                {t('features.studyPlanner_title')}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed">
                {t('features.studyPlanner_desc')}
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D0D0D]">25–30 Min Sessions</span>
              <Link
                to="/planner"
                className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white group-hover:bg-[#F26522] flex items-center justify-center transition-colors shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          4. 3-STEP PROCESS ("Test", "Trace", "Improve") (Matching Reference Process)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Original Torus / Energy Orb Graphic */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-[#F26522]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Original Geometric Ring SVG */}
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Metallic Dark Ring */}
                <circle cx="100" cy="100" r="70" stroke="#0D0D0D" strokeWidth="18" strokeLinecap="round" />
                <circle cx="100" cy="100" r="70" stroke="#333333" strokeWidth="6" />
                
                {/* Swirling Orange Energy Arc */}
                <path
                  d="M50 150C70 180 130 180 160 140C190 100 170 40 120 30"
                  stroke="#F26522"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="30" r="5" fill="#FFFFFF" />
              </svg>

              {/* Center Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-heading font-black text-2xl text-[#0D0D0D]">3 STEPS</span>
                <span className="text-[10px] font-bold tracking-widest text-[#F26522] uppercase">To Mastery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Process Headline & Vertical StepList */}
          <div className="lg:col-span-7 space-y-6">
            <SectionLabel>{t('process.label')}</SectionLabel>

            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
              {t('process.title')} <span className="text-[#F26522]">{t('process.highlight')}</span>
            </h2>

            <p className="text-sm text-[#6B6660] max-w-lg leading-relaxed">
              Three focused stages engineered to turn classroom struggles into lasting academic confidence.
            </p>

            <div className="pt-2">
              <StepList steps={processSteps} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. ROLE DASHBOARDS ACCESS (Student, Teacher, Parent, Admin)
      ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <SectionLabel>CONNECTED COMMUNITY</SectionLabel>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
              {t('roles.title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6660] max-w-md">
            {t('roles.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleCards.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Card key={idx} variant="surface" hoverLift padding="md" className="flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5 text-[#F26522]" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D]">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-base font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors">
                    {r.title}
                  </h3>

                  <p className="text-xs text-[#6B6660] leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to={r.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D0D0D] group-hover:text-[#F26522] transition-colors"
                  >
                    <span>{t('roles.enterRole')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. CALL TO ACTION BANNER (Matching Reference Dark Banner)
      ========================================================================= */}
      <section>
        <CtaBanner
          title={t('cta.title')}
          accentWord={t('cta.highlight')}
          subtitle={t('cta.subtitle')}
          buttonText={t('cta.button')}
          buttonTo="/quiz"
        />
      </section>
    </div>
  );
}
