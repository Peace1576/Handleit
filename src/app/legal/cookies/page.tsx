import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Cookie Policy — HandleIt' };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="March 31, 2025">
      <section>
        <p>This Cookie Policy explains how HandleIt uses cookies and similar tracking technologies when you visit handleit.app. By using the Service, you consent to the use of cookies as described here.</p>
      </section>

      <section>
        <h2>1. What Are Cookies?</h2>
        <p>Cookies are small text files stored in your browser when you visit a website. They help websites remember information about your visit — like your login state, preferences, or how you navigated the site. Similar technologies include local storage, session storage, and tracking pixels.</p>
      </section>

      <section>
        <h2>2. Cookies We Use</h2>

        <h3>Strictly Necessary Cookies</h3>
        <p>These are essential for the Service to function. You cannot opt out of these.</p>
        <ul>
          <li><strong>Authentication cookies:</strong> Set by Supabase to maintain your logged-in session. Without these, you would need to log in on every page.</li>
          <li><strong>CSRF protection tokens:</strong> Security tokens to prevent cross-site request forgery attacks.</li>
        </ul>

        <h3>Analytics Cookies</h3>
        <p>These help us understand how users interact with the Service so we can improve it.</p>
        <ul>
          <li><strong>PostHog:</strong> We use PostHog for product analytics. PostHog sets cookies to track page views, feature usage (e.g., which tools are used most), session duration, and user flows. Data is pseudonymized and does not include the content of your tool inputs. You can opt out of PostHog tracking by enabling &ldquo;Do Not Track&rdquo; in your browser.</li>
        </ul>

        <h3>Error Monitoring</h3>
        <ul>
          <li><strong>Sentry:</strong> We use Sentry to capture application errors. Sentry may set cookies or use session data to correlate error reports with a session. No personal content from tool inputs is included in error reports.</li>
        </ul>

        <h3>Payment Cookies</h3>
        <ul>
          <li><strong>Stripe:</strong> When you visit the checkout flow, Stripe sets cookies necessary for fraud prevention and secure payment processing. These are governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>.</li>
        </ul>
      </section>

      <section>
        <h2>3. What We Do Not Do</h2>
        <ul>
          <li>We do not use advertising or retargeting cookies</li>
          <li>We do not sell your cookie data to third parties</li>
          <li>We do not use cookies to track your activity across other websites</li>
          <li>We do not use cookies to read your tool inputs or outputs</li>
        </ul>
      </section>

      <section>
        <h2>4. Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>View cookies that are set and delete individual cookies</li>
          <li>Block cookies from specific sites</li>
          <li>Block all third-party cookies</li>
          <li>Clear all cookies when you close the browser</li>
        </ul>
        <p>Note: Disabling strictly necessary cookies (particularly authentication cookies) will prevent you from staying logged in and using the Service.</p>
        <p>Browser cookie settings guides:</p>
        <ul>
          <li>Chrome: Settings → Privacy and Security → Cookies</li>
          <li>Firefox: Options → Privacy &amp; Security</li>
          <li>Safari: Preferences → Privacy</li>
          <li>Edge: Settings → Cookies and Site Permissions</li>
        </ul>
      </section>

      <section>
        <h2>5. Updates to This Policy</h2>
        <p>We may update this Cookie Policy when we add or change the technologies we use. Material changes will be announced on the site or via email.</p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>Cookie or privacy questions: <a href="mailto:privacy@handleit.app">privacy@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
