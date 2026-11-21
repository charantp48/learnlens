import React, { useState, useEffect } from 'react';
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
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const { t, tName } = useTranslation();
  const { loginWithCredentials, loginDemo, currentUser, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Expired session detection
  const isExpired = searchParams.get('expired') === 'true';

  // Demo mode check (enabled by default; set VITE_DEMO_MODE=false to hide)
  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

  // If already logged in, offer immediate redirect
  useEffect(() => {
    if (currentUser && !isExpired) {
      // User is already signed in
    }
  }, [currentUser, isExpired]);

  // Demo account profiles
  const demoAccounts = [
    {
      role: 'student',
      title: 'Student',
      email: 'priya.student@learnlens.demo',
      password: 'Student@123',
      name: 'Priya Sharma',
      detail: 'Class 11 / JEE Track',
      icon: GraduationCap,
    },
    {
      role: 'teacher',
      title: 'Teacher',
      email: 'rajesh.teacher@learnlens.demo',
      password: 'Teacher@123',
      name: 'Mr. Rajesh Rao',
      detail: 'Mathematics',
      icon: Users,
    },
    {
      role: 'parent',
      title: 'Parent',
      email: 'sunita.parent@learnlens.demo',
      password: 'Parent@123',
      name: 'Sunita Sharma',
      detail: 'Parent of Priya',
      icon: HeartHandshake,
    },
    {
      role: 'admin',
      title: 'Admin',
      email: 'admin@learnlens.demo',
      password: 'Admin@123',
      name: 'Dr. Vikram Malhotra',
      detail: 'Central Admin',
      icon: ShieldAlert,
    },
  ];

  // Validation
  const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  const emailError = touched.email && (!email.trim() ? 'Email is required' : !isValidEmail(email) ? 'Please enter a valid email address' : '');
  const passwordError = touched.password && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '');

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValidEmail(email) || password.length < 6) {
      setError('Please resolve validation errors before continuing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await loginWithCredentials(email, password);
      const destination = getDashboardPath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Click
  const handleQuickDemo = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);

    try {
      const user = loginDemo(account.role);
      const destination = getDashboardPath(user.role);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 400);
    } catch (err) {
      setError('Could not sign in with demo account.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-14 px-4 space-y-8">
      {/* Animated Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex transform hover:scale-105 transition-transform duration-300">
          <Logo size="lg" showText={true} />
        </div>
        <p className="font-heading text-sm sm:text-base text-[#6B6660] font-semibold">
          {t('tagline') || 'Smart, Inclusive, Personalized Education'}
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0D0D0D] tracking-tight pt-1">
          Sign In to Your Account
        </h1>
      </div>

      {/* Expired Session Notice */}
      {isExpired && (
        <div className="p-4 rounded-2xl bg-[#FFF3EC] border border-[#F26522]/30 flex items-center gap-3 text-xs text-[#0D0D0D]">
          <AlertCircle className="w-5 h-5 text-[#F26522] shrink-0" />
          <span>Your session has expired. Please sign in again to continue your work.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Authentication Issue</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Interactive Login Card */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-6 border border-[#E3DCD3] shadow-md">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6B6660] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="name@learnlens.demo"
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F0EA] border text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6660] focus:outline-none transition-colors ${
                  emailError
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-[#E3DCD3] focus:border-[#F26522]'
                }`}
                required
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-rose-600 pl-1 font-medium">{emailError}</p>
            )}
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B6660] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F5F0EA] border text-xs sm:text-sm text-[#0D0D0D] placeholder:text-[#6B6660] focus:outline-none transition-colors ${
                  passwordError
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-[#E3DCD3] focus:border-[#F26522]'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6660] hover:text-[#0D0D0D] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-rose-600 pl-1 font-medium">{passwordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full justify-center"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </form>

        {/* Demo Mode Quick Buttons */}
        {isDemoMode && (
          <div className="pt-6 border-t border-[#E3DCD3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6660] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F26522]" />
                <span>Demo Accounts (1-Click Fill)</span>
              </span>
              <span className="text-[10px] text-[#6B6660] font-mono">Demo Mode Active</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickDemo(account)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-[#F5F0EA] border border-[#E3DCD3] hover:border-[#F26522] hover:bg-white transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#F26522]" />
                      </div>
                      <div className="truncate">
                        <div className="font-heading font-bold text-xs text-[#0D0D0D] group-hover:text-[#F26522] transition-colors truncate">
                          {tName(account.title)}: {tName(account.name)}
                        </div>
                        <div className="text-[10px] text-[#6B6660] truncate">
                          {tName(account.detail)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
