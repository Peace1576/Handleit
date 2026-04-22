'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy } from '@/lib/formatCopy';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

interface Props {
  onClose: () => void;
}

type ModalPlan = 'basic_monthly' | 'pro_monthly';

export function UpgradeModal({ onClose }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ModalPlan | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

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

  const handleUpgrade = async (plan: ModalPlan) => {
    if (!paddleReady || !window.Paddle) {
      alert(t.upgradeModal.alerts.paymentLoading);
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      setLoading(false);
      setSelectedPlan(null);
      return;
    }

    const priceId =
      plan === 'basic_monthly'
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC_MONTHLY ?? ''
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? '';

    if (!priceId) {
      alert(t.upgradeModal.alerts.planNotConfigured);
      setLoading(false);
      setSelectedPlan(null);
      return;
    }

    try {
      const checkoutResponse = await fetch('/api/paddle/checkout', { method: 'POST' });
      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok || !checkoutData?.customData || !checkoutData?.customerEmail || !checkoutData?.purchaseId) {
        throw new Error('Checkout session could not be prepared');
      }

      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: checkoutData.customerEmail },
        customData: checkoutData.customData,
        successUrl: `${window.location.origin}/dashboard?upgraded=true&purchase=${encodeURIComponent(checkoutData.purchaseId)}`,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: localStorage.getItem('handleit_language') ?? 'en',
        },
      });
      onClose();
    } catch (err) {
      console.error('Paddle checkout error:', err);
      alert(t.upgradeModal.alerts.checkoutFailed);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const basicPlan = t.pricingPage.plans.basic;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card fade-up"
        style={{ position: 'relative', borderRadius: 28, padding: 28, width: '100%', maxWidth: 420, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
        onClick={event => event.stopPropagation()}
      >
        <button
          aria-label="Close upgrade modal"
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.72)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} />
        </button>
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)' }} />
        <div style={{ textAlign: 'center', marginBottom: 24, paddingTop: 8 }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: 18, background: 'rgba(88,166,255,0.12)', border: '1px solid rgba(88,166,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="#58A6FF" />
          </div>
          <h2 id="upgrade-modal-title" style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{t.upgradeModal.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14, lineHeight: 1.6 }}>{t.upgradeModal.subtitle}</p>
        </div>

        <div style={{ position: 'relative', borderRadius: 20, padding: 20, marginBottom: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(100,150,255,0.25)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(26,86,219,0.3),rgba(124,58,237,0.2))', borderRadius: 20 }} />
          <div style={{ position: 'relative' }}>
            <div className="pill" style={{ display: 'inline-flex', marginBottom: 12, background: 'rgba(88,166,255,0.14)', borderColor: 'rgba(88,166,255,0.24)', color: '#cfe1ff' }}>
              {t.pricingPage.mostPopular}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{t.upgradeModal.plan}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 4 }}>$17<span style={{ fontSize: 16, fontWeight: 400, opacity: 0.6 }}>/mo</span></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{t.upgradeModal.annualSave}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {t.upgradeModal.features.map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.84)' }}>
                  <span style={{ color: '#34D399', fontWeight: 700 }}>{'\u2713'}</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: 16, marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{basicPlan.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{basicPlan.points[0]}</div>
            </div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 24 }}>
              {basicPlan.priceMonthly}
              <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.6 }}>/mo</span>
            </div>
          </div>
          <button
            className="secondary-btn"
            style={{ width: '100%' }}
            onClick={() => handleUpgrade('basic_monthly')}
            disabled={loading}
          >
            {loading && selectedPlan === 'basic_monthly'
              ? t.upgradeModal.openingCheckout
              : formatCopy(t.pricingPage.choosePlan, { plan: basicPlan.title })}
          </button>
        </div>

        <button
          className="glass-btn-blue"
          style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}
          onClick={() => handleUpgrade('pro_monthly')}
          disabled={loading}
        >
          {loading && selectedPlan === 'pro_monthly'
            ? t.upgradeModal.openingCheckout
            : t.upgradeModal.upgrade}
        </button>
        <button
          onClick={() => router.push('/pricing')}
          style={{ width: '100%', padding: '10px', borderRadius: 14, color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 4 }}
        >
          {t.upgradeModal.seeAllPlans}
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '10px', borderRadius: 14, color: 'rgba(255,255,255,0.25)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t.upgradeModal.maybeLater}
        </button>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.6, textAlign: 'center', marginTop: 14 }}>
          {t.pricingPage.secureCheckout}
        </div>
      </div>
    </div>
  );
}
