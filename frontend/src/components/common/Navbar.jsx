import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import Logo from './Logo';
import Button from './Button';
import { 
  Menu, 
  X, 
  LogIn, 
  LogOut,
  Home as HomeIcon
} from 'lucide-react';

export default function Navbar() {
  const { t } = useTranslation();
  const { currentUser, logout, isAuthenticated, getDashboardPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const role = currentUser?.role;
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isParent = role === 'parent';
  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0EA]/95 backdrop-blur-md border-b border-[#E3DCD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand at Left */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size="md" showText={true} />
          </Link>

          {/* Right Section: Home button (for non-admin roles), Language Switcher, Action Pill */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E3DCD3]">
                {/* Home button appears for student, teacher, and parent, and NOT for admin */}
                {!isAdmin && (
                  <Link to="/">
                    <Button variant="ghost" size="sm" icon={<HomeIcon className="w-4 h-4" />}>
                      {t('nav.home') || 'Home'}
                    </Button>
                  </Link>
                )}

                {/* Dashboard Shortcut */}
                <Link to={getDashboardPath(role)}>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FBF8F4] border border-[#E3DCD3] text-[#0D0D0D] hover:border-[#F26522] transition-colors">
                    {currentUser?.full_name || 'My Portal'}
                  </span>
                </Link>

                {/* Logout Button */}
                <Button
                  variant="dark"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                >
                  {t('nav.logout') || 'Sign Out'}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" icon={<LogIn className="w-4 h-4" />}>
                  {t('nav.login') || 'Sign In'}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0D0D0D] hover:bg-[#FBF8F4] transition-colors border border-[#E3DCD3]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3DCD3] bg-[#FBF8F4] px-4 pt-4 pb-6 space-y-4">
          <div className="space-y-2">
            {!isAdmin && isAuthenticated && (
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#0D0D0D] bg-[#F5F0EA] border border-[#E3DCD3]"
              >
                <HomeIcon className="w-4 h-4 text-[#F26522]" />
                <span>{t('nav.home') || 'Home'}</span>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath(role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#0D0D0D] bg-[#F5F0EA] border border-[#E3DCD3]"
                >
                  <span>Portal: {currentUser?.full_name}</span>
                </Link>
                <div className="pt-2">
                  <Button
                    variant="dark"
                    className="w-full justify-center"
                    onClick={handleLogout}
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    {t('nav.logout') || 'Sign Out'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center" icon={<LogIn className="w-4 h-4" />}>
                    {t('nav.login') || 'Sign In'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
