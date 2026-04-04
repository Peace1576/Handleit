import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HandleIt — AI for Life Admin';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
    const logoRes = await fetch('https://handleit.help/logo.png');
    const logoBuffer = await logoRes.arrayBuffer();
    const logoBytes = new Uint8Array(logoBuffer);
    const binaryStr = logoBytes.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ''
        );
    const logoBase64 = `data:image/png;base64,${btoa(binaryStr)}`;

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
                          {/* Logo image */}
                                  <div style={{ display: 'flex', flexShrink: 0 }}>
                                              <img
                                                              src={logoBase64}
                                                              width="220"
                                                              height="220"
                                                              style={{ objectFit: 'contain' }}
                                                            />
                                  </div>div>
                        
                          {/* Text content */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Brand name */}
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span style={{ fontSize: 80, fontWeight: 900, color: '#60A5FA', letterSpacing: '-0.04em', lineHeight: 1 }}>Handle</span>span>
                                                            <span style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>It</span>span>
                                              </div>div>
                                  
                                    {/* Tagline */}
                                              <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4, maxWidth: 560 }}>
                                                            AI that writes complaint letters, explains confusing forms, and crafts perfect replies.
                                              </div>div>
                                  
                                    {/* Feature pills */}
                                              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                                {['📋 Form Explainer', '✉️ Complaint Letters', '💬 AI Replies'].map((label) => (
                                          <div
                                                              key={label}
                                                              style={{
                                                                                    padding: '8px 18px',
                                                                                    borderRadius: 99,
                                                                                    background: 'rgba(255,255,255,0.08)',
                                                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                                                    color: 'rgba(255,255,255,0.75)',
                                                                                    fontSize: 18,
                                                                                    fontWeight: 600,
                                                                                    display: 'flex',
                                                              }}
                                                            >
                                            {label}
                                          </div>div>
                                        ))}
                                              </div>div>
                                  
                                    {/* URL */}
                                              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: 4 }}>
                                                            handleit.help
                                              </div>div>
                                  </div>div>
                        </div>div>
                </div>div>
              ),
    { ...size }
      );
}</div>
