/** @type {import('next').NextConfig} */

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
      // Scripts: self + Paddle checkout + PostHog analytics
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.paddle.com https://us.i.posthog.com https://app.posthog.com",
      // Styles: self + Google Fonts + inline (needed for styled-jsx)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Unsplash + data URIs (used for file preview)
      "img-src 'self' data: https://images.unsplash.com",
      // API connections: self + Supabase + Groq + Paddle + PostHog
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://*.supabase.co'} https://api.groq.com https://sandbox-api.paddle.com https://api.paddle.com https://us.i.posthog.com https://app.posthog.com`,
      // Paddle checkout iframe
      "frame-src https://sandbox-buy.paddle.com https://buy.paddle.com https://customer.paddle.com",
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
  // Tell Next.js not to bundle these server-only packages — require() them at runtime instead.
  // This avoids webpack trying to statically analyse pdf-parse's test loader and mammoth's binary deps.
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  experimental: {},
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
