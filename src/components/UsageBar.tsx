'use client';

import { useUsage } from '@/hooks/useUsage';
import { useRouter } from 'next/navigation';

const FREE_TOTAL = 5;

export function UsageBar() {
  const { plan, uses_remaining, loading } = useUsage();
  const router = useRouter();

  if (loading || !plan) return null;

  if (plan === 'lifetime') {
    return (
      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
        ♾️ Lifetime
      </div>
    );
  }

  if (plan === 'pro' || plan === 'basic') {
    return (
      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
        ⭐ {plan === 'pro' ? 'Pro' : 'Basic'}
      </div>
    );
  }

  // Free plan
  const remaining = uses_remaining ?? 0;
  const pct = Math.max(0, (remaining / FREE_TOTAL) * 100);
  const isEmpty = remaining <= 0;
  const isLow = remaining === 1;

  const barColor = isEmpty ? '#F87171' : isLow ? '#FBBF24' : '#34D399';
  const textColor = isEmpty ? '#F87171' : isLow ? '#FBBF24' : 'rgba(255,255,255,0.65)';

  return (
    <button
      onClick={() => router.push('/pricing')}
      style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}
      title="Upgrade for unlimited uses"
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
        {isEmpty ? '🔒 Upgrade to continue' : `${remaining} of ${FREE_TOTAL} free uses left`}
      </span>
      {/* Progress bar */}
      <div style={{ width: 80, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: barColor, transition: 'width 0.4s ease' }} />
      </div>
    </button>
  );
}
