'use client';

import { useState } from 'react';
import { HandleItRobotLogo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/translations';

export function LanguageModal() {
  const { lang, setLang, t } = useLanguage();
  const [selected, setSelected] = useState(lang);

  const handleContinue = () => {
    setLang(selected);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(6,6,18,0.85)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(60px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        borderRadius: 32,
        padding: 32,
        maxWidth: 480,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)' }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(26,86,219,0.35)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <HandleItRobotLogo size={56} />
            </div>
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 8 }}>
              {t.chooseLanguage}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>
              {t.languageSub}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {LANGUAGES.map(language => {
              const isSelected = selected === language.code;
              return (
                <button
                  key={language.code}
                  onClick={() => setSelected(language.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                    background: isSelected ? 'rgba(26,86,219,0.35)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${isSelected ? 'rgba(100,150,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isSelected ? '0 0 20px rgba(26,86,219,0.25)' : 'none',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{language.flag}</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{language.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{language.label}</div>
                  </div>
                  {isSelected && (
                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'rgba(26,86,219,0.8)', border: '2px solid rgba(100,150,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%', padding: '15px', borderRadius: 18,
              background: 'rgba(26,86,219,0.8)',
              border: '1px solid rgba(100,150,255,0.5)',
              boxShadow: '0 8px 32px rgba(26,86,219,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.continueBtn} {'\u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
