'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/Particles';
import { UsageBar } from '@/components/UsageBar';
import { HandleItRobotLogo } from '@/components/Logo';
import { ClipboardList, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showUpgraded, setShowUpgraded] = useState(false);
  const { t } = useLanguage();

  const TOOLS = [
    { id: 'form-explainer',   Icon: ClipboardList, name: t.formName,   desc: t.formDesc,   color: '#1A56DB', glow: 'rgba(26,86,219,0.5)' },
    { id: 'complaint-letter', Icon: Mail,          name: t.letterName, desc: t.letterDesc, color: '#7C3AED', glow: 'rgba(124,58,237,0.5)' },
    { id: 'ai-reply',         Icon: MessageCircle, name: t.replyName,  desc: t.replyDesc,  color: '#059669', glow: 'rgba(5,150,105,0.5)' },
  ];

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgraded(true);
      setTimeout(() => setShowUpgraded(false), 4000);
    }
  }, [searchParams]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', fn);
    return () => el.removeEventListener('scroll', fn);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div ref={containerRef} className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />

      {/* Floating nav */}
      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div className={`nav-bubble specular relative rounded-2xl mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ maxWidth: 700, pointerEvents: 'all' }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <HandleItRobotLogo size={48} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UsageBar />
            <button onClick={() => router.push('/history')} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{t.history}</button>
            <button onClick={() => router.push('/settings')} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{t.settings}</button>
            <button onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>{t.signOut}</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 16px 80px' }}>
        {showUpgraded && (
          <div className="glass fade-up" style={{ borderRadius: 16, padding: '12px 20px', marginBottom: 24, background: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.3)', textAlign: 'center', color: '#34D399', fontWeight: 700, fontSize: 14 }}>
            {t.dashUpgraded}
          </div>
        )}

        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(28px,5vw,42px)', letterSpacing: '-0.03em', marginBottom: 8 }}>
            {t.dashHeading} <span style={{ background: 'linear-gradient(135deg,#60A5FA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.dashHandle}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>{t.dashSub}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {TOOLS.map((tool, i) => (
            <div
              key={tool.id}
              onClick={() => router.push(`/tools/${tool.id}`)}
              className={`glass-card fade-up fade-up-delay-${i + 1} relative overflow-hidden`}
              style={{ borderRadius: 24, padding: 24, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${tool.glow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: tool.glow, filter: 'blur(20px)', opacity: 0.7, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: tool.color + '22', border: `1px solid ${tool.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <tool.Icon size={24} color={tool.color} strokeWidth={1.8} />
                </div>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: 'white', marginBottom: 8, position: 'relative' }}>{tool.name}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 16, position: 'relative' }}>{tool.desc}</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: tool.color, position: 'relative' }}>{t.dashOpen}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
