import type { Metadata } from 'next';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageGate } from '@/components/LanguageGate';

export const metadata: Metadata = {
  title: 'HandleIt — AI for Life Admin',
  description: 'AI that writes complaint letters, explains confusing forms, and crafts perfect replies to stressful messages. In seconds.',
  openGraph: {
    title: 'HandleIt — AI for Life Admin',
    description: 'Stop stressing. Start HandleIting.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <LanguageProvider>
            <LanguageGate>
              {children}
            </LanguageGate>
          </LanguageProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
