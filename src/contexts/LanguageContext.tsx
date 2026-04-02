'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LANGUAGES, TRANSLATIONS, type Language } from '@/lib/translations';

interface LanguageContextType {
  lang: string;
  language: Language;
  t: typeof TRANSLATIONS['en'];
  setLang: (code: string) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('en');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('handleit_language');
    if (stored && TRANSLATIONS[stored as keyof typeof TRANSLATIONS]) {
      setLangState(stored);
    } else {
      // No language set — show modal
      setShowModal(true);
    }
  }, []);

  const setLang = (code: string) => {
    setLangState(code);
    localStorage.setItem('handleit_language', code);
    setShowModal(false);
    // Update html dir for RTL languages
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.dir = lang?.dir ?? 'ltr';
    document.documentElement.lang = code;
  };

  const language = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  const t = (TRANSLATIONS[lang as keyof typeof TRANSLATIONS] ?? TRANSLATIONS.en) as typeof TRANSLATIONS['en'];

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
