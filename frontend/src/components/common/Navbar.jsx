import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import { 
  GraduationCap, 
  Menu, 
  X, 
  BookOpen, 
  GitFork, 
  Calendar, 
  Sparkles, 
  LogIn,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { t } = useTranslation();
  const { currentUser, logout, isAuthenticated, getDashboardPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Student prioritized navigation links
  const studentNavLinks = [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/quiz', label: t('nav.quiz'), icon: BookOpen },
    { to: '/gaps', label: t('nav.gaps'), icon: GitFork },
    { to: '/planner', label: t('nav.planner'), icon: Calendar },
    { to: '/ai-tutor', label: t('nav.aiTutor'), icon: Sparkles },
  ];

  const defaultNavLinks = [
    { to: '/', label: t('nav.home'), icon: BookOpen },
    { to: '/quiz', label: t('nav.quiz'), icon: BookOpen },
    { to: '/gaps', label: t('nav.gaps'), icon: GitFork },
    { to: '/planner', label: t('nav.planner'), icon: Calendar },
    { to: '/ai-tutor', label: t('nav.aiTutor'), icon: Sparkles },
  ];

  const activeLinks = currentUser?.role === 'student' ? studentNavLinks : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                {t('app_name')}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {activeLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Language Switcher & Auth User Pill */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <Link
                  to={getDashboardPath(currentUser.role)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-6 h-6 rounded-full bg-slate-700"
                  />
                  <div className="text-left text-xs">
                    <div className="font-semibold text-white leading-tight truncate max-w-[100px]">
                      {currentUser.full_name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-indigo-400 capitalize">
                      {currentUser.role}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all hover:shadow-indigo-500/30"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated && (
            <div className="flex items-center justify-between p-3 mb-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-8 h-8 rounded-full bg-slate-700"
                />
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.full_name}</div>
                  <div className="text-[10px] text-indigo-400 capitalize">{currentUser.role} Dashboard</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

          {activeLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
