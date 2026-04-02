'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Particles } from '@/components/Particles';
import { HandleItRobotLogo } from '@/components/Logo';
import { ClipboardList, Mail, MessageCircle } from 'lucide-react';

const TOOLS = [
  { id: 'form-explainer',   Icon: ClipboardList, name: 'Form Explainer',   tagline: 'Plain English. Instantly.',          desc: 'Paste any confusing government, tax, legal, or insurance form. Get every field explained clearly.', color: '#1A56DB', glow: 'rgba(26,86,219,0.5)' },
  { id: 'complaint-letter', Icon: Mail,          name: 'Complaint Letter', tagline: 'Firm. Professional. Gets results.',   desc: 'Describe your bad experience. Get a powerful complaint letter ready to send in seconds.',       color: '#7C3AED', glow: 'rgba(124,58,237,0.5)' },
  { id: 'ai-reply',         Icon: MessageCircle, name: 'AI Reply',         tagline: '3 perfect replies. Every time.',     desc: 'Paste any stressful message. Get Assertive, Diplomatic, and Brief reply options instantly.',     color: '#059669', glow: 'rgba(5,150,105,0.5)' },
];

const FAQS = [
  { q: 'Is my data private?', a: 'Yes. Your inputs are processed in real-time and never stored beyond your saved results. Enterprise-grade encryption, zero data selling.' },
  { q: 'Which forms can it handle?', a: "Any text-based form — W-2s, I-9s, insurance EOBs, lease agreements, tax forms, government applications, legal documents." },
  { q: 'Will the complaint letter work?', a: 'Most users report getting refunds, credits, and resolutions within 48 hours. A firm, professional letter dramatically increases your success rate.' },
  { q: 'Can I cancel Pro anytime?', a: 'Yes. One click in settings. No fees. You keep access until the end of your billing period.' },
  { q: "What's the Lifetime plan?", a: 'Pay $97 once, use HandleIt forever — including all future features. Limited to the first 90 days only.' },
  { q: 'How does the free plan work?', a: '5 total uses across all three tools. No credit card required. Enough to see exactly how powerful HandleIt is.' },
  { q: 'Is this better than ChatGPT?', a: 'HandleIt is purpose-built for life admin. Optimized prompts, clean interface, saved history — no prompt engineering needed.' },
];

const TESTIMONIALS = [
  { name: 'Marcus T.', city: 'Chicago, IL', text: 'Used the complaint letter tool on my airline and got a $600 flight credit in 48 hours. This app pays for itself once.', avatar: 'MT' },
  { name: 'Priya K.', city: 'Austin, TX', text: 'As an immigrant navigating US tax forms, this is a lifesaver. I finally understand every box on my W-2.', avatar: 'PK' },
  { name: 'James R.', city: 'Brooklyn, NY', text: 'My manager sends passive-aggressive emails constantly. HandleIt gives me 3 perfect responses every time. Got promoted.', avatar: 'JR' },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      {/* ── Floating Nav ── */}
      <div style={{ position: 'sticky', top: 16, zIndex: 50, padding: '0 16px', pointerEvents: 'none' }}>
        <div className={`nav-bubble specular relative mx-auto transition-all duration-300 ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ maxWidth: 800, borderRadius: 24, pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'white', letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => router.push('/')}>
            <HandleItRobotLogo size={52} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['Pricing', '/pricing'], ['FAQ', '#faq']].map(([l, href]) => (
              <button key={l} onClick={() => (href as string).startsWith('/') ? router.push(href as string) : document.querySelector(href as string)?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '7px 16px', borderRadius: 16, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => router.push('/login')} style={{ padding: '7px 16px', borderRadius: 16, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Log In</button>
            <button onClick={() => router.push('/dashboard')} className="glass-btn-blue" style={{ padding: '8px 18px', borderRadius: 18, fontSize: 13, fontWeight: 800, color: 'white', border: 'none', cursor: 'pointer' }}>
              Start Free →
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ padding: '60px 16px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} className="fade-up">
          <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, marginBottom: 28, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            🚀 <span>Launch Special — $97 Lifetime Deal · 90 days only</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px,8vw,72px)', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24, color: 'white' }}>
            Stop Stressing.<br />
            <span style={{ background: 'linear-gradient(135deg,#60A5FA,#818CF8,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Start HandleIting.
            </span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 500, lineHeight: 1.7, marginBottom: 36 }}>
            AI that writes complaint letters, explains confusing forms, and crafts perfect replies to stressful messages. In seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
            <button onClick={() => router.push('/dashboard')} className="glass-btn-blue" style={{ padding: '15px 30px', borderRadius: 20, fontWeight: 800, fontSize: 15, color: 'white', border: 'none', cursor: 'pointer' }}>
              Try Free — 5 Uses, No Card →
            </button>
            <button onClick={() => router.push('/pricing')} className="glass-btn" style={{ padding: '15px 28px', borderRadius: 20, fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer' }}>
              See Pricing
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>✓ No credit card &nbsp;·&nbsp; ✓ Works in 10 seconds &nbsp;·&nbsp; ✓ Cancel anytime</p>
        </div>

        {/* Hero photos — real people using HandleIt scenarios */}
        <div className="fade-up fade-up-delay-1" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 48, marginBottom: 0 }}>
          {[
            { src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=280&h=180&fit=crop&crop=center', alt: 'Person reviewing tax forms', caption: 'Tax season sorted' },
            { src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=280&h=180&fit=crop&crop=center', alt: 'Professional writing a letter', caption: 'Complaint sent, refund received' },
            { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=280&h=180&fit=crop&crop=center', alt: 'Team communication on laptop', caption: 'Stressful message, perfect reply' },
          ].map((img, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 20, overflow: 'hidden', flex: '1 1 0', maxWidth: 200, minWidth: 100 }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '64%' }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="200px"
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>{img.caption}</div>
              </div>
            </div>
          ))}
        </div>

        {/* App preview card */}
        <div className="glass-card fade-up fade-up-delay-2 relative overflow-hidden" style={{ borderRadius: 28, padding: 20, marginTop: 52, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(26,86,219,0.4)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>handleit.app</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[['Forms', '#1A56DB', true], ['Letters', 'rgba(255,255,255,0.08)', false], ['Replies', 'rgba(255,255,255,0.08)', false]].map(([t, bg, active]) => (
              <div key={String(t)} style={{ padding: '5px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: String(bg), color: active ? 'white' : 'rgba(255,255,255,0.4)', border: `1px solid ${active ? 'rgba(100,150,255,0.4)' : 'rgba(255,255,255,0.08)'}` }}>{String(t)}</div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Box 14 on my W-2 says &quot;NY SDI $31.20&quot; — what is this?
          </div>
          <div style={{ background: 'rgba(26,86,219,0.2)', borderRadius: 14, padding: '12px 14px', fontSize: 12, border: '1px solid rgba(26,86,219,0.3)' }}>
            <div style={{ fontWeight: 700, color: '#93C5FD', marginBottom: 8 }}>✓ HandleIt explained it:</div>
            {['NY SDI = New York State Disability Insurance — mandatory payroll tax', '$31.20 is what was withheld from your paychecks this year', 'Yes — enter it in Box 14 on your NY state return to reduce your tax bill'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, color: 'rgba(147,197,253,0.8)', fontSize: 11, lineHeight: 1.5 }}><span>•</span><span>{t}</span></div>
            ))}
          </div>
          <button onClick={() => router.push('/dashboard')} className="glass-btn-blue w-full" style={{ marginTop: 12, padding: '11px', borderRadius: 14, fontWeight: 700, fontSize: 13, color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}>
            Try it yourself →
          </button>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <div className="glass" style={{ margin: '0 auto 80px', maxWidth: 800, borderRadius: 20, padding: '14px 24px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 32px' }}>
          {[['⭐', '4.9/5 rating'], ['✉️', '10,000+ letters'], ['🌍', '50+ countries'], ['💰', '$2M+ recovered']].map(([ico, t]) => (
            <span key={String(t)} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{ico} {t}</span>
          ))}
        </div>
      </div>

      {/* ── Tools ── */}
      <section id="tools" style={{ padding: '0 16px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,5vw,42px)', color: 'white', letterSpacing: '-0.03em', marginBottom: 10 }}>
            3 Tools. Every Problem.{' '}
            <span style={{ background: 'linear-gradient(135deg,#60A5FA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Solved.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>Discover one tool, stay for all three.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {TOOLS.map((t, i) => (
            <div key={t.id} onClick={() => router.push('/dashboard')} className={`glass-card fade-up fade-up-delay-${i + 1} relative overflow-hidden`}
              style={{ borderRadius: 24, padding: 24, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${t.glow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: t.glow, filter: 'blur(20px)', opacity: 0.7, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: t.color + '22', border: `1px solid ${t.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.Icon size={22} color={t.color} strokeWidth={1.8} />
                </div>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: 'white', marginBottom: 4, position: 'relative' }}>{t.name}</h3>
              <p style={{ fontSize: 12, fontStyle: 'italic', color: t.color, marginBottom: 8, position: 'relative' }}>{t.tagline}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 16, position: 'relative' }}>{t.desc}</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.color, position: 'relative' }}>Try It Free →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '0 16px 80px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 'clamp(24px,4vw,38px)', color: 'white', letterSpacing: '-0.03em', marginBottom: 48 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
          {[
            { n: '1', title: 'Describe it', desc: 'Paste your form, situation, or message into HandleIt.', c: '#60A5FA' },
            { n: '2', title: 'AI analyzes it', desc: 'Purpose-built AI processes your input instantly.', c: '#C084FC' },
            { n: '3', title: 'Get your result', desc: 'Copy and use. Done in seconds. Every time.', c: '#34D399' },
          ].map((s, i) => (
            <div key={s.n} className={`glass-card fade-up fade-up-delay-${i + 1}`} style={{ borderRadius: 22, padding: 24, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${s.c}22`, border: `1px solid ${s.c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 900, color: s.c }}>
                {s.n}
              </div>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '0 16px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 'clamp(24px,4vw,38px)', color: 'white', letterSpacing: '-0.03em', marginBottom: 40 }}>Real Results</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`glass-card fade-up fade-up-delay-${i + 1}`} style={{ borderRadius: 22, padding: 24 }}>
              <div className="stars" style={{ marginBottom: 12, fontSize: 14 }}>★★★★★</div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,86,219,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#93C5FD', border: '1px solid rgba(26,86,219,0.4)' }}>{t.avatar}</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '0 16px 80px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 'clamp(24px,4vw,38px)', color: 'white', letterSpacing: '-0.03em', marginBottom: 40 }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((f, i) => (
            <div key={i} className="glass" style={{ borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{f.q}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{openFaq === i ? '▲' : '▼'}</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '0 16px 100px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card fade-up" style={{ borderRadius: 28, padding: 40 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><HandleItRobotLogo size={80} /></div>
          <h2 style={{ color: 'white', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 12 }}>Handle your life.<br />Not the paperwork.</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>5 free uses. No credit card. Start right now.</p>
          <button onClick={() => router.push('/dashboard')} className="glass-btn-blue" style={{ padding: '16px 36px', borderRadius: 20, fontWeight: 800, fontSize: 16, color: 'white', border: 'none', cursor: 'pointer' }}>
            Start Free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 16px 40px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 4px', marginBottom: 16 }}>
          {[
            { label: 'Pricing', path: '/pricing' },
            { label: 'Login', path: '/login' },
            { label: 'Terms', path: '/legal/terms' },
            { label: 'Privacy', path: '/legal/privacy' },
            { label: 'Refund Policy', path: '/legal/refund-policy' },
            { label: 'Acceptable Use', path: '/legal/acceptable-use' },
            { label: 'Cookies', path: '/legal/cookies' },
          ].map((link, i, arr) => (
            <span key={link.path} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => router.push(link.path)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                {link.label}
              </button>
              {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>·</span>}
            </span>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
          © {new Date().getFullYear()} HandleIt · All rights reserved
        </p>
      </footer>
    </div>
  );
}
