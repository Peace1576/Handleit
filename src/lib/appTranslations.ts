import { LANGUAGES, TRANSLATIONS } from '@/lib/translations';
import { UI_COPY } from '@/lib/uiCopy';

export type SupportedLanguageCode = keyof typeof TRANSLATIONS;
export type AppTranslations = typeof TRANSLATIONS.en & typeof UI_COPY.en;

const SUPPORTED_CODES = new Set<SupportedLanguageCode>(
  LANGUAGES.map(language => language.code as SupportedLanguageCode)
);

const MOJIBAKE_MARKERS = /(?:Ã|Â|â|ð|Ø|Ù|à¤|å|æ|ç|ï¼|�)/;

function repairMojibake(value: string): string {
  if (!MOJIBAKE_MARKERS.test(value)) return value;

  const codePoints = Array.from(value, character => character.charCodeAt(0));
  if (codePoints.some(codePoint => codePoint > 255)) {
    return value;
  }

  try {
    return new TextDecoder('utf-8').decode(Uint8Array.from(codePoints));
  } catch {
    return value;
  }
}

function repairCopy<T>(value: T): T {
  if (typeof value === 'string') {
    return repairMojibake(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => repairCopy(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, repairCopy(nestedValue)])
    ) as T;
  }

  return value;
}

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

  return repairCopy({
    ...TRANSLATIONS.en,
    ...UI_COPY.en,
    ...TRANSLATIONS[resolved],
    ...UI_COPY[resolved],
  } as AppTranslations);
}

export function getLanguageMeta(code?: string | null) {
  const resolved = resolveLanguage(code);
  return repairCopy(LANGUAGES.find(language => language.code === resolved) ?? LANGUAGES[0]);
}
