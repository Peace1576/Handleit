'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { UsageBar } from '@/components/UsageBar';
import { HandleItRobotLogo } from '@/components/Logo';
import { trackGoogleAdsConversion } from '@/lib/googleAds';
import { ClipboardList, Mail, MessageCircle, ArrowRight, Settings, History, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const GOOGLE_ADS_PURCHASE_CONVERSION_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_ID ??
  'AW-18072726819/DVhQCOqF1JgcEKPa36lD';
const GOOGLE_ADS_PURCHASE_SESSION_KEY = 'handleit_google_ads_purchase_tracked';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showUpgraded, setShowUpgraded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const TOOLS = [
    { id: 'form-explainer', Icon: ClipboardList, name: t.formName, desc: t.formDesc, color: '#58A6FF', accent: t.tools.form.accent },
    { id: 'complaint-letter', Icon: Mail, name: t.letterName, desc: t.letterDesc, color: '#8B7BFF', accent: t.tools.letter.accent },
    { id: 'ai-reply', Icon: MessageCircle, name: t.replyName, desc: t.replyDesc, color: '#33D0A5', accent: t.tools.reply.accent },
  ];

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgraded(true);
      const timeout = window.setTimeout(() => setShowUpgraded(false), 4000);
      return () => window.clearTimeout(timeout);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('upgraded') !== 'true') return;

    const purchaseId = searchParams.get('purchase') ?? 'upgraded';
    const trackedPurchaseId = sessionStorage.getItem(GOOGLE_ADS_PURCHASE_SESSION_KEY);
    if (trackedPurchaseId === purchaseId) return;

    trackGoogleAdsConversion({
      sendTo: GOOGLE_ADS_PURCHASE_CONVERSION_ID,
      transactionId: purchaseId,
    });
    sessionStorage.setItem(GOOGLE_ADS_PURCHASE_SESSION_KEY, purchaseId);
  }, [searchParams]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onScroll = () => setScrolled(element.scrollTop > 20);
    element.addEventListener('scroll', onScroll);
    return () => element.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    localStorage.removeItem('handleit_letter_result_v1');
    localStorage.removeItem('handleit_letter_result_v2');
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div ref={containerRef} className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div
          className={`nav-bubble specular page-wrap ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HandleItRobotLogo size={46} />
            <div style={{ fontSize: 18, fontWeight: 800 }}><span style={{ color: '#58A6FF' }}>Handle</span>It</div>
          </div>

          <div className="desktop-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <UsageBar />
            <button className="secondary-btn" onClick={() => router.push('/history')}><History size={15} /> {t.history}</button>
            <button className="secondary-btn" onClick={() => router.push('/settings')}><Settings size={15} /> {t.settings}</button>
            <button className="secondary-btn" onClick={handleSignOut}><LogOut size={15} /> {t.signOut}</button>
          </div>

          <div className="mobile-nav-shell" ref={mobileMenuRef}>
            <button
              className="mobile-nav-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {mobileMenuOpen && (
              <div className="mobile-nav-menu">
                <div className="mobile-nav-status">
                  <UsageBar />
                </div>
                <button className="secondary-btn mobile-nav-item" onClick={() => { setMobileMenuOpen(false); router.push('/history'); }}>
                  <History size={15} /> {t.history}
                </button>
                <button className="secondary-btn mobile-nav-item" onClick={() => { setMobileMenuOpen(false); router.push('/settings'); }}>
                  <Settings size={15} /> {t.settings}
                </button>
                <button className="secondary-btn mobile-nav-item" onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}>
                  <LogOut size={15} /> {t.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '40px 0 88px' }}>
        {showUpgraded && (
          <div className="status-banner status-success fade-up" style={{ marginBottom: 20 }}>
            {t.dashUpgraded}
          </div>
        )}

        <div className="two-column fade-up" style={{ alignItems: 'center', gap: 28, marginBottom: 28 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.dashboardPage.workspace}</div>
            <h1 style={{ fontSize: 'clamp(30px,4vw,46px)', marginBottom: 12 }}>
              {t.dashHeading} <span style={{ color: '#58A6FF' }}>{t.dashHandle}</span>
            </h1>
            <p className="section-copy" style={{ maxWidth: 560, marginBottom: 20 }}>
              {t.dashboardPage.intro}
            </p>
            <div className="metric-row">
              <div className="metric-pill">
                <span className="metric-value">{t.dashboardPage.metrics.toolsValue}</span>
                <span className="metric-label">{t.dashboardPage.metrics.toolsLabel}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-value">{t.dashboardPage.metrics.flowValue}</span>
                <span className="metric-label">{t.dashboardPage.metrics.flowLabel}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-value">{t.dashboardPage.metrics.savedValue}</span>
                <span className="metric-label">{t.dashboardPage.metrics.savedLabel}</span>
              </div>
            </div>
          </div>

          <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 22 }}>
            <div className="pill" style={{ marginBottom: 14 }}>
              <Sparkles size={14} color="#58A6FF" />
              {t.dashboardPage.quickStart}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {t.dashboardPage.quickStartSteps.map(step => (
                <div key={step} style={{ display: 'flex', gap: 10, color: 'rgba(245,249,255,0.74)', fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: 'rgba(88,166,255,0.16)', border: '1px solid rgba(88,166,255,0.26)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#58A6FF', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auto-grid">
          {TOOLS.map((tool, index) => (
            <div
              key={tool.id}
              className={`tool-card fade-up fade-up-delay-${Math.min(index + 1, 3)}`}
              onClick={() => router.push(`/tools/${tool.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 16, background: `${tool.color}18`, border: `1px solid ${tool.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <tool.Icon size={22} color={tool.color} />
              </div>
              <div className="section-label" style={{ color: tool.color, marginBottom: 8 }}>{t.dashboardPage.toolLabel}</div>
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>{tool.name}</h3>
              <p style={{ color: 'rgba(232,241,255,0.72)', fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{tool.accent}</p>
              <p style={{ color: 'rgba(232,241,255,0.48)', fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>{tool.desc}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: tool.color, fontWeight: 800, fontSize: 13 }}>
                {t.dashOpen}
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
