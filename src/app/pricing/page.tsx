'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/Particles';
import { HandleItRobotLogo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy } from '@/lib/formatCopy';
import { isLifetimeDealActive, lifetimeDaysLeft } from '@/lib/launch';
import type { PaddlePlan } from '@/types';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

const PLANS = [
  {
    id: 'free',
    title: 'Free',
    priceMonthly: '$0',
    priceAnnual: '$0',
    detailMonthly: '3 total uses',
    detailAnnual: '3 total uses',
    points: ['Try all 3 tools', 'No card required', 'Good for first-time testing'],
    accent: '#58A6FF',
  },
  {
    id: 'basic',
    title: 'Basic',
    priceMonthly: '$7',
    priceAnnual: '$5',
    detailMonthly: 'per month',
    detailAnnual: 'billed $59 yearly',
    points: ['50 uses each month', 'All tools included', 'Saved history'],
    accent: '#33D0A5',
  },
  {
    id: 'pro',
    title: 'Pro',
    priceMonthly: '$17',
    priceAnnual: '$12',
    detailMonthly: 'per month',
    detailAnnual: 'billed $149 yearly',
    points: ['Unlimited usage', 'Priority experience', 'Best for regular use'],
    accent: '#8B7BFF',
    featured: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);
  const lifetimeActive = isLifetimeDealActive();
  const daysLeft = lifetimeDaysLeft();

  useEffect(() => {
    if (window.Paddle) {
      setPaddleReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      const env = process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'sandbox';
      if (env === 'sandbox') window.Paddle?.Environment?.set('sandbox');
      window.Paddle?.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '' });
      setPaddleReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const handleCheckout = async (plan: PaddlePlan) => {
    if (!paddleReady || !window.Paddle) {
      alert(t.pricingPage.alerts.paymentLoading);
      return;
    }

    setLoading(plan);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirectedFrom=/pricing');
      setLoading(null);
      return;
    }

    const priceIds: Record<PaddlePlan, string> = {
      basic_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC_MONTHLY ?? '',
      basic_annual: process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC_ANNUAL ?? '',
      pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? '',
      pro_annual: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL ?? '',
      lifetime: process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME ?? '',
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      alert(t.pricingPage.alerts.planNotConfigured);
      setLoading(null);
      return;
    }

    try {
      const purchaseId = `${plan}-${Date.now()}`;
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        customData: { user_id: user.id },
        successUrl: `${window.location.origin}/dashboard?upgraded=true&purchase=${encodeURIComponent(purchaseId)}`,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: localStorage.getItem('handleit_language') ?? 'en',
        },
      });
    } catch (error) {
      console.error('Paddle checkout error:', error);
      alert(t.pricingPage.alerts.checkoutFailed);
    } finally {
      setLoading(null);
    } 
  };

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div
          className="nav-bubble specular page-wrap tab-bar-expanded"
          style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
        >
          <button className="ghost-btn" onClick={() => window.history.length > 1 ? router.back() : router.push('/dashboard')}>{t.back}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 800 }}>
            <HandleItRobotLogo size={44} />
            <span><span style={{ color: '#58A6FF' }}>Handle</span>It</span>
          </div>
          <div style={{ width: 52 }} />
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '40px 0 88px' }}>
        <div className="two-column fade-up" style={{ alignItems: 'start', gap: 28, marginBottom: 32 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>{t.pricing}</div>
            <h1 style={{ fontSize: 'clamp(30px,4vw,48px)', marginBottom: 12 }}>{t.pricingPage.title}</h1>
            <p className="section-copy" style={{ maxWidth: 540, marginBottom: 20 }}>
              {t.pricingPage.subtitle}
            </p>
            <div className="metric-row">
              <div className="metric-pill">
                <span className="metric-value">5</span>
                <span className="metric-label">{t.pricingPage.metricFreeLabel}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-value">{t.pricingPage.metricToolsValue}</span>
                <span className="metric-label">{t.pricingPage.metricToolsLabel}</span>
              </div>
              {lifetimeActive && (
                <div className="metric-pill">
                  <span className="metric-value">{daysLeft}</span>
                  <span className="metric-label">{t.pricingPage.metricLifetimeLabel}</span>
                </div>
              )}
            </div>
          </div>

          <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{t.pricingPage.chooseBilling}</div>
              <div className="pill" style={{ background: annual ? 'rgba(88,166,255,0.12)' : 'rgba(255,255,255,0.05)' }}>
                {annual ? t.pricingPage.annualPricingActive : t.pricingPage.monthlyPricingActive}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                className={annual ? 'secondary-btn' : 'primary-btn'}
                onClick={() => setAnnual(false)}
                style={{ width: '100%' }}
              >
                {t.monthly}
              </button>
              <button
                className={annual ? 'primary-btn' : 'secondary-btn'}
                onClick={() => setAnnual(true)}
                style={{ width: '100%' }}
              >
                {t.annual}
              </button>
            </div>
          </div>
        </div>

        <div className="auto-grid">
          {PLANS.map((plan, index) => (
            (() => {
              const planCopy = t.pricingPage.plans[plan.id as keyof typeof t.pricingPage.plans];

              return (
                <div
                  key={plan.id}
                  className={`tool-card fade-up fade-up-delay-${Math.min(index + 1, 3)}`}
                  style={{
                    borderColor: plan.featured ? `${plan.accent}55` : undefined,
                    boxShadow: plan.featured ? `0 24px 64px ${plan.accent}20` : undefined,
                  }}
                >
                  {plan.featured && (
                    <div className="pill" style={{ marginBottom: 16, color: 'white', background: `${plan.accent}20`, borderColor: `${plan.accent}45` }}>
                      {t.pricingPage.mostPopular}
                    </div>
                  )}
                  <div className="section-label" style={{ color: plan.accent, marginBottom: 10 }}>{planCopy.title}</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: 'white', marginBottom: 6 }}>
                    {annual ? plan.priceAnnual : plan.priceMonthly}
                  </div>
                  <div style={{ color: 'rgba(232,241,255,0.48)', fontSize: 13, marginBottom: 18 }}>
                    {annual ? planCopy.detailAnnual : planCopy.detailMonthly}
                  </div>

                  <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
                    {planCopy.points.map(point => (
                      <div key={point} style={{ display: 'flex', gap: 10, color: 'rgba(245,249,255,0.76)', fontSize: 14, lineHeight: 1.6 }}>
                        <CheckCircle2 size={16} color={plan.accent} style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {plan.id === 'free' ? (
                    <button className="secondary-btn" style={{ width: '100%' }} onClick={() => router.push('/dashboard')}>
                      {t.pricingPage.plans.free.cta}
                    </button>
                  ) : (
                    <button
                      className={plan.featured ? 'primary-btn' : 'secondary-btn'}
                      style={{ width: '100%' }}
                      disabled={loading !== null}
                      onClick={() => handleCheckout(
                        plan.id === 'basic'
                          ? (annual ? 'basic_annual' : 'basic_monthly')
                          : (annual ? 'pro_annual' : 'pro_monthly')
                      )}
                    >
                      {loading === `${plan.id}_${annual ? 'annual' : 'monthly'}`
                        ? t.pricingPage.openingCheckout
                        : <>
                            {formatCopy(t.pricingPage.choosePlan, { plan: planCopy.title })}
                            <ArrowRight size={16} />
                          </>}
                    </button>
                  )}
                </div>
              );
            })()
          ))}
        </div>

        {lifetimeActive && (
          <div className="surface-card fade-up" style={{ marginTop: 22, padding: 24 }}>
            <div className="two-column" style={{ alignItems: 'center', gap: 18 }}>
              <div>
                <div className="pill" style={{ marginBottom: 12, color: '#d7cbff', background: 'rgba(139,123,255,0.16)', borderColor: 'rgba(139,123,255,0.3)' }}>
                  <Sparkles size={14} color="#8B7BFF" />
                  {t.pricingPage.lifetimePill}
                </div>
                <h2 style={{ fontSize: 26, marginBottom: 8 }}>{t.pricingPage.lifetimeTitle}</h2>
                <p className="section-copy">
                  {t.pricingPage.lifetimeSubtitle}
                </p>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>$97</div>
                <div style={{ color: 'rgba(232,241,255,0.5)', fontSize: 13 }}>
                  {formatCopy(t.pricingPage.lifetimePriceDetail, { days: daysLeft, suffix: daysLeft !== 1 ? 's' : '' })}
                </div>
                <button
                  className="glass-btn-purple"
                  disabled={loading !== null}
                  onClick={() => handleCheckout('lifetime')}
                >
                  {loading === 'lifetime' ? t.pricingPage.openingCheckout : t.pricingPage.getLifetimeAccess}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(232,241,255,0.36)', fontSize: 12 }}>
          {t.pricingPage.secureCheckout}
        </div>
      </div>
    </div>
  );
}
