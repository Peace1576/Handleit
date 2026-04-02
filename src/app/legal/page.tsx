import Link from 'next/link';

export const metadata = { title: 'Legal — HandleIt' };

const DOCS = [
  { href: '/legal/terms',          label: 'Terms of Service',                        desc: 'Rules for using HandleIt' },
  { href: '/legal/privacy',        label: 'Privacy Policy',                           desc: 'How we collect and use your data' },
  { href: '/legal/acceptable-use', label: 'Acceptable Use Policy',                   desc: 'What you may and may not do' },
  { href: '/legal/disclaimer',     label: 'Disclaimer of Warranties & Liability',    desc: 'Limitations on our responsibility' },
  { href: '/legal/refund-policy',  label: 'Refund & Cancellation Policy',            desc: 'How cancellations and refunds work' },
  { href: '/legal/dmca',           label: 'DMCA & Intellectual Property Policy',     desc: 'Copyright and IP claims' },
  { href: '/legal/cookies',        label: 'Cookie Policy',                            desc: 'Cookies and tracking technologies' },
];

export default function LegalIndexPage() {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8 }}>Legal</h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 40 }}>HandleIt legal documents and policies.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DOCS.map(doc => (
          <Link key={doc.href} href={doc.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, textDecoration: 'none', transition: 'background 0.15s' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{doc.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{doc.desc}</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
