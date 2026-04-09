'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/Particles';
import { HandleItRobotLogo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, Mail, MessageCircle, ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { isLifetimeDealActive } from '@/lib/launch';

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const lifetimeActive = isLifetimeDealActive();
  const PREVIEW_TABS = [
    { ...t.landingPage.previewTabs[0], color: '#58A6FF' },
    { ...t.landingPage.previewTabs[1], color: '#8B7BFF' },
    { ...t.landingPage.previewTabs[2], color: '#33D0A5' },
  ];
  const TOOLS = [
    { id: 'form-explainer', title: t.formName, icon: ClipboardList, color: '#58A6FF', summary: t.landingPage.toolCards[0].summary, points: t.landingPage.toolCards[0].points },
    { id: 'complaint-letter', title: t.letterName, icon: Mail, color: '#8B7BFF', summary: t.landingPage.toolCards[1].summary, points: t.landingPage.toolCards[1].points },
    { id: 'ai-reply', title: t.replyName, icon: MessageCircle, color: '#33D0A5', summary: t.landingPage.toolCards[2].summary, points: t.landingPage.toolCards[2].points },
  ];
  const FAQS = t.landingPage.faqs;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTab(prev => (prev + 1) % PREVIEW_TABS.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [PREVIEW_TABS.length]);

  const preview = PREVIEW_TABS[activeTab];

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 50, padding: '0 16px', pointerEvents: 'none' }}>
        <div
          className={`nav-bubble specular page-wrap ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
        >
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            <HandleItRobotLogo size={46} />
            <span style={{ fontSize: 18, fontWeight: 800 }}>
              <span style={{ color: '#58A6FF' }}>Handle</span>It
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="ghost-btn" onClick={() => router.push('/pricing')}>{t.pricing}</button>
            <button className="ghost-btn" onClick={() => document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' })}>{t.faq}</button>
            <button className="secondary-btn" onClick={() => router.push('/login')}>{t.logIn}</button>
            <button className="primary-btn" onClick={() => router.push('/dashboard')}>{t.startFree.replace(' →', '')} <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      <section style={{ padding: '56px 16px 72px' }}>
        <div className="page-wrap two-column" style={{ alignItems: 'center', gap: 28 }}>
          <div className="fade-up">
            {lifetimeActive && (
              <div className="pill" style={{ marginBottom: 20, color: '#c8d9ff' }}>
                <Sparkles size={14} color="#58A6FF" />
                {t.landingPage.heroPill}
              </div>
            )}

            <div className="section-label" style={{ marginBottom: 12 }}>{t.landingPage.heroEyebrow}</div>
            <h1 className="section-title" style={{ marginBottom: 18 }}>
              {t.landingPage.heroTitle}
            </h1>
            <p className="section-copy" style={{ maxWidth: 560, marginBottom: 28 }}>
              {t.landingPage.heroSubtitle}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <button className="primary-btn" onClick={() => router.push('/dashboard')}>
                {t.landingPage.tryFreeCta}
                <ArrowRight size={16} />
              </button>
              <button className="secondary-btn" onClick={() => router.push('/pricing')}>
                {t.landingPage.seePricingCta}
              </button>
            </div>

            <div className="metric-row">
              <div className="metric-pill">
                <span className="metric-value">{t.landingPage.metrics.purposeBuiltValue}</span>
                <span className="metric-label">{t.landingPage.metrics.purposeBuiltLabel}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-value">{t.landingPage.metrics.freeValue}</span>
                <span className="metric-label">{t.landingPage.metrics.freeLabel}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-value">{t.landingPage.metrics.resultValue}</span>
                <span className="metric-label">{t.landingPage.metrics.resultLabel}</span>
              </div>
            </div>
          </div>

          <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 24, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="section-label" style={{ color: preview.color, marginBottom: 0 }}>{preview.label}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PREVIEW_TABS.map((tab, index) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(index)}
                    style={{
                      width: activeTab === index ? 20 : 8,
                      height: 8,
                      borderRadius: 999,
                      border: 'none',
                      background: activeTab === index ? tab.color : 'rgba(255,255,255,0.12)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {PREVIEW_TABS.map((tab, index) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(index)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: `1px solid ${activeTab === index ? `${tab.color}55` : 'rgba(255,255,255,0.08)'}`,
                    background: activeTab === index ? `${tab.color}18` : 'rgba(255,255,255,0.04)',
                    color: activeTab === index ? 'white' : 'rgba(232,241,255,0.58)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
              <div style={{ color: 'rgba(232,241,255,0.38)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                {t.landingPage.previewExampleInput}
              </div>
              <div style={{ color: 'rgba(245,249,255,0.85)', fontSize: 15, lineHeight: 1.7 }}>
                {preview.input}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 18, background: `${preview.color}10`, border: `1px solid ${preview.color}35` }}>
              <div style={{ color: preview.color, fontSize: 13, fontWeight: 800, marginBottom: 12 }}>
                {preview.title}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {preview.bullets.map((bullet) => (
                  <div key={bullet} style={{ display: 'flex', gap: 10, color: 'rgba(245,249,255,0.78)', fontSize: 14, lineHeight: 1.6 }}>
                    <CheckCircle2 size={16} color={preview.color} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 16px 72px' }}>
        <div className="page-wrap surface-card fade-up" style={{ padding: 22 }}>
          <div className="auto-grid">
            <div>
              <div className="section-label" style={{ marginBottom: 10 }}>{t.landingPage.whyLabel}</div>
              <div style={{ color: 'white', fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
                {t.landingPage.whyTitle}
              </div>
            </div>
            {t.landingPage.whyPoints.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(232,241,255,0.74)', fontSize: 14 }}>
                <Shield size={16} color="#58A6FF" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 16px 72px' }}>
        <div className="page-wrap">
          <div style={{ marginBottom: 24 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.landingPage.toolsLabel}</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', marginBottom: 10 }}>{t.landingPage.toolsTitle}</h2>
            <p className="section-copy" style={{ maxWidth: 620 }}>
              {t.landingPage.toolsSubtitle}
            </p>
          </div>

          <div className="auto-grid">
            {TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className={`tool-card fade-up fade-up-delay-${Math.min(index + 1, 3)}`}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${tool.color}18`, border: `1px solid ${tool.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={22} color={tool.color} />
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 10 }}>{tool.title}</h3>
                  <p style={{ color: 'rgba(232,241,255,0.68)', fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>{tool.summary}</p>
                  <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                    {tool.points.map(point => (
                      <div key={point} style={{ display: 'flex', gap: 10, color: 'rgba(245,249,255,0.76)', fontSize: 13, lineHeight: 1.6 }}>
                        <CheckCircle2 size={15} color={tool.color} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <button className="secondary-btn" onClick={() => router.push('/dashboard')}>
                    {t.dashOpen}
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '0 16px 84px' }}>
        <div className="page-wrap two-column" style={{ alignItems: 'start', gap: 28 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.faq}</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', marginBottom: 12 }}>{t.landingPage.faqTitle}</h2>
            <p className="section-copy">
              {t.landingPage.faqSubtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {FAQS.map((faq, index) => (
              <div key={faq.q} className="surface-card" style={{ padding: 18, borderRadius: 20 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>{faq.q}</span>
                  <span style={{ color: 'rgba(232,241,255,0.48)', fontSize: 20 }}>{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div style={{ color: 'rgba(232,241,255,0.68)', fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 16px 96px' }}>
        <div className="page-wrap surface-card fade-up" style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, margin: '0 auto 18px', background: 'rgba(88,166,255,0.14)', border: '1px solid rgba(88,166,255,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HandleItRobotLogo size={72} />
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', marginBottom: 12 }}>{t.landingPage.finalTitle}</h2>
          <p className="section-copy" style={{ maxWidth: 520, margin: '0 auto 24px' }}>
            {t.landingPage.finalSubtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={() => router.push('/dashboard')}>
              {t.startFree.replace(' →', '')}
              <ArrowRight size={16} />
            </button>
            <button className="secondary-btn" onClick={() => router.push('/pricing')}>
              {t.landingPage.comparePlans}
            </button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '0 16px 40px' }}>
        <div className="page-wrap" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', color: 'rgba(232,241,255,0.4)', fontSize: 12 }}>
          <div>© {new Date().getFullYear()} HandleIt</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="ghost-btn" onClick={() => router.push('/pricing')}>{t.pricing}</button>
            <button className="ghost-btn" onClick={() => router.push('/login')}>{t.logIn}</button>
            <button className="ghost-btn" onClick={() => router.push('/legal/terms')}>{t.terms}</button>
            <button className="ghost-btn" onClick={() => router.push('/legal/privacy')}>{t.privacy}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
