import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Acceptable Use Policy — HandleIt' };

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable Use Policy" lastUpdated="March 31, 2025">
      <section>
        <p>This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of HandleIt&apos;s services. By using the Service, you agree to comply with this AUP. Violations may result in suspension or termination of your account without refund.</p>
      </section>

      <section>
        <h2>1. Permitted Uses</h2>
        <p>HandleIt is designed for lawful personal and professional use, including:</p>
        <ul>
          <li>Understanding confusing forms, documents, or official correspondence</li>
          <li>Drafting complaint letters to businesses, service providers, or government agencies</li>
          <li>Generating thoughtful replies to workplace or personal messages</li>
          <li>General life administration assistance</li>
        </ul>
      </section>

      <section>
        <h2>2. Prohibited Uses</h2>
        <p>You may NOT use the Service to:</p>

        <h3>Illegal or Harmful Activity</h3>
        <ul>
          <li>Generate content that violates any applicable law or regulation</li>
          <li>Produce fraudulent, deceptive, or misleading materials intended to deceive others</li>
          <li>Draft content for use in harassment, stalking, or intimidation campaigns</li>
          <li>Facilitate identity theft or impersonation</li>
          <li>Create fake legal or government documents</li>
        </ul>

        <h3>Abusive or Harmful Content</h3>
        <ul>
          <li>Generate hate speech targeting individuals or groups based on protected characteristics</li>
          <li>Produce violent, sexually explicit, or exploitative content</li>
          <li>Create content designed to harm, threaten, or manipulate specific individuals</li>
        </ul>

        <h3>Misuse of the Platform</h3>
        <ul>
          <li>Attempt to reverse-engineer, scrape, or extract AI models or proprietary data</li>
          <li>Use automated bots, scripts, or crawlers to access the Service at scale</li>
          <li>Share your account credentials or allow multiple people to use a single account</li>
          <li>Resell, sublicense, or redistribute access to the Service without written authorization</li>
          <li>Circumvent usage limits or subscription restrictions</li>
          <li>Interfere with the Service&apos;s infrastructure, security, or performance</li>
        </ul>

        <h3>Intellectual Property Violations</h3>
        <ul>
          <li>Input content that infringes copyright, trademarks, or other IP rights</li>
          <li>Use AI outputs in ways that violate third-party intellectual property</li>
        </ul>
      </section>

      <section>
        <h2>3. AI Output Responsibility</h2>
        <p>All AI-generated content is produced by an automated system. You are solely responsible for reviewing, verifying, and deciding how to use any output. HandleIt outputs are not legal, financial, medical, or professional advice. Do not rely on them as a substitute for qualified professional guidance.</p>
      </section>

      <section>
        <h2>4. Reporting Violations</h2>
        <p>If you become aware of misuse of the Service, please report it to: <a href="mailto:abuse@handleit.app">abuse@handleit.app</a></p>
      </section>

      <section>
        <h2>5. Enforcement</h2>
        <p>We reserve the right to investigate suspected violations and to suspend or terminate accounts found in violation of this AUP, with or without notice. We may cooperate with law enforcement in connection with violations of applicable law.</p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>Questions about this AUP: <a href="mailto:legal@handleit.app">legal@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
