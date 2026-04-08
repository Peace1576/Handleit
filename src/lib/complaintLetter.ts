import type { ComplaintDraft } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function getLabelValue(raw: string, label: string): string {
  const pattern = new RegExp(`^${label}:\\s*(.*)$`, 'mi');
  const match = raw.match(pattern);
  return match?.[1]?.trim() ?? '';
}

function cleanNullable(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (['unknown', 'n/a', 'none', 'not provided', 'blank'].includes(trimmed.toLowerCase())) {
    return null;
  }
  return trimmed;
}

function cleanEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return EMAIL_REGEX.test(trimmed) ? trimmed : null;
}

export function parseComplaintDraft(raw: string): ComplaintDraft {
  const bodyMatch = raw.match(/BODY_START\s*([\s\S]*?)\s*BODY_END/i);
  const body = bodyMatch?.[1]?.trim() || raw.trim();
  const companyName = cleanNullable(getLabelValue(raw, 'COMPANY_NAME'));
  const recipientName = cleanNullable(getLabelValue(raw, 'RECIPIENT_NAME'));
  const recipientEmail = cleanEmail(getLabelValue(raw, 'RECIPIENT_EMAIL'));
  const recipientRole = cleanNullable(getLabelValue(raw, 'RECIPIENT_ROLE'));
  const suggestedSubject =
    cleanNullable(getLabelValue(raw, 'SUBJECT')) ||
    (companyName ? `Complaint regarding recent experience with ${companyName}` : 'Complaint regarding recent experience');

  return {
    companyName,
    recipientName,
    recipientEmail,
    recipientRole,
    subject: suggestedSubject,
    body,
  };
}
