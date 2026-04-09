'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy } from '@/lib/formatCopy';
import { LANGUAGES } from '@/lib/translations';
import type { Plan } from '@/types';
import { ArrowLeft, Globe, LogOut, Wallet } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
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
      else alert(t.settingsPage.noBillingAccount);
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
    plan === 'lifetime' ? t.settingsPage.lifetimePlan :
    plan === 'pro' ? t.settingsPage.proPlan :
    plan === 'basic' ? t.settingsPage.basicPlan :
    t.settingsPage.freePlan;

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div className="page-wrap" style={{ padding: '24px 0 84px' }}>
        <button className="ghost-btn" onClick={() => router.push('/dashboard')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} />
          {t.dashboard}
        </button>

        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>{t.settings}</div>
          <h1 style={{ fontSize: 'clamp(30px,4vw,42px)', marginBottom: 10 }}>{t.settingsPage.title}</h1>
          <p className="section-copy">{t.settingsPage.subtitle}</p>
        </div>

        <div className="two-column" style={{ alignItems: 'start', gap: 20 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Wallet size={18} color="#58A6FF" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{t.settingsPage.account}</div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>{t.settingsPage.email}</div>
                <div style={{ color: 'rgba(245,249,255,0.8)', fontSize: 14 }}>{email || t.settingsPage.loading}</div>
              </div>
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>{t.settingsPage.plan}</div>
                <div style={{ color: 'rgba(245,249,255,0.8)', fontSize: 14 }}>
                  {planLabel}
                  {plan === 'free' && usesRemaining !== null ? ` · ${formatCopy(t.settingsPage.usesLeft, { count: usesRemaining })}` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Globe size={18} color="#58A6FF" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{t.settingsPage.language}</div>
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
            {langSaved && <div className="status-banner status-success" style={{ marginTop: 14 }}>{t.settingsPage.languageUpdated}</div>}
          </div>
        </div>

        <div className="two-column" style={{ alignItems: 'start', gap: 20, marginTop: 20 }}>
          <div className="surface-card" style={{ padding: 22 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.settingsPage.billing}</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>
              {plan === 'free' ? t.settingsPage.needMoreUsage : t.settingsPage.managePlan}
            </div>
            <p className="section-copy" style={{ fontSize: 14, marginBottom: 16 }}>
              {plan === 'free'
                ? t.settingsPage.billingFreeCopy
                : t.settingsPage.billingPaidCopy}
            </p>
            {plan === 'free' ? (
              <button className="primary-btn" onClick={() => router.push('/pricing')}>{t.settingsPage.viewPricing}</button>
            ) : plan !== 'lifetime' ? (
              <button className="secondary-btn" disabled={portalLoading} onClick={handleBillingPortal}>
                {portalLoading ? t.settingsPage.opening : t.settingsPage.manageSubscription}
              </button>
            ) : (
              <div className="status-banner status-success">{t.settingsPage.lifetimeAccess}</div>
            )}
          </div>

          <div className="surface-card" style={{ padding: 22 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.settingsPage.session}</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>{t.settingsPage.signOutSafely}</div>
            <p className="section-copy" style={{ fontSize: 14, marginBottom: 16 }}>
              {t.settingsPage.signOutCopy}
            </p>
            <button className="secondary-btn" onClick={handleSignOut}>
              <LogOut size={16} />
              {t.signOut}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
