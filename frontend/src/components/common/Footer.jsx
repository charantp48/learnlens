import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Safe AI Banner */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-300/90 text-center text-xs max-w-2xl mx-auto">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('common.aiDisclaimer')}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('common.copyright')}</span>
          </div>
          <div className="text-slate-500">
            Hackathon 2026 Edition • Student-First Personalized Learning
          </div>
        </div>
      </div>
    </footer>
  );
}
