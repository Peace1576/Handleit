'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

interface Props {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);

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

  const handleUpgrade = async () => {
    if (!paddleReady || !window.Paddle) {
      alert('Payment system loading, please try again.');
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY ?? '';
    if (!priceId) {
      alert('Plan not configured yet.');
      setLoading(false);
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
      onClose();
    } catch (err) {
      console.error('Paddle checkout error:', err);
      alert('Could not open checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card fade-up"
        style={{ position: 'relative', borderRadius: 28, padding: 32, width: '100%', maxWidth: 380, overflow: 'hidden', marginBottom: 8 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)' }} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Free uses all gone!</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6 }}>Upgrade to Pro for unlimited access to all three tools.</p>
        </div>

        <div style={{ position: 'relative', borderRadius: 18, padding: 20, marginBottom: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(100,150,255,0.25)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(26,86,219,0.3),rgba(124,58,237,0.2))', borderRadius: 18 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Pro Plan</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'white', marginBottom: 4 }}>$17<span style={{ fontSize: 16, fontWeight: 400, opacity: 0.6 }}>/mo</span></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>or $149/year — save 27%</div>
            {['Unlimited uses, all tools', 'Save results forever', 'No watermarks', 'Priority AI (faster)'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ color: '#34D399', fontWeight: 700 }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        <button
          className="glass-btn-blue"
          style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? 'Opening checkout…' : 'Upgrade to Pro →'}
        </button>
        <button
          onClick={() => router.push('/pricing')}
          style={{ width: '100%', padding: '10px', borderRadius: 14, color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 4 }}
        >
          See all plans
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '10px', borderRadius: 14, color: 'rgba(255,255,255,0.25)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
