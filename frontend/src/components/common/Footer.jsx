import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import Logo from './Logo';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-[#E3DCD3] bg-[#F5F0EA] py-8 text-xs text-[#6B6660]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} />
        </Link>

        {/* Copyright */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B6660]">
          <ShieldCheck className="w-4 h-4 text-[#F26522]" />
          <span>{t('common.copyright') || 'LearnLens - Smart, Inclusive Education'}</span>
        </div>
      </div>
    </footer>
  );
}
