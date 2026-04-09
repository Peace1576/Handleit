'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import type { Plan } from '@/types';
import { ArrowLeft, Globe, LogOut, Wallet } from 'lucide-react';

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
    window.setTimeout(() => setLangSaved(false), 2000);
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
      const response = await fetch('/api/paddle/portal', { method: 'POST' });
      const data = await response.json();
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

  const planLabel =
    plan === 'lifetime' ? 'Lifetime' :
    plan === 'pro' ? 'Pro' :
    plan === 'basic' ? 'Basic' :
    'Free';

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div className="page-wrap" style={{ padding: '24px 0 84px' }}>
        <button className="ghost-btn" onClick={() => router.push('/dashboard')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Settings</div>
          <h1 style={{ fontSize: 'clamp(30px,4vw,42px)', marginBottom: 10 }}>Keep things simple.</h1>
          <p className="section-copy">Language, billing, and account details are all in one place.</p>
        </div>

        <div className="two-column" style={{ alignItems: 'start', gap: 20 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Wallet size={18} color="#58A6FF" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Account</div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>Email</div>
                <div style={{ color: 'rgba(245,249,255,0.8)', fontSize: 14 }}>{email || 'Loading...'}</div>
              </div>
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>Plan</div>
                <div style={{ color: 'rgba(245,249,255,0.8)', fontSize: 14 }}>
                  {planLabel}
                  {plan === 'free' && usesRemaining !== null ? ` · ${usesRemaining} uses left` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Globe size={18} color="#58A6FF" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Language</div>
            </div>
            <div className="auto-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              {LANGUAGES.map(language => {
                const selected = lang === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLangChange(language.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 16,
                      border: `1px solid ${selected ? 'rgba(88,166,255,0.32)' : 'rgba(255,255,255,0.08)'}`,
                      background: selected ? 'rgba(88,166,255,0.12)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{language.flag}</span>
                    <span style={{ color: selected ? 'white' : 'rgba(232,241,255,0.62)', fontWeight: 700, fontSize: 13 }}>{language.name}</span>
                  </button>
                );
              })}
            </div>
            {langSaved && <div className="status-banner status-success" style={{ marginTop: 14 }}>Language updated.</div>}
          </div>
        </div>

        <div className="two-column" style={{ alignItems: 'start', gap: 20, marginTop: 20 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Billing</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>
              {plan === 'free' ? 'Need more usage?' : 'Manage your plan'}
            </div>
            <p className="section-copy" style={{ fontSize: 14, marginBottom: 16 }}>
              {plan === 'free'
                ? 'Upgrade when you need more usage, saved history, or unlimited access.'
                : 'Open the billing portal to manage your paid subscription.'}
            </p>
            {plan === 'free' ? (
              <button className="primary-btn" onClick={() => router.push('/pricing')}>View pricing</button>
            ) : plan !== 'lifetime' ? (
              <button className="secondary-btn" disabled={portalLoading} onClick={handleBillingPortal}>
                {portalLoading ? 'Opening...' : 'Manage subscription'}
              </button>
            ) : (
              <div className="status-banner status-success">You already have lifetime access.</div>
            )}
          </div>

          <div className="surface-card" style={{ padding: 22 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Session</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Sign out safely</div>
            <p className="section-copy" style={{ fontSize: 14, marginBottom: 16 }}>
              This will clear the current complaint-letter cache for your browser and return you to the home page.
            </p>
            <button className="secondary-btn" onClick={handleSignOut}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
