import React from 'react';
import { useTranslation, availableLanguages } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-sm text-xs font-medium">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      <div className="flex items-center space-x-1">
        {availableLanguages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
              title={lang.label}
              aria-label={`Switch to ${lang.label}`}
            >
              {lang.nativeLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
