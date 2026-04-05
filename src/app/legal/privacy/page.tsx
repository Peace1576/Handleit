import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Privacy Policy — HandleIt' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 31, 2025">
      <section>
        <p>HandleIt (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use our website and services at handleit.app.</p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>
        <h3>Information you provide directly:</h3>
        <ul>
          <li><strong>Account information:</strong> email address, name, and password (or OAuth provider token via Google Sign-In)</li>
          <li><strong>Tool inputs:</strong> text you paste into our tools (form text, situations you describe, messages you want to reply to)</li>
          <li><strong>Payment information:</strong> billing details are handled directly by Paddle; we do not store your card number</li>
        </ul>
        <h3>Information collected automatically:</h3>
        <ul>
          <li><strong>Usage data:</strong> which tools you use, how often, timestamps</li>
          <li><strong>Device data:</strong> browser type, operating system, IP address, referring URL</li>
          <li><strong>Cookies:</strong> session tokens for authentication and analytics identifiers. See our <a href="/legal/cookies">Cookie Policy</a></li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and improve the Service</li>
          <li>To authenticate you and manage your account</li>
          <li>To process payments and manage subscriptions via Paddle</li>
          <li>To generate AI-powered outputs in response to your inputs</li>
          <li>To save your results to your account history (if you are logged in)</li>
          <li>To send transactional emails (account creation, payment receipts, cancellation confirmations)</li>
          <li>To analyze usage patterns and improve the product (via PostHog analytics)</li>
          <li>To detect and prevent fraud or abuse</li>
        </ul>
      </section>

      <section>
        <h2>3. AI Processing and Data</h2>
        <p>Your tool inputs are sent to Groq&apos;s API to generate responses. Groq&apos;s use of this data is governed by <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Groq&apos;s Privacy Policy</a>. We use the API under terms that restrict use of your data for model training.</p>
        <p>We do not sell, share, or use your inputs to train our own models or any third-party models beyond what is necessary to deliver the Service to you.</p>
      </section>

      <section>
        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal data. We share data only with:</p>
        <ul>
          <li><strong>Supabase:</strong> database and authentication infrastructure</li>
          <li><strong>Paddle:</strong> payment processing</li>
          <li><strong>Groq:</strong> AI content generation</li>
          <li><strong>PostHog:</strong> product analytics (anonymized/pseudonymized)</li>
          <li><strong>Sentry:</strong> error monitoring (no user content in error reports)</li>
          <li><strong>Vercel:</strong> hosting and edge infrastructure</li>
          <li><strong>Legal authorities:</strong> if required by law or to protect our rights</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>We retain your account data and saved results for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g., payment records for tax purposes, retained for 7 years).</p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal data</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of marketing communications</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p>To exercise these rights, email us at <a href="mailto:privacy@handleit.app">privacy@handleit.app</a>. We will respond within 30 days.</p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, row-level security in our database, and strict separation of server-only credentials from client-side code. No system is 100% secure; we cannot guarantee absolute security.</p>
      </section>

      <section>
        <h2>8. Children&apos;s Privacy</h2>
        <p>HandleIt is not directed at children under 18. We do not knowingly collect data from anyone under 18. If you believe we have inadvertently collected such data, contact us immediately at <a href="mailto:privacy@handleit.app">privacy@handleit.app</a>.</p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically. We will notify you of material changes by email or by a notice on the Service. Continued use after changes constitutes acceptance.</p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>For privacy inquiries: <a href="mailto:privacy@handleit.app">privacy@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
