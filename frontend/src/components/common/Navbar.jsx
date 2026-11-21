import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import Button from './Button';
import { 
  Menu, 
  X, 
  BookOpen, 
  GitFork, 
  Calendar, 
  Sparkles, 
  LogIn,
  LogOut,
  LayoutDashboard,
  Layers
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

  // Nav links
  const studentNavLinks = [
    { to: '/student', label: t('nav.studentDashboard') || 'Dashboard' },
    { to: '/quiz', label: t('nav.quiz') },
    { to: '/gaps', label: t('nav.gaps') },
    { to: '/planner', label: t('nav.planner') },
    { to: '/ai-tutor', label: t('nav.aiTutor') },
  ];

  const defaultNavLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/quiz', label: t('nav.quiz') },
    { to: '/gaps', label: t('nav.gaps') },
    { to: '/planner', label: t('nav.planner') },
    { to: '/ai-tutor', label: t('nav.aiTutor') },
  ];

  const activeLinks = currentUser?.role === 'student' ? studentNavLinks : defaultNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0EA]/90 backdrop-blur-md border-b border-[#E3DCD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand at Left */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0D0D0D] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-heading font-black text-white text-base">
                L<span className="text-[#F26522]">.</span>
              </span>
            </div>
            <div>
              <span className="font-heading text-lg font-extrabold text-[#0D0D0D] tracking-tight block">
                {t('app_name')}
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links with Orange Underline on Active */}
          <nav className="hidden lg:flex items-center space-x-8">
            {activeLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-semibold transition-colors py-2 relative ${
                    isActive
                      ? 'text-[#0D0D0D]'
                      : 'text-[#6B6660] hover:text-[#0D0D0D]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F26522] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Language Switcher & Action Pill */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E3DCD3]">
                <Link
                  to={getDashboardPath(currentUser.role)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FBF8F4] hover:bg-white border border-[#E3DCD3] transition-colors shadow-xs"
                >
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-6 h-6 rounded-full bg-[#E3DCD3]"
                  />
                  <div className="text-left text-xs">
                    <div className="font-bold text-[#0D0D0D] leading-tight truncate max-w-[90px]">
                      {currentUser.full_name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#F26522] font-semibold capitalize">
                      {currentUser.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#6B6660] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button to="/login" variant="primary" size="sm" showArrow>
                {t('nav.login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-[#FBF8F4] border border-[#E3DCD3] text-[#0D0D0D] hover:bg-[#E3DCD3]/40 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#0D0D0D]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3DCD3] bg-[#F5F0EA] px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated && (
            <div className="flex items-center justify-between p-3 mb-2 rounded-[16px] bg-[#FBF8F4] border border-[#E3DCD3]">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-8 h-8 rounded-full bg-[#E3DCD3]"
                />
                <div>
                  <div className="text-xs font-bold text-[#0D0D0D]">{currentUser.full_name}</div>
                  <div className="text-[10px] text-[#F26522] capitalize font-semibold">{currentUser.role} Dashboard</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

          {activeLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FBF8F4] text-[#0D0D0D] border border-[#E3DCD3]'
                    : 'text-[#6B6660] hover:text-[#0D0D0D] hover:bg-[#FBF8F4]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="pt-2">
              <Button
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                variant="primary"
                size="md"
                showArrow
                className="w-full"
              >
                {t('nav.login')}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
