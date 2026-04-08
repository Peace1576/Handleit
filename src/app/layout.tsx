import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { PostHogProvider } from '@/components/PostHogProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageGate } from '@/components/LanguageGate';
import { GoogleAdsPageView } from '@/components/GoogleAdsPageView';

const googleAdsTagId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export const metadata: Metadata = {
  title: 'HandleIt — AI for Life Admin',
  description: 'AI that writes complaint letters, explains confusing forms, and crafts perfect replies to stressful messages. In seconds.',
  metadataBase: new URL('https://handleit.help'),
  openGraph: {
    title: 'HandleIt — AI for Life Admin',
    description: 'AI that writes complaint letters, explains confusing forms & crafts perfect replies. Try free.',
    type: 'website',
    url: 'https://handleit.help',
    siteName: 'HandleIt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HandleIt — AI for Life Admin',
    description: 'AI that writes complaint letters, explains confusing forms & crafts perfect replies. Try free.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {googleAdsTagId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsTagId}`}
              strategy="beforeInteractive"
            />
            <Script id="google-ads-tag" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${googleAdsTagId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <GoogleAdsPageView tagId={googleAdsTagId} />
        <PostHogProvider>
          <LanguageProvider>
            <LanguageGate>
              {children}
            </LanguageGate>
          </LanguageProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
