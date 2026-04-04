import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HandleIt — AI for Life Admin';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a3a 40%, #0a1a3a 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,0.35)', filter: 'blur(80px)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(26,86,219,0.4)', filter: 'blur(100px)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(60px)', display: 'flex' }} />

        {/* Main content row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, zIndex: 10, padding: '0 80px' }}>

          {/* Robot logo SVG */}
          <div style={{ display: 'flex', flexShrink: 0 }}>
            <svg width="180" height="180" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="40" y1="28" x2="216" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1A56DB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <path d="M60 72C60 49.9 77.9 32 100 32H156C178.1 32 196 49.9 196 72V132C196 154.1 178.1 172 156 172H116L82 202V172H100C77.9 172 60 154.1 60 132V72Z" fill="url(#g)" />
              <line x1="128" y1="26" x2="128" y2="44" stroke="#1A56DB" strokeWidth="10" strokeLinecap="round" />
              <circle cx="128" cy="18" r="10" fill="#7C3AED" />
              <rect x="82" y="68" width="92" height="64" rx="22" fill="white" fillOpacity="0.16" />
              <circle cx="106" cy="100" r="10" fill="white" />
              <circle cx="150" cy="100" r="10" fill="white" />
              <path d="M104 122C110 130 120 134 128 134C136 134 146 130 152 122" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="68" y="88" width="10" height="24" rx="5" fill="white" fillOpacity="0.9" />
              <rect x="178" y="88" width="10" height="24" rx="5" fill="white" fillOpacity="0.9" />
              <path d="M188 46L192.5 59.5L206 64L192.5 68.5L188 82L183.5 68.5L170 64L183.5 59.5L188 46Z" fill="white" />
            </svg>
          </div>

          {/* Text content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 80, fontWeight: 900, color: '#60A5FA', letterSpacing: '-0.04em', lineHeight: 1 }}>Handle</span>
              <span style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>It</span>
            </div>

            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4, maxWidth: 560, display: 'flex' }}>
              AI that writes complaint letters, explains confusing forms, and crafts perfect replies.
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {['📋 Form Explainer', '✉️ Complaint Letters', '💬 AI Replies'].map((label) => (
                <div
                  key={label}
                  style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', fontSize: 18, fontWeight: 600, display: 'flex' }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: 4, display: 'flex' }}>
              handleit.help
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
