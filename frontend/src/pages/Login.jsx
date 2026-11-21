import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Users,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  Lock,
  KeyRound
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function Login() {
  const { loginWithCredentials, loginDemo, currentUser, getDashboardPath } = useAuth();
  const { t, tName } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Forced Password Change State (for newly created real accounts)
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempPasswordUsed, setTempPasswordUsed] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  // Expired session detection
  const isExpired = searchParams.get('expired') === 'true';

  // Demo mode check (enabled by default; set VITE_DEMO_MODE=false to hide)
  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

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

      // Check if user must change their temporary password at first login
      if (user.must_change_password) {
        setPendingUser(user);
        setTempPasswordUsed(password);
        setForcePasswordChange(true);
        setLoading(false);
        return;
      }

      const destination = getDashboardPath(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forced Password Change at First Login
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword === tempPasswordUsed) {
      setChangePasswordError('New password must be different from your temporary password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          currentPassword: tempPasswordUsed,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setChangePasswordSuccess(true);
      // Update local storage
      const savedUser = JSON.parse(localStorage.getItem('learnlens_user') || '{}');
      savedUser.must_change_password = false;
      localStorage.setItem('learnlens_user', JSON.stringify(savedUser));

      setTimeout(() => {
        const destination = getDashboardPath(pendingUser.role);
        navigate(destination, { replace: true });
      }, 800);
    } catch (err) {
      setChangePasswordError(err.message || 'Error updating password.');
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
          {forcePasswordChange ? 'Set Your Permanent Password' : 'Sign In to Your Account'}
        </h1>
      </div>

      {/* Expired Session Notice */}
      {isExpired && !forcePasswordChange && (
        <div className="p-4 rounded-2xl bg-[#FFF3EC] border border-[#F26522]/30 flex items-center gap-3 text-xs text-[#0D0D0D]">
          <AlertCircle className="w-5 h-5 text-[#F26522] shrink-0" />
          <span>Your session has expired. Please sign in again to continue your work.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && !forcePasswordChange && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Authentication Issue</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* FORCED PASSWORD CHANGE VIEW (At First Login) */}
      {forcePasswordChange ? (
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 border border-[#E3DCD3] shadow-md">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>First-Time Sign In Notice</span>
            </div>
            <p>
              Welcome, <strong>{pendingUser?.full_name}</strong>! For your account security, you must replace your temporary password with a permanent one before entering your portal.
            </p>
          </div>

          {changePasswordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {changePasswordError}
            </div>
          )}

          {changePasswordSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Password updated successfully! Loading your dashboard...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                  New Permanent Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E3DCD3] bg-[#FBF8F4] text-sm text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E3DCD3] bg-[#FBF8F4] text-sm text-[#0D0D0D] focus:outline-hidden focus:border-[#F26522]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full justify-center"
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              >
                {loading ? 'Setting Password...' : 'Save Password & Enter Portal'}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        /* STANDARD LOGIN CARD */
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 border border-[#E3DCD3] shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. your.name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-[#0D0D0D] transition-colors focus:outline-hidden ${
                  emailError
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-[#E3DCD3] bg-[#FBF8F4] focus:border-[#F26522]'
                }`}
              />
              {emailError && (
                <p className="text-[11px] text-rose-600 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-medium text-[#6B6660] hover:text-[#0D0D0D] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-[#0D0D0D] transition-colors focus:outline-hidden ${
                  passwordError
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-[#E3DCD3] bg-[#FBF8F4] focus:border-[#F26522]'
                }`}
              />
              {passwordError && (
                <p className="text-[11px] text-rose-600 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full justify-center shadow-md cursor-pointer"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Accounts Selection */}
          {isDemoMode && (
            <div className="pt-4 border-t border-[#E3DCD3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6660]">
                  Demo Quick Fill
                </span>
                <span className="text-[10px] text-[#6B6660] bg-[#F5F0EA] px-2 py-0.5 rounded-full border border-[#E3DCD3]">
                  1-Click Test Access
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
      )}
    </div>
  );
}
