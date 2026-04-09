'use client';

export function Particles() {
  const ps = [
    { s: 10, x: '12%', y: '16%', d: 14, c: 'rgba(88,166,255,0.22)' },
    { s: 8, x: '82%', y: '12%', d: 18, c: 'rgba(111,168,255,0.18)' },
    { s: 12, x: '68%', y: '74%', d: 16, c: 'rgba(51,208,165,0.14)' },
    { s: 6, x: '18%', y: '78%', d: 20, c: 'rgba(255,255,255,0.12)' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {ps.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: p.x, top: p.y,
            width: p.s, height: p.s,
            borderRadius: '50%',
            background: p.c,
            animationDuration: `${p.d}s`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}
