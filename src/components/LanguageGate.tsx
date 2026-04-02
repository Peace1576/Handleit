'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageModal } from '@/components/LanguageModal';

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const { showModal } = useLanguage();
  return (
    <>
      {showModal && <LanguageModal />}
      {children}
    </>
  );
}
