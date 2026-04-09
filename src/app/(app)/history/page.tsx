'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { ResultDisplay } from '@/components/ResultDisplay';
import type { SavedResult, ToolId } from '@/types';
import { ArrowLeft, ClipboardList, Mail, MessageCircle } from 'lucide-react';

const TOOL_META: Record<ToolId, { Icon: typeof ClipboardList; name: string; color: string }> = {
  form: { Icon: ClipboardList, name: 'Form Explainer', color: '#58A6FF' },
  letter: { Icon: Mail, name: 'Complaint Letter', color: '#8B7BFF' },
  reply: { Icon: MessageCircle, name: 'AI Reply', color: '#33D0A5' },
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
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div className="page-wrap" style={{ padding: '24px 0 84px' }}>
        <button className="ghost-btn" onClick={() => router.push('/dashboard')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>History</div>
          <h1 style={{ fontSize: 'clamp(30px,4vw,42px)', marginBottom: 10 }}>Your recent results.</h1>
          <p className="section-copy">The most recent 50 outputs are saved here automatically.</p>
        </div>

        {loading && (
          <div className="surface-card" style={{ padding: 22 }}>
            {[90, 74, 84].map((width, index) => (
              <div key={index} className="shimmer-line" style={{ height: 12, width: `${width}%`, marginBottom: 12 }} />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="surface-card" style={{ padding: 26, textAlign: 'center' }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>No results yet.</div>
            <p className="section-copy" style={{ fontSize: 14, marginBottom: 18 }}>
              Use one of the tools and your output will show up here.
            </p>
            <button className="primary-btn" onClick={() => router.push('/dashboard')}>Go to dashboard</button>
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {results.map(item => {
            const meta = TOOL_META[item.tool_id];
            const isOpen = expanded === item.id;
            const Icon = meta.Icon;

            return (
              <div key={item.id} className="surface-card" style={{ padding: 18 }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: `${meta.color}18`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={meta.color} />
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{meta.name}</div>
                      <div style={{ color: 'rgba(232,241,255,0.42)', fontSize: 12, marginTop: 4 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: 'rgba(232,241,255,0.46)', fontSize: 20 }}>{isOpen ? '−' : '+'}</div>
                </button>

                <div style={{ color: 'rgba(232,241,255,0.62)', fontSize: 13, lineHeight: 1.7, marginTop: 14 }}>
                  {item.input_text.slice(0, 180)}{item.input_text.length > 180 ? '…' : ''}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 18 }}>
                    <ResultDisplay result={item.result_text} color={meta.color} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
