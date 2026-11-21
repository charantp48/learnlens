import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import hiTranslations from '../translations/hi.json';
import knTranslations from '../translations/kn.json';

const translationsMap = {
  en: enTranslations,
  hi: hiTranslations,
  kn: knTranslations,
};

export const availableLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('learnlens_lang') || 'en';
  });

  const setLanguage = (newLang) => {
    if (translationsMap[newLang]) {
      setLanguageState(newLang);
      localStorage.setItem('learnlens_lang', newLang);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.body.classList.remove('lang-en', 'lang-hi', 'lang-kn');
    document.body.classList.add(`lang-${language}`);
  }, [language]);

  /**
   * Helper function to translate keys with fallback to English.
   * Usage: t('nav.home') or t('features.gapFinder_title')
   */
  const t = (keyPath) => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');

    const resolveKey = (obj) => {
      let current = obj;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    // 1. Try selected language
    const primary = resolveKey(translationsMap[language]);
    if (primary !== undefined) return primary;

    // 2. Fallback to English
    const fallback = resolveKey(translationsMap.en);
    if (fallback !== undefined) return fallback;

    // 3. Fallback to key itself if not found anywhere
    return keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
