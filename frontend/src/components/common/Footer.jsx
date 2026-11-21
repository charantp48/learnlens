import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-[#E3DCD3] bg-[#F5F0EA] py-12 text-xs text-[#6B6660] relative overflow-hidden">
      {/* Original Decorative Curved SVG Swoosh */}
      <svg
        className="absolute bottom-0 right-0 w-96 h-32 pointer-events-none opacity-20 text-[#F26522]"
        viewBox="0 0 400 120"
        fill="none"
      >
        <path
          d="M0 120C120 120 200 40 400 0"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Top Row: Brand & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E3DCD3]">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#0D0D0D] flex items-center justify-center shadow-xs">
              <span className="font-heading font-black text-white text-sm">
                L<span className="text-[#F26522]">.</span>
              </span>
            </div>
            <span className="font-heading text-base font-extrabold text-[#0D0D0D] tracking-tight">
              {t('app_name')}
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#6B6660]">
            <Link to="/" className="hover:text-[#0D0D0D] transition-colors">{t('nav.home')}</Link>
            <Link to="/quiz" className="hover:text-[#0D0D0D] transition-colors">{t('nav.quiz')}</Link>
            <Link to="/gaps" className="hover:text-[#0D0D0D] transition-colors">{t('nav.gaps')}</Link>
            <Link to="/planner" className="hover:text-[#0D0D0D] transition-colors">{t('nav.planner')}</Link>
            <Link to="/ai-tutor" className="hover:text-[#0D0D0D] transition-colors">{t('nav.aiTutor')}</Link>
            <Link to="/styleguide" className="hover:text-[#F26522] text-[#F26522] transition-colors">Style Guide</Link>
          </nav>
        </div>

        {/* AI Disclaimer Banner */}
        <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FBF8F4] border border-[#E3DCD3] text-[#0D0D0D] text-center text-xs max-w-2xl mx-auto shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#F26522] shrink-0" />
          <span className="font-medium">{t('common.aiDisclaimer')}</span>
        </div>

        {/* Bottom Row: Copyright & Slogan */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-[#6B6660]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F26522]" />
            <span>{t('common.copyright')}</span>
          </div>
          <div className="font-heading font-semibold text-[#0D0D0D]">
            Dream • Learn • Excel
          </div>
        </div>
      </div>
    </footer>
  );
}
