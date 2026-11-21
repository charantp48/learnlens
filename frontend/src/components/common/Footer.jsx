import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-emerald-950/60 bg-[#050f0b] py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Safe AI Banner */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0a1f16] border border-emerald-500/25 text-lime-300 text-center text-xs max-w-2xl mx-auto shadow-inner">
          <AlertCircle className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{t('common.aiDisclaimer')}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
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
