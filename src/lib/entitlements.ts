export function getFullAccessTestEmails(): string[] {
  return (process.env.FULL_ACCESS_TEST_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

export function hasFullAccessOverride(email: string | null | undefined): boolean {
  if (!email) return false;
  return getFullAccessTestEmails().includes(email.trim().toLowerCase());
}
