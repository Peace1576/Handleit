'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Language } from '@/lib/translations';
import { getAppTranslations, getLanguageMeta, getSupportedLanguage, type AppTranslations } from '@/lib/appTranslations';

interface LanguageContextType {
  lang: string;
  language: Language;
  t: AppTranslations;
  setLang: (code: string) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('en');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const applyLanguage = (code: string) => {
      const meta = getLanguageMeta(code);
      document.documentElement.dir = meta.dir;
      document.documentElement.lang = meta.code;
    };

    const detectBrowserLanguage = () => {
      const candidates = [
        ...(navigator.languages ?? []),
        navigator.language,
      ].filter(Boolean);

      for (const candidate of candidates) {
        const matched = getSupportedLanguage(candidate);
        if (matched) return matched;
      }

      return null;
    };

    const stored = localStorage.getItem('handleit_language');
    const storedLanguage = getSupportedLanguage(stored);

    if (storedLanguage) {
      setLangState(storedLanguage);
      applyLanguage(storedLanguage);
      return;
    }

    const detectedLanguage = detectBrowserLanguage();
    if (detectedLanguage) {
      setLangState(detectedLanguage);
      localStorage.setItem('handleit_language', detectedLanguage);
      applyLanguage(detectedLanguage);
      return;
    }

    applyLanguage('en');
    setShowModal(true);
  }, []);

  const setLang = (code: string) => {
    const supported = getSupportedLanguage(code) ?? 'en';
    setLangState(supported);
    localStorage.setItem('handleit_language', supported);
    setShowModal(false);
    const nextLanguage = getLanguageMeta(supported);
    document.documentElement.dir = nextLanguage.dir;
    document.documentElement.lang = supported;
  };

  const language = getLanguageMeta(lang);
  const t = getAppTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, language, t, setLang, showModal, setShowModal }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
