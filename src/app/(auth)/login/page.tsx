'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { HandleItRobotLogo } from '@/components/Logo';

/* ─── friendly error messages ─── */
function friendlyError(msg: string): string {
  if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider'))
    return 'Email sign-up is not yet enabled on this account. Please contact support or try again later.';
  if (msg.includes('Invalid login credentials'))
    return 'Wrong email or password. Double-check and try again.';
  if (msg.includes('Email not confirmed'))
    return 'Please check your email and click the confirmation link before signing in.';
  if (msg.includes('User already registered'))
    return 'An account with this email already exists. Sign in instead.';
  if (msg.includes('Password should be'))
    return 'Password must be at least 8 characters.';
  if (msg.includes('Unable to validate') || msg.includes('invalid'))
    return 'Something went wrong. Check your email and password and try again.';
  return msg;
}

const BG = 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,58,237,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 90%, rgba(26,86,219,0.7) 0%, transparent 60%), #0a0a1a';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 16,
  fontSize: 14,
  color: 'white',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

/** Validate next path — prevents open redirect to external domains */
function safeRedirectPath(next: string | null): string {
  const fallback = '/dashboard';
  if (!next) return fallback;
  try {
    if (!next.startsWith('/') || next.startsWith('//')) return fallback;
    const ALLOWED_PREFIXES = ['/dashboard', '/tools', '/history', '/settings', '/pricing'];
    const isAllowed = ALLOWED_PREFIXES.some(p => next === p || next.startsWith(p + '/') || next.startsWith(p + '?'));
    return isAllowed ? next : fallback;
  } catch {
    return fallback;
  }
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectedFrom = safeRedirectPath(params.get('redirectedFrom'));

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  // Pre-fill error from URL params (e.g. ?error=auth_failed from /callback)
  const [error, setError]     = useState<string | null>(() => {
    const e = params.get('error');
    if (e === 'auth_failed') return 'The confirmation link has expired or is invalid. Please sign in below or request a new confirmation email.';
    return null;
  });
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => { setError(null); setSuccess(null); };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        // Supabase returns "Invalid login credentials" for both wrong password
        // AND unconfirmed email (to prevent email enumeration). Give a clearer hint.
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          setError('Wrong email or password — or your email may not be confirmed yet. Check your inbox for a confirmation link.');
        } else {
          setError(friendlyError(error.message));
        }
      } else {
        router.push(redirectedFrom);
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);

    // Block disposable / throwaway email addresses
    try {
      const check = await fetch(`https://www.disify.com/api/email/${encodeURIComponent(email.trim())}`)
        .then(r => r.json())
        .catch(() => null);
      if (check && check.disposable === true) {
        setError('Please use a real email address. Disposable/temporary emails are not allowed.');
        setLoading(false);
        return;
      }
    } catch {
      // If Disify is down, allow signup to proceed
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${location.origin}/callback?next=${redirectedFrom}`,
        data: { name: name.trim() || undefined, marketing_consent: consent },
      },
    });
    if (error) setError(friendlyError(error.message));
    else setSuccess('Almost there! Check your email for a confirmation link, then come back and sign in.');
    setLoading(false);
  };

  const handleGoogle = async () => {
    reset();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/callback?next=${redirectedFrom}` },
    });
    if (error) setError(friendlyError(error.message));
  };

  /* ── Tab pill styles ── */
  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    background: active ? 'rgba(26,86,219,0.85)' : 'transparent',
    color: active ? 'white' : 'rgba(255,255,255,0.4)',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: BG }}>

      {/* ── Back arrow ── */}
      <div style={{ padding: '20px 24px' }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Centered card ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <HandleItRobotLogo size={60} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>
              {tab === 'signin' ? 'Welcome back' : '5 free uses — no credit card needed'}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28, padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

            {success ? (
              /* ── Success state ── */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📬</div>
                <p style={{ color: '#4ADE80', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Check your email!</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7 }}>{success}</p>
                <button
                  onClick={() => { setSuccess(null); setTab('signin'); setPassword(''); }}
                  style={{ marginTop: 20, background: 'rgba(26,86,219,0.8)', border: '1px solid rgba(100,150,255,0.4)', borderRadius: 16, color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* ── Tab switcher ── */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4, marginBottom: 24 }}>
                  <button style={tabStyle(tab === 'signin')}  onClick={() => { setTab('signin');  reset(); }}>Sign In</button>
                  <button style={tabStyle(tab === 'signup')}  onClick={() => { setTab('signup');  reset(); }}>Create Account</button>
                </div>

                {/* ── Google ── */}
                <button
                  onClick={handleGoogle}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 18, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: 18, fontFamily: 'inherit' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>or with email</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
                </div>

                {/* ── Sign In form ── */}
                {tab === 'signin' && (
                  <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
                    {error && (
                      <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#FCA5A5', fontSize: 13, lineHeight: 1.5 }}>
                        {error}
                      </div>
                    )}
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 18, fontSize: 15, fontWeight: 800, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', background: 'rgba(26,86,219,0.85)', border: '1px solid rgba(100,150,255,0.4)', marginTop: 4, fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
                      {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 4 }}>
                      No account?{' '}
                      <button type="button" onClick={() => { setTab('signup'); reset(); }} style={{ background: 'none', border: 'none', color: 'rgba(99,179,237,0.8)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                        Create one free →
                      </button>
                    </p>
                  </form>
                )}

                {/* ── Sign Up form ── */}
                {tab === 'signup' && (
                  <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                    <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                    <input type="password" placeholder="Password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />

                    {/* Consent */}
                    <label onClick={() => setConsent(!consent)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 2 }}>
                      <div style={{ width: 18, height: 18, minWidth: 18, borderRadius: 5, marginTop: 1, background: consent ? 'rgba(26,86,219,0.9)' : 'rgba(255,255,255,0.07)', border: `1px solid ${consent ? 'rgba(100,150,255,0.6)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {consent && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.6 }}>
                        Email me tips, updates &amp; occasional discounts — unsubscribe any time.
                      </span>
                    </label>

                    {error && (
                      <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#FCA5A5', fontSize: 13, lineHeight: 1.5 }}>
                        {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 18, fontSize: 15, fontWeight: 800, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', background: 'rgba(26,86,219,0.85)', border: '1px solid rgba(100,150,255,0.4)', marginTop: 4, fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
                      {loading ? 'Creating account…' : 'Create Free Account →'}
                    </button>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
                      By creating an account you agree to our{' '}
                      <a href="/legal/terms" style={{ color: 'rgba(99,179,237,0.6)', textDecoration: 'none' }}>Terms</a>
                      {' & '}
                      <a href="/legal/privacy" style={{ color: 'rgba(99,179,237,0.6)', textDecoration: 'none' }}>Privacy Policy</a>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
