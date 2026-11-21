import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { currentUser, isAuthenticated, getDashboardPath } = useAuth();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-slate-300">
          This portal is reserved for <span className="font-semibold text-amber-300">{allowedRoles.join(', ')}</span> accounts.
          You are currently signed in as <span className="font-semibold text-indigo-300">{currentUser.role}</span> ({currentUser.full_name}).
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to={getDashboardPath(currentUser.role)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Go to My Dashboard
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
