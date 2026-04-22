'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HandleItRobotLogo } from '@/components/Logo';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', color: 'white', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <HandleItRobotLogo size={44} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Legal</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          &copy; {currentYear ?? ''} HandleIt - All rights reserved
        </p>
      </footer>
    </div>
  );
}
