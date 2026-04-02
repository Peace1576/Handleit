import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Disclaimer of Warranties & Limitation of Liability — HandleIt' };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer of Warranties & Limitation of Liability" lastUpdated="March 31, 2025">
      <section>
        <p>This page describes the limitations of HandleIt&apos;s responsibility to you. Please read this carefully. These disclaimers are part of our <a href="/legal/terms">Terms of Service</a>.</p>
      </section>

      <section>
        <h2>1. No Professional Advice</h2>
        <p>HandleIt provides AI-generated content as a drafting and informational aid only. Nothing produced by the Service constitutes:</p>
        <ul>
          <li>Legal advice or representation</li>
          <li>Financial or investment advice</li>
          <li>Medical or health advice</li>
          <li>Accounting, tax, or regulatory advice</li>
          <li>Any other form of licensed professional advice</li>
        </ul>
        <p>For matters with significant legal, financial, or health consequences, consult a qualified professional.</p>
      </section>

      <section>
        <h2>2. Disclaimer of Warranties</h2>
        <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, HANDLEIT AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
        <ul>
          <li>WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
          <li>WARRANTIES OF NON-INFRINGEMENT</li>
          <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE</li>
          <li>WARRANTIES AS TO THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY AI-GENERATED OUTPUT</li>
          <li>WARRANTIES THAT ANY DEFECTS WILL BE CORRECTED</li>
        </ul>
        <p>AI-generated outputs may be inaccurate, incomplete, outdated, or inappropriate for your specific situation. You use any generated content at your own risk.</p>
      </section>

      <section>
        <h2>3. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HANDLEIT, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY:</p>
        <ul>
          <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES</li>
          <li>LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL</li>
          <li>COST OF PROCUREMENT OF SUBSTITUTE SERVICES</li>
          <li>DAMAGES ARISING FROM RELIANCE ON AI-GENERATED CONTENT</li>
          <li>DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
        </ul>
        <p>THIS APPLIES WHETHER OR NOT HANDLEIT WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE).</p>
      </section>

      <section>
        <h2>4. Cap on Liability</h2>
        <p>IF HANDLEIT IS FOUND LIABLE TO YOU FOR ANY REASON, OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT YOU PAID HANDLEIT IN THE 12 MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) FIFTY U.S. DOLLARS ($50).</p>
      </section>

      <section>
        <h2>5. Indemnification</h2>
        <p>You agree to defend, indemnify, and hold harmless HandleIt and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any content you submit through the Service.</p>
      </section>

      <section>
        <h2>6. Jurisdictional Variations</h2>
        <p>Some jurisdictions do not allow exclusion of certain warranties or limitation of liability. In such jurisdictions, the above limitations apply to the maximum extent permitted by local law.</p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>For legal questions: <a href="mailto:legal@handleit.app">legal@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
