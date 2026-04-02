'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/Particles';
import { HandleItRobotLogo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import type { PaddlePlan } from '@/types';

// Paddle.js types
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

  // Load Paddle.js and initialize
  useEffect(() => {
    if (window.Paddle) { setPaddleReady(true); return; }
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
      alert('Payment system is loading. Please try again in a second.');
      return;
    }

    setLoading(plan);

    // Get current user for customData
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirectedFrom=/pricing`);
      setLoading(null);
      return;
    }

    const priceIds: Record<PaddlePlan, string> = {
      basic_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC_MONTHLY ?? '',
      basic_annual:  process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC_ANNUAL  ?? '',
      pro_monthly:   process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY   ?? '',
      pro_annual:    process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL    ?? '',
      lifetime:      process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME      ?? '',
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      alert('This plan is not configured yet. Please check back soon.');
      setLoading(null);
      return;
    }

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        customData: { user_id: user.id },
        successUrl: `${window.location.origin}/dashboard?upgraded=true`,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: localStorage.getItem('handleit_language') ?? 'en',
        },
      });
    } catch (err) {
      console.error('Paddle checkout error:', err);
      alert('Could not open checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div className="nav-bubble specular relative rounded-2xl mx-auto flex items-center justify-between tab-bar-expanded" style={{ maxWidth: 600, pointerEvents: 'all' }}>
          <button onClick={() => router.push('/')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <HandleItRobotLogo size={48} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
          </div>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px 80px' }}>
        <div className="text-center fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontWeight: 900, fontSize: 36, letterSpacing: '-0.03em', marginBottom: 8 }}>Simple Pricing</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>One refund pays for years of Pro.</p>
        </div>

        {/* Monthly/Annual toggle */}
        <div className="fade-up fade-up-delay-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div className="glass-pill" style={{ display: 'inline-flex', borderRadius: 20, padding: 4, gap: 4 }}>
            {['Monthly', 'Annual'].map((l, i) => (
              <button key={l} onClick={() => setAnnual(i === 1)}
                style={{ padding: '8px 20px', borderRadius: 16, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', background: annual === (i === 1) ? 'rgba(26,86,219,0.8)' : 'transparent', color: annual === (i === 1) ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                {l}
                {i === 1 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: 'rgba(52,211,153,0.25)', color: '#34D399', fontWeight: 700 }}>-27%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Free */}
          <div className="glass-card fade-up fade-up-delay-1 relative overflow-hidden" style={{ borderRadius: 24, padding: 24 }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>FREE</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', marginBottom: 2 }}>$0</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>forever</div>
            {['5 total uses (all tools)', 'No credit card required', 'Try all 3 tools'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}><span style={{ color: '#34D399', fontWeight: 700 }}>✓</span>{f}</div>
            ))}
            <button onClick={() => router.push('/dashboard')} className="glass-btn w-full rounded-2xl" style={{ marginTop: 20, padding: '14px', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', width: '100%', borderRadius: 16 }}>
              Start Free
            </button>
          </div>

          {/* Basic */}
          <div className="glass-card fade-up fade-up-delay-2 relative overflow-hidden" style={{ borderRadius: 24, padding: 24, border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(52,211,153,0.5),transparent)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(5,150,105,0.25)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34D399', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>BASIC</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', marginBottom: 2 }}>{annual ? '$5' : '$7'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>{annual ? 'billed $59/year' : 'per month'}</div>
              {['50 uses per month', 'All 3 tools', 'Save results history', 'Cancel anytime'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}><span style={{ color: '#34D399', fontWeight: 700 }}>✓</span>{f}</div>
              ))}
              <button
                onClick={() => handleCheckout(annual ? 'basic_annual' : 'basic_monthly')}
                disabled={loading !== null}
                style={{ marginTop: 20, padding: '14px', fontWeight: 800, fontSize: 14, color: 'white', border: '1px solid rgba(52,211,153,0.4)', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 16, width: '100%', background: 'rgba(5,150,105,0.4)', backdropFilter: 'blur(20px)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
              >
                {loading === 'basic_monthly' || loading === 'basic_annual' ? 'Opening checkout…' : 'Start Basic →'}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div className="fade-up fade-up-delay-2 relative overflow-hidden" style={{ borderRadius: 24, padding: 24, background: 'linear-gradient(135deg,rgba(26,86,219,0.55),rgba(124,58,237,0.45))', backdropFilter: 'blur(40px)', border: '1px solid rgba(100,150,255,0.3)', boxShadow: '0 20px 60px rgba(26,86,219,0.35),inset 0 1px 0 rgba(255,255,255,0.25)' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)' }} />
            <div style={{ position: 'absolute', top: -4, right: 20, padding: '4px 12px', borderRadius: 12, background: 'rgba(124,58,237,0.8)', fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid rgba(167,139,250,0.4)' }}>⭐ Most Popular</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>PRO</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', marginBottom: 2 }}>{annual ? '$12' : '$17'}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>{annual ? 'billed $149/year' : 'per month'}</div>
            {['Unlimited uses, all tools', 'No watermarks', 'Save results history', 'Priority AI (faster)', 'Cancel anytime'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#93C5FD', fontWeight: 700 }}>✓</span>{f}</div>
            ))}
            <button
              onClick={() => handleCheckout(annual ? 'pro_annual' : 'pro_monthly')}
              disabled={loading !== null}
              className="glass-btn-blue w-full rounded-2xl"
              style={{ marginTop: 20, padding: '15px', fontWeight: 800, fontSize: 15, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 16, width: '100%', opacity: loading ? 0.7 : 1 }}
            >
              {loading === 'pro_monthly' || loading === 'pro_annual' ? 'Opening checkout…' : 'Start Pro →'}
            </button>
          </div>

          {/* Lifetime */}
          <div className="glass-card fade-up fade-up-delay-3 relative overflow-hidden" style={{ borderRadius: 24, padding: 24, border: '1px solid rgba(124,58,237,0.4)' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent)' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>LIFETIME</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', marginBottom: 2 }}>$97</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>one-time payment</div>
              {['Everything in Pro', 'Pay once, use forever', 'All future features', 'Early adopter badge'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}><span style={{ color: '#A78BFA', fontWeight: 700 }}>✓</span>{f}</div>
              ))}
              <button
                onClick={() => handleCheckout('lifetime')}
                disabled={loading !== null}
                className="glass-btn-purple w-full rounded-2xl"
                style={{ marginTop: 20, padding: '14px', fontWeight: 800, fontSize: 14, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 16, width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading === 'lifetime' ? 'Opening checkout…' : 'Get Lifetime Deal →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>⏰ Disappears in 90 days</p>
            </div>
          </div>
        </div>

        {/* Paddle badge */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
            Payments securely processed by Paddle · Taxes handled automatically
          </p>
        </div>
      </div>
    </div>
  );
}
