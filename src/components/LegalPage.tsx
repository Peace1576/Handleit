import Link from 'next/link';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <article>
      <div style={{ marginBottom: 40 }}>
        <Link href="/legal" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Legal documents
        </Link>
        <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Last updated: {lastUpdated}</p>
      </div>

      <div className="legal-content">
        {children}
      </div>

      <style>{`
        .legal-content section {
          margin-bottom: 36px;
        }
        .legal-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 28px 0 12px;
          letter-spacing: -0.02em;
        }
        .legal-content h3 {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin: 20px 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .legal-content p {
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 12px;
        }
        .legal-content ul, .legal-content ol {
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          line-height: 1.8;
          padding-left: 20px;
          margin-bottom: 12px;
        }
        .legal-content li {
          margin-bottom: 6px;
        }
        .legal-content a {
          color: rgba(99,179,237,0.9);
          text-decoration: none;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
        .legal-content strong {
          color: rgba(255,255,255,0.75);
          font-weight: 600;
        }
      `}</style>
    </article>
  );
}
