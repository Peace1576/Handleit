import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

type GmailDraftInput = {
  to?: string | null;
  subject: string;
  body: string;
};

type GmailProfile = {
  email: string;
  name: string | null;
};

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GMAIL_DRAFTS_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/drafts';
const STATE_COOKIE_NAME = 'handleit_gmail_oauth_state';

function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth client environment variables.');
  }

  return { clientId, clientSecret };
}

function getEncryptionKey() {
  const encryptionSecret = process.env.GOOGLE_TOKEN_ENCRYPTION_SECRET;
  if (!encryptionSecret) {
    throw new Error('Missing Gmail token encryption secret.');
  }

  const encryptionKey = createHash('sha256').update(encryptionSecret).digest();
  return encryptionKey;
}

export function buildGoogleRedirectUri(origin: string) {
  return new URL('/api/gmail/callback', origin).toString();
}

export function createOAuthState(): string {
  return randomBytes(24).toString('hex');
}

export function getStateCookieName() {
  return STATE_COOKIE_NAME;
}

export function buildGoogleConnectUrl(state: string, origin: string) {
  const { clientId } = getGoogleClientConfig();
  const redirectUri = buildGoogleRedirectUri(origin);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.compose',
    ].join(' '),
    state,
  });

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

async function postForm<T>(url: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getGoogleClientConfig();
  return postForm<GoogleTokens>(GOOGLE_TOKEN_URL, new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  }));
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getGoogleClientConfig();
  return postForm<GoogleTokens>(GOOGLE_TOKEN_URL, new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }));
}

export async function fetchGoogleProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Could not fetch Google profile.');
  }

  const data = await res.json() as { email?: string; name?: string };
  if (!data.email) {
    throw new Error('Google account email not available.');
  }

  return {
    email: data.email,
    name: data.name ?? null,
  };
}

export function encryptRefreshToken(refreshToken: string): string {
  const encryptionKey = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(refreshToken, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptRefreshToken(payload: string): string {
  const encryptionKey = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted token payload.');
  }

  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

function toBase64Url(input: string) {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildMimeMessage({ to, subject, body }: GmailDraftInput) {
  const lines = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    `To: ${to ?? ''}`,
    `Subject: ${subject}`,
    '',
    body,
  ];

  return toBase64Url(lines.join('\r\n'));
}

export async function createGmailDraft(accessToken: string, input: GmailDraftInput) {
  const res = await fetch(GMAIL_DRAFTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        raw: buildMimeMessage(input),
      },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Could not create Gmail draft.');
  }

  return res.json() as Promise<{ id: string }>;
}
