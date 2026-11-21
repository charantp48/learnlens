import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import { LogIn } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 max-w-2xl mx-auto space-y-8">
      {/* Brand Logo */}
      <div className="transform hover:scale-105 transition-transform duration-300">
        <Logo size="xl" showText={true} />
      </div>

      {/* One Short Tagline */}
      <p className="font-heading text-lg sm:text-2xl text-[#6B6660] font-semibold max-w-lg leading-relaxed">
        {t('tagline') || 'Smart, Inclusive, Personalized Education'}
      </p>

      {/* One Login Button */}
      <div className="pt-2">
        <Link to="/login">
          <Button variant="primary" size="lg" icon={<LogIn className="w-5 h-5" />}>
            {t('nav.login') || 'Sign In'}
          </Button>
        </Link>
      </div>
    </main>
  );
}
