'use client';

import { useUsage } from '@/hooks/useUsage';

export function UsageBar() {
  const { plan, uses_remaining, loading } = useUsage();

  if (loading || !plan) return null;

  if (plan !== 'free') {
    return (
      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.2)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
        {plan === 'lifetime' ? '♾️ Lifetime' : '⭐ Pro'}
      </div>
    );
  }

  const remaining = uses_remaining ?? 0;
  return (
    <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: remaining > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)', color: remaining > 0 ? '#34D399' : '#F87171', border: `1px solid ${remaining > 0 ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
      {remaining > 0 ? `${remaining} left` : 'Upgrade'}
    </div>
  );
}
