import { LANGUAGES, TRANSLATIONS } from '@/lib/translations';
import { UI_COPY } from '@/lib/uiCopy';

export type SupportedLanguageCode = keyof typeof TRANSLATIONS;
export type AppTranslations = typeof TRANSLATIONS.en & typeof UI_COPY.en;

const SUPPORTED_CODES = new Set<SupportedLanguageCode>(
  LANGUAGES.map(language => language.code as SupportedLanguageCode)
);

export function getSupportedLanguage(code?: string | null): SupportedLanguageCode | null {
  if (!code) return null;
  const normalized = code.toLowerCase();
  const directMatch = normalized as SupportedLanguageCode;
  if (SUPPORTED_CODES.has(directMatch)) return directMatch;

  const base = normalized.split('-')[0] as SupportedLanguageCode;
  return SUPPORTED_CODES.has(base) ? base : null;
}

export function resolveLanguage(code?: string | null): SupportedLanguageCode {
  return getSupportedLanguage(code) ?? 'en';
}

export function getAppTranslations(code?: string | null): AppTranslations {
  const resolved = resolveLanguage(code);

  return {
    ...TRANSLATIONS.en,
    ...UI_COPY.en,
    ...TRANSLATIONS[resolved],
    ...UI_COPY[resolved],
  } as AppTranslations;
}

export function getLanguageMeta(code?: string | null) {
  const resolved = resolveLanguage(code);
  return LANGUAGES.find(language => language.code === resolved) ?? LANGUAGES[0];
}
