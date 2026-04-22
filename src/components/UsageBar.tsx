'use client';

import { useUsage } from '@/hooks/useUsage';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy } from '@/lib/formatCopy';
import { FREE_PLAN_USES } from '@/lib/plans';
import { useRouter } from 'next/navigation';

export function UsageBar() {
  const { plan, uses_remaining, loading } = useUsage();
  const { t } = useLanguage();
  const router = useRouter();

  if (loading || !plan) return null;

  if (plan === 'lifetime') {
    return (
      <div className="pill" style={{ background: 'rgba(51,208,165,0.12)', borderColor: 'rgba(51,208,165,0.22)', color: '#8ff2cf' }}>
        {t.usageBar.lifetimeAccess}
      </div>
    );
  }

  if (plan === 'pro' || plan === 'basic') {
    return (
      <div className="pill" style={{ background: 'rgba(51,208,165,0.12)', borderColor: 'rgba(51,208,165,0.22)', color: '#8ff2cf' }}>
        {plan === 'pro' ? t.usageBar.proPlan : t.usageBar.basicPlan}
      </div>
    );
  }

  // Free plan
  const remaining = uses_remaining ?? 0;
  const pct = Math.max(0, (remaining / FREE_PLAN_USES) * 100);
  const isEmpty = remaining <= 0;
  const isLow = remaining === 1;

  const barColor = isEmpty ? '#F87171' : isLow ? '#FBBF24' : '#34D399';
  const textColor = isEmpty ? '#F87171' : isLow ? '#FBBF24' : 'rgba(255,255,255,0.65)';

  return (
    <button
      onClick={() => router.push('/pricing')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'flex-end',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        cursor: 'pointer',
        padding: '9px 12px',
        minWidth: 148,
      }}
      title={t.usageBar.upgradeTitle}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
        {isEmpty ? t.usageBar.upgradeToContinue : formatCopy(t.usageBar.usesLeft, { remaining, total: FREE_PLAN_USES })}
      </span>
      <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: barColor, transition: 'width 0.4s ease' }} />
      </div>
    </button>
  );
}
