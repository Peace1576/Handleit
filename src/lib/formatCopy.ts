export function formatCopy(
  template: string,
  vars: Record<string, string | number | null | undefined>
) {
  return Object.entries(vars).reduce((value, [key, replacement]) => {
    return value.replaceAll(`{{${key}}}`, String(replacement ?? ''));
  }, template);
}
