'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ReportConversionOptions = {
  sendTo: string;
  transactionId?: string;
  onComplete?: () => void;
  timeoutMs?: number;
};

export function reportGoogleAdsConversion({
  sendTo,
  transactionId,
  onComplete,
  timeoutMs = 1000,
}: ReportConversionOptions) {
  if (typeof window === 'undefined') {
    onComplete?.();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    onComplete?.();
  };

  const timer = window.setTimeout(finish, timeoutMs);

  if (typeof window.gtag !== 'function') {
    finish();
    return;
  }

  const payload: Record<string, unknown> = {
    send_to: sendTo,
    event_callback: finish,
  };

  if (transactionId) {
    payload.transaction_id = transactionId;
  }

  window.gtag('event', 'conversion', payload);
}
