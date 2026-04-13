/** @type {import('next').NextConfig} */

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://*.supabase.co';

const csp = {
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://cdn.paddle.com',
    'https://public.profitwell.com',
    'https://us.i.posthog.com',
    'https://app.posthog.com',
    'https://www.googletagmanager.com',
    'https://www.googleadservices.com',
    'https://www.google-analytics.com',
    'https://www.google.com',
    'https://googleads.g.doubleclick.net',
    'https://pagead2.googlesyndication.com',
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://cdn.paddle.com',
  ],
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  imgSrc: [
    "'self'",
    'data:',
    'https://images.unsplash.com',
    'https://www.googletagmanager.com',
    'https://www.google.com',
    'https://google.com',
    'https://www.googleadservices.com',
    'https://googleads.g.doubleclick.net',
    'https://pagead2.googlesyndication.com',
    'https://www.google-analytics.com',
  ],
  connectSrc: [
    "'self'",
    supabaseOrigin,
    'https://api.groq.com',
    'https://sandbox-api.paddle.com',
    'https://api.paddle.com',
    'https://us.i.posthog.com',
    'https://app.posthog.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.googleadservices.com',
    'https://googleads.g.doubleclick.net',
    'https://www.google.com',
    'https://google.com',
    'https://pagead2.googlesyndication.com',
  ],
  frameSrc: [
    'https://sandbox-buy.paddle.com',
    'https://buy.paddle.com',
    'https://customer.paddle.com',
    'https://www.googletagmanager.com',
  ],
};

const securityHeaders = [
  // Prevent clickjacking — nobody can embed HandleIt in an iframe
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers sniffing MIME types
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send referrer on same-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 1 year (production only — won't hurt in dev)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // Disable dangerous browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // XSS protection for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Content Security Policy — locks down where scripts/styles can load from
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: app code + Paddle/Retain + analytics/ad tags
      `script-src ${csp.scriptSrc.join(' ')}`,
      // Styles: app styles + Google Fonts + Paddle checkout stylesheet
      `style-src ${csp.styleSrc.join(' ')}`,
      // Fonts
      `font-src ${csp.fontSrc.join(' ')}`,
      // Images: previews + analytics/ad beacons
      `img-src ${csp.imgSrc.join(' ')}`,
      // API connections: self + Supabase + Groq + Paddle + PostHog + Google tag
      `connect-src ${csp.connectSrc.join(' ')}`,
      // Paddle checkout iframe + Google tag helper frame
      `frame-src ${csp.frameSrc.join(' ')}`,
      // No plugins
      "object-src 'none'",
      // Base URI locked to self
      "base-uri 'self'",
      // Form submissions only to self
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  experimental: {
    // Tell Next.js not to bundle these server-only packages — require() them at runtime.
    // Fixes pdf-parse and mammoth build errors on Vercel. (Next.js 14 key name)
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
