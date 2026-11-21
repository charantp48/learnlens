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
   * Helper function to translate keys with fallback to English and parameter replacement.
   * Usage: t('nav.home') or t('student.welcome', { name: tName('Priya Sharma') })
   */
  const t = (keyPath, params = {}) => {
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
    let result = resolveKey(translationsMap[language]);
    
    // 2. Fallback to English
    if (result === undefined) {
      result = resolveKey(translationsMap.en);
    }

    // 3. Fallback to key itself if not found anywhere
    if (result === undefined) {
      result = keyPath;
    }

    // Replace {placeholder} parameters
    if (typeof result === 'string' && params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v !== undefined && v !== null ? v : '');
      });
    }

    return result;
  };

  /**
   * Helper function to translate people's names into the active language (English, Hindi, Kannada).
   * Supports comma-separated lists and single names.
   * Example: tName('Priya Sharma') -> 'प्रिया शर्मा' in Hindi, 'ಪ್ರಿಯಾ ಶರ್ಮಾ' in Kannada
   */
  const tName = (name) => {
    if (!name || typeof name !== 'string') return name || '';

    // Handle comma-separated lists (e.g. linkedChild: "Priya Sharma, Arjun Sharma")
    if (name.includes(',')) {
      return name
        .split(',')
        .map((n) => tName(n.trim()))
        .join(', ');
    }

    const trimmed = name.trim();

    // 1. Look up in active language names
    const activeNames = translationsMap[language]?.names;
    if (activeNames && activeNames[trimmed]) {
      return activeNames[trimmed];
    }

    // 2. Look up in English names fallback
    const enNames = translationsMap.en?.names;
    if (enNames && enNames[trimmed]) {
      return enNames[trimmed];
    }

    return name;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tName, availableLanguages }}>
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
