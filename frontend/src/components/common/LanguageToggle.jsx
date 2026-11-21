import React from 'react';
import { useTranslation, availableLanguages } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-[#FBF8F4] p-1 rounded-full border border-[#E3DCD3] shadow-xs text-xs font-semibold">
      <Globe className="w-3.5 h-3.5 text-[#6B6660] ml-2" />
      <div className="flex items-center space-x-0.5">
        {availableLanguages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#F26522] text-white font-bold shadow-xs'
                  : 'text-[#6B6660] hover:text-[#0D0D0D] hover:bg-[#E3DCD3]/40'
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
