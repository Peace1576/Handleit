'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { HandleItRobotLogo } from '@/components/Logo';
import { Particles } from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

function friendlyError(msg: string, messages: ReturnType<typeof useLanguage>['t']['loginPage']['errors']): string {
  if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
    return messages.providerDisabled;
  }
  if (msg.includes('Invalid login credentials')) {
    return messages.invalidCredentials;
  }
  if (msg.includes('Email not confirmed')) {
    return messages.emailNotConfirmed;
  }
  if (msg.includes('User already registered')) {
    return messages.userAlreadyRegistered;
  }
  if (msg.includes('Password should be')) {
    return messages.passwordTooShort;
  }
  if (msg.includes('Unable to validate') || msg.includes('invalid')) {
    return messages.invalidDetails;
  }
  return msg;
}

function safeRedirectPath(next: string | null): string {
  const fallback = '/dashboard';
  if (!next) return fallback;

  try {
    if (!next.startsWith('/') || next.startsWith('//')) return fallback;
    const allowed = ['/dashboard', '/tools', '/history', '/settings', '/pricing'];
    return allowed.some(path => next === path || next.startsWith(`${path}/`) || next.startsWith(`${path}?`))
      ? next
      : fallback;
  } catch {
    return fallback;
  }
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const redirectedFrom = safeRedirectPath(params.get('redirectedFrom'));
  const initialTab = params.get('mode') === 'signup' ? 'signup' : 'signin';

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const param = params.get('error');
    if (param === 'auth_failed') {
      return t.loginPage.errors.authFailed;
    }
    return null;
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(() => {
    return params.get('gmail_connected') === 'true'
      ? t.loginPage.banners.gmailConnected
      : null;
  });

  const reset = () => {
    setError(null);
    setSuccess(null);
    setBanner(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!email.trim() || !password) {
      setError(t.loginPage.errors.missingEmailPassword);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('invalid_credentials')) {
          setError(t.loginPage.errors.invalidCredentialsAlt);
        } else {
          setError(friendlyError(signInError.message, t.loginPage.errors));
        }
      } else {
        router.push(redirectedFrom);
      }
    } catch {
      setError(t.loginPage.errors.connection);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!email.trim()) {
      setError(t.loginPage.errors.missingEmail);
      return;
    }
    if (password.length < 8) {
      setError(t.loginPage.errors.passwordTooShort);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${location.origin}/callback?next=${redirectedFrom}`,
        data: {
          name: name.trim() || undefined,
          marketing_consent: consent,
        },
      },
    });

    if (signUpError) {
      setError(friendlyError(signUpError.message, t.loginPage.errors));
    } else {
      setSuccess(t.loginPage.successCheckEmail);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    reset();
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/callback?next=${redirectedFrom}` },
    });

    if (oauthError) {
      setError(friendlyError(oauthError.message, t.loginPage.errors));
    }
  };

  return (
    <div className="ios-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Particles />

      <div className="page-wrap" style={{ padding: '24px 0 64px' }}>
        <button className="ghost-btn" onClick={() => router.push('/')} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} />
          {t.back}
        </button>

        <div className="two-column" style={{ alignItems: 'center', gap: 28 }}>
          <div className="fade-up">
            <div className="pill" style={{ marginBottom: 18 }}>
              <Sparkles size={14} color="#58A6FF" />
              {t.loginPage.heroPill}
            </div>
            <h1 style={{ fontSize: 'clamp(30px,4vw,48px)', marginBottom: 14 }}>
              {t.loginPage.heroTitle}
            </h1>
            <p className="section-copy" style={{ maxWidth: 520, marginBottom: 24 }}>
              {t.loginPage.heroSubtitle}
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {t.loginPage.points.map(point => (
                <div key={point} style={{ display: 'flex', gap: 10, color: 'rgba(245,249,255,0.76)', fontSize: 14, lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} color="#58A6FF" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="surface-card fade-up fade-up-delay-1" style={{ marginTop: 24, padding: 20 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>{t.loginPage.bestForLabel}</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{t.loginPage.bestForTitle}</div>
              <div style={{ color: 'rgba(232,241,255,0.62)', fontSize: 14, lineHeight: 1.7 }}>
                {t.loginPage.bestForCopy}
              </div>
            </div>
          </div>

          <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <HandleItRobotLogo size={60} />
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  <span style={{ color: '#58A6FF' }}>Handle</span>It
                </div>
              </div>
              <div style={{ color: 'rgba(232,241,255,0.54)', fontSize: 14 }}>
                {tab === 'signin' ? t.loginPage.welcomeBack : t.loginPage.createFreeAccount}
              </div>
            </div>

            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div className="status-banner status-success" style={{ marginBottom: 16 }}>
                  {success}
                </div>
                <button className="primary-btn" onClick={() => { setSuccess(null); setTab('signin'); setPassword(''); }}>
                  {t.loginPage.goToSignIn}
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                  <button className={tab === 'signin' ? 'primary-btn' : 'secondary-btn'} onClick={() => { setTab('signin'); reset(); }}>
                    {t.loginPage.signIn}
                  </button>
                  <button className={tab === 'signup' ? 'primary-btn' : 'secondary-btn'} onClick={() => { setTab('signup'); reset(); }}>
                    {t.loginPage.createAccount}
                  </button>
                </div>

                {banner && <div className="status-banner status-success" style={{ marginBottom: 14 }}>{banner}</div>}

                <button className="secondary-btn" style={{ width: '100%', marginBottom: 18 }} onClick={handleGoogle}>
                  {t.loginPage.continueWithGoogle}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div className="subtle-divider" style={{ flex: 1 }} />
                  <span style={{ color: 'rgba(232,241,255,0.36)', fontSize: 12 }}>{t.loginPage.orWithEmail}</span>
                  <div className="subtle-divider" style={{ flex: 1 }} />
                </div>

                {tab === 'signin' ? (
                  <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 12 }}>
                    <input className="text-input" type="email" placeholder={t.loginPage.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="text-input" type="password" placeholder={t.loginPage.passwordPlaceholder} value={password} onChange={e => setPassword(e.target.value)} required />
                    {error && <div className="status-banner status-error">{error}</div>}
                    <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                      {loading ? t.loginPage.signingIn : <>{t.loginPage.signIn} <ArrowRight size={16} /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} style={{ display: 'grid', gap: 12 }}>
                    <input className="text-input" type="text" placeholder={t.loginPage.namePlaceholder} value={name} onChange={e => setName(e.target.value)} />
                    <input className="text-input" type="email" placeholder={t.loginPage.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required />
                    <input className="text-input" type="password" placeholder={t.loginPage.passwordMinPlaceholder} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'rgba(232,241,255,0.54)', fontSize: 13, lineHeight: 1.6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} style={{ marginTop: 4 }} />
                      <span>{t.loginPage.marketingConsent}</span>
                    </label>

                    {error && <div className="status-banner status-error">{error}</div>}

                    <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                      {loading ? t.loginPage.creatingAccount : <>{t.loginPage.createAccount} <ArrowRight size={16} /></>}
                    </button>
                  </form>
                )}

                <div style={{ color: 'rgba(232,241,255,0.32)', fontSize: 12, lineHeight: 1.6, marginTop: 16 }}>
                  {t.loginPage.agreement}
                </div>
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
