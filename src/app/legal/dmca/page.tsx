import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'DMCA & Intellectual Property Policy — HandleIt' };

export default function DmcaPage() {
  return (
    <LegalPage title="DMCA & Intellectual Property Policy" lastUpdated="March 31, 2025">
      <section>
        <p>HandleIt respects the intellectual property rights of others and expects users to do the same. This policy describes how we handle claims of copyright infringement under the Digital Millennium Copyright Act (&ldquo;DMCA&rdquo;).</p>
      </section>

      <section>
        <h2>1. Our Intellectual Property</h2>
        <p>All content, software, branding, design, and technology that makes up the HandleIt Service is protected by copyright, trademark, and other intellectual property laws. This includes but is not limited to:</p>
        <ul>
          <li>The HandleIt name, logo, and visual identity</li>
          <li>The Service&apos;s user interface and design system</li>
          <li>All underlying software and code</li>
          <li>Marketing copy, product descriptions, and educational content</li>
          <li>System prompts and AI configuration</li>
        </ul>
        <p>You may not copy, reproduce, distribute, modify, or create derivative works from any of the above without our express written permission.</p>
      </section>

      <section>
        <h2>2. User Content and Inputs</h2>
        <p>You represent that you have the right to input any content you submit to the Service. Do not paste copyrighted text you do not have the right to share. We are not responsible for content you submit, but we will respond to valid copyright claims regarding user-submitted content where applicable.</p>
      </section>

      <section>
        <h2>3. AI-Generated Outputs</h2>
        <p>AI-generated outputs are derived from large language model processing of your inputs. We do not guarantee that outputs are free from third-party intellectual property claims. You are responsible for reviewing AI outputs before publication or commercial use.</p>
      </section>

      <section>
        <h2>4. DMCA Takedown Procedure</h2>
        <p>If you believe that content accessible through our Service infringes your copyright, please submit a written notice to our designated DMCA agent containing:</p>
        <ol>
          <li>Your physical or electronic signature (or that of your authorized agent)</li>
          <li>Identification of the copyrighted work you claim has been infringed</li>
          <li>Identification of the allegedly infringing material and its location on our Service</li>
          <li>Your contact information (name, address, phone number, email)</li>
          <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law</li>
          <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf</li>
        </ol>
        <p><strong>Send DMCA notices to:</strong><br />
        DMCA Agent, HandleIt<br />
        Email: <a href="mailto:dmca@handleit.app">dmca@handleit.app</a></p>
      </section>

      <section>
        <h2>5. Counter-Notice Procedure</h2>
        <p>If you believe your content was removed in error, you may submit a counter-notice containing:</p>
        <ol>
          <li>Your physical or electronic signature</li>
          <li>Identification of the removed content and its previous location</li>
          <li>A statement under penalty of perjury that you have a good faith belief the content was removed by mistake or misidentification</li>
          <li>Your name, address, and phone number, and consent to jurisdiction in your district</li>
        </ol>
      </section>

      <section>
        <h2>6. Repeat Infringers</h2>
        <p>HandleIt will terminate accounts of users who are found to be repeat infringers of intellectual property rights.</p>
      </section>

      <section>
        <h2>7. Trademark</h2>
        <p>The HandleIt name and logo are trademarks. You may not use our trademarks without prior written consent. This includes using our name in domain names, social media handles, or product names in a way that implies affiliation or endorsement.</p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>IP and copyright questions: <a href="mailto:dmca@handleit.app">dmca@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
