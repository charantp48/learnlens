import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { 
  GitFork, 
  Target, 
  Calendar, 
  Bot, 
  ArrowRight, 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('features.gapFinder_title'),
      desc: t('features.gapFinder_desc'),
      icon: GitFork,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
    {
      title: t('features.confidence_title'),
      desc: t('features.confidence_desc'),
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      title: t('features.studyPlanner_title'),
      desc: t('features.studyPlanner_desc'),
      icon: Calendar,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      title: t('features.aiTutor_title'),
      desc: t('features.aiTutor_desc'),
      icon: Bot,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    },
  ];

  const roles = [
    {
      title: t('roles.student_title'),
      desc: t('roles.student_desc'),
      icon: GraduationCap,
      badge: 'Core Priority',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      borderHover: 'hover:border-indigo-500/50',
      link: '/login?role=student',
    },
    {
      title: t('roles.teacher_title'),
      desc: t('roles.teacher_desc'),
      icon: Users,
      badge: 'Class Heatmaps',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      borderHover: 'hover:border-emerald-500/50',
      link: '/login?role=teacher',
    },
    {
      title: t('roles.parent_title'),
      desc: t('roles.parent_desc'),
      icon: HeartHandshake,
      badge: 'Jargon-Free View',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      borderHover: 'hover:border-pink-500/50',
      link: '/login?role=parent',
    },
    {
      title: t('roles.admin_title'),
      desc: t('roles.admin_desc'),
      icon: ShieldAlert,
      badge: 'School-Wide',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      borderHover: 'hover:border-amber-500/50',
      link: '/login?role=admin',
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {t('hero.title')}{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent block sm:inline">
            {t('hero.highlight')}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
          {t('hero.description')}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/quiz"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <span>{t('hero.startQuiz')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-base transition-all"
          >
            <span>{t('hero.viewDemo')}</span>
          </Link>
        </div>
      </section>

      {/* Feature Grid: 4 Core Innovations */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why LearnLens is Different
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Traditional tools give scores. LearnLens repairs the educational foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.bgColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Connected Roles Section */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {t('roles.title')}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {t('roles.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col justify-between p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 ${r.borderHover} transition-all space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{r.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.desc}</p>
                </div>
                <Link
                  to={r.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2"
                >
                  <span>{t('roles.enterRole')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
