import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Refund & Cancellation Policy — HandleIt' };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated="March 31, 2025">
      <section>
        <p>We want you to be confident in your purchase. This policy explains how cancellations and refunds work for HandleIt subscriptions and one-time payments.</p>
      </section>

      <section>
        <h2>1. Free Plan</h2>
        <p>The free plan includes 5 total uses with no credit card required. There is nothing to cancel or refund.</p>
      </section>

      <section>
        <h2>2. Pro Monthly Plan ($17/month)</h2>
        <p><strong>Cancellation:</strong> You may cancel your Pro Monthly subscription at any time from your account Settings page. Cancellation is effective immediately but your Pro access continues until the end of your current billing period. You will not be charged again after cancellation.</p>
        <p><strong>Refunds:</strong> We do not provide prorated refunds for unused days in a billing period. However, if you contact us within <strong>7 days of your initial subscription</strong> and have made 3 or fewer tool uses during that period, we will issue a full refund as a one-time courtesy.</p>
      </section>

      <section>
        <h2>3. Pro Annual Plan ($149/year)</h2>
        <p><strong>Cancellation:</strong> You may cancel at any time from Settings. Your Pro access continues until the end of the 12-month period.</p>
        <p><strong>Refunds:</strong> If you cancel an annual plan within <strong>14 days of purchase</strong> and have made 5 or fewer tool uses, we will issue a full refund. After 14 days, no refund is available, but you retain Pro access for the remainder of the year.</p>
      </section>

      <section>
        <h2>4. Lifetime Plan ($97, one-time)</h2>
        <p>The Lifetime plan is a one-time purchase with no recurring charges.</p>
        <p><strong>Refunds:</strong> If you are not satisfied, contact us within <strong>30 days of purchase</strong> for a full refund. After 30 days, lifetime purchases are non-refundable.</p>
      </section>

      <section>
        <h2>5. How to Request a Refund</h2>
        <p>Email <a href="mailto:billing@handleit.app">billing@handleit.app</a> from the email address associated with your account with the subject line &ldquo;Refund Request.&rdquo; Include your purchase date. We will respond within 3 business days.</p>
        <p>Approved refunds are issued to the original payment method and typically appear within 5–10 business days depending on your bank.</p>
      </section>

      <section>
        <h2>6. Failed Payments and Dunning</h2>
        <p>If a recurring payment fails, we will retry it over the following days. If payment cannot be collected after multiple attempts, your account will be downgraded to the free plan automatically. You can reactivate Pro at any time by updating your payment method in Settings.</p>
      </section>

      <section>
        <h2>7. Abuse of Refund Policy</h2>
        <p>We reserve the right to deny refund requests from accounts that we determine are abusing this policy (e.g., repeatedly subscribing and canceling). Accounts engaged in abuse may be restricted or terminated.</p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>Billing questions: <a href="mailto:billing@handleit.app">billing@handleit.app</a></p>
      </section>
    </LegalPage>
  );
}
