'use client';

import { useState } from 'react';

interface Props {
  result: string;
  color: string;
}

export function ResultDisplay({ result, color }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = result.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
    const clean = line.replace(/\*\*/g, '');
    if (line.startsWith('**') || (line.toUpperCase() === line && line.length < 30 && line.trim()))
      return <div key={i} style={{ fontWeight: 700, color: 'white', marginTop: 16, marginBottom: 6, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{clean}</div>;
    if (line.startsWith('• ') || line.startsWith('- '))
      return <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}><span style={{ color, marginTop: 3, flexShrink: 0 }}>•</span><span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>{line.slice(2)}</span></div>;
    return <div key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{clean}</div>;
  });

  return (
    <div className="glass-card fade-up relative overflow-hidden" style={{ borderRadius: 24, padding: 24 }}>
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: `1px solid ${color}50` }}>✓</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Your Result</span>
        </div>
        <button
          onClick={handleCopy}
          className="glass-btn"
          style={{ padding: '6px 14px', borderRadius: 14, fontSize: 12, fontWeight: 600, color: copied ? '#34D399' : 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.1)' }}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        {lines}
      </div>
    </div>
  );
}
