'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { ResultDisplay } from '@/components/ResultDisplay';
import type { SavedResult, ToolId } from '@/types';

const TOOL_META: Record<ToolId, { icon: string; name: string; color: string }> = {
  form:   { icon: '📋', name: 'Form Explainer',  color: '#1A56DB' },
  letter: { icon: '✉️', name: 'Complaint Letter', color: '#7C3AED' },
  reply:  { icon: '💬', name: 'AI Reply',         color: '#059669' },
};

export default function HistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('saved_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then((res: { data: unknown }) => {
        setResults((res.data as SavedResult[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div className="nav-bubble specular relative rounded-2xl mx-auto flex items-center justify-between tab-bar-expanded" style={{ maxWidth: 680, pointerEvents: 'all' }}>
          <button onClick={() => router.push('/dashboard')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>← Dashboard</button>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'white' }}><span style={{ color: '#60A5FA' }}>Handle</span>It</div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 80px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 8 }}>Your History</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 32 }}>Your last 50 results, saved automatically.</p>

        {loading && (
          <div className="glass-card" style={{ borderRadius: 20, padding: 20 }}>
            {[90, 70, 80].map((w, i) => <div key={i} className="shimmer-line" style={{ height: 12, width: `${w}%`, marginBottom: 10 }} />)}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="glass-card" style={{ borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>No results yet. Use a tool to get started!</p>
            <button onClick={() => router.push('/dashboard')} className="glass-btn-blue" style={{ marginTop: 20, padding: '10px 24px', borderRadius: 16, fontWeight: 700, fontSize: 13, color: 'white', border: 'none', cursor: 'pointer' }}>Go to Dashboard →</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map(r => {
            const meta = TOOL_META[r.tool_id];
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="glass-card relative overflow-hidden" style={{ borderRadius: 20, padding: 20, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : r.id)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isOpen ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{meta.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString()} · {r.input_text.slice(0, 50)}{r.input_text.length > 50 ? '…' : ''}</div>
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
                {isOpen && <ResultDisplay result={r.result_text} color={meta.color} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
