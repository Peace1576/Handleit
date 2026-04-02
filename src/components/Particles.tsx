'use client';

export function Particles() {
  const ps = [
    { s: 6, x: '15%', y: '20%', d: 4, c: 'rgba(124,58,237,0.5)' },
    { s: 4, x: '80%', y: '15%', d: 6, c: 'rgba(26,86,219,0.5)' },
    { s: 8, x: '60%', y: '70%', d: 5, c: 'rgba(5,150,105,0.4)' },
    { s: 3, x: '30%', y: '80%', d: 7, c: 'rgba(255,255,255,0.3)' },
    { s: 5, x: '90%', y: '50%', d: 4.5, c: 'rgba(124,58,237,0.4)' },
    { s: 4, x: '10%', y: '60%', d: 8, c: 'rgba(26,86,219,0.3)' },
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
