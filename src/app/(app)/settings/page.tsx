'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import type { Plan } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [usesRemaining, setUsesRemaining] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [langSaved, setLangSaved] = useState(false);

  const handleLangChange = (code: string) => {
    setLang(code);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2000);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: { data: { user: { email?: string } | null } }) => {
      if (res.data?.user) setEmail(res.data.user.email ?? '');
    });
    fetch('/api/user/usage').then(r => r.json()).then(d => {
      setPlan(d.plan);
      setUsesRemaining(d.uses_remaining);
    });
  }, []);

  const handleBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/paddle/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('No billing account found. Please upgrade first.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    localStorage.removeItem('handleit_letter_result_v1');
    localStorage.removeItem('handleit_letter_result_v2');
    await supabase.auth.signOut();
    router.push('/');
  };

  const planLabel = plan === 'lifetime' ? '♾️ Lifetime' : plan === 'pro' ? '⭐ Pro' : plan === 'basic' ? '✦ Basic' : '🆓 Free';
  const planColor = plan === 'free' ? '#F87171' : plan === 'basic' ? '#34D399' : '#34D399';

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div className="nav-bubble specular relative rounded-2xl mx-auto flex items-center justify-between tab-bar-expanded" style={{ maxWidth: 560, pointerEvents: 'all' }}>
          <button onClick={() => router.push('/dashboard')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>← Dashboard</button>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'white' }}><span style={{ color: '#60A5FA' }}>Handle</span>It</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px 80px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 32 }}>Settings</h1>

        {/* Account */}
        <div className="glass-card fade-up" style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Account</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>Email</span>
            {email}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>Plan</span>
            <span style={{ color: planColor, fontWeight: 700 }}>{planLabel}</span>
            {plan === 'free' && usesRemaining !== null && (
              <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>({usesRemaining} uses remaining)</span>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="glass-card fade-up fade-up-delay-1" style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Language</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {LANGUAGES.map(l => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
                    background: isSelected ? 'rgba(26,86,219,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${isSelected ? 'rgba(100,150,255,0.55)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{l.flag}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 12, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{l.label}</div>
                  </div>
                  {isSelected && (
                    <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: 'rgba(26,86,219,0.9)', border: '1.5px solid rgba(100,150,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {langSaved && (
            <div style={{ marginTop: 12, padding: '8px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
              ✓ Language updated
            </div>
          )}
        </div>

        {/* Plan actions */}
        {plan === 'free' && (
          <div className="glass-card fade-up fade-up-delay-1" style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Upgrade</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>Get unlimited access to all 3 tools, saved history, and no watermarks.</p>
            <button onClick={() => router.push('/pricing')} className="glass-btn-blue w-full" style={{ padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}>
              View Pricing →
            </button>
          </div>
        )}

        {plan && plan !== 'free' && plan !== 'lifetime' && (plan === 'pro' || plan === 'basic') && (
          <div className="glass-card fade-up fade-up-delay-1" style={{ borderRadius: 24, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Billing</div>
            <button onClick={handleBillingPortal} disabled={portalLoading} className="glass-btn w-full" style={{ padding: '14px', borderRadius: 16, fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', width: '100%' }}>
              {portalLoading ? '...' : 'Manage Subscription →'}
            </button>
          </div>
        )}

        {/* Sign out */}
        <button onClick={handleSignOut} style={{ width: '100%', marginTop: 8, padding: '14px', borderRadius: 16, color: 'rgba(255,255,255,0.3)', fontSize: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
