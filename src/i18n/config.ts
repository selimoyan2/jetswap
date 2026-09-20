export type SupportedLanguage = 'tr' | 'en'
export type TextDirection = 'ltr' | 'rtl'

export interface LocaleConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  direction: TextDirection
  dateFormat: string
  localeCode: string // e.g., 'tr-TR', 'en-US'
}

export const DEFAULT_LOCALE: SupportedLanguage = 'tr'

export const SUPPORTED_LOCALES: Record<SupportedLanguage, LocaleConfig> = {
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr',
    dateFormat: 'tr-TR',
    localeCode: 'tr-TR',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    dateFormat: 'en-US',
    localeCode: 'en-US',
  },
}

export const SUPPORTED_LOCALE_CODES = Object.keys(SUPPORTED_LOCALES) as SupportedLanguage[]

export function isValidLocale(locale: unknown): locale is SupportedLanguage {
  return typeof locale === 'string' && SUPPORTED_LOCALE_CODES.includes(locale as SupportedLanguage)
}

export function getLocaleDirection(locale: SupportedLanguage): TextDirection {
  return SUPPORTED_LOCALES[locale]?.direction || 'ltr'
}

export const LOCALE_COOKIE_NAME = 'jetswap_locale'
export const COOKIE_NAME = LOCALE_COOKIE_NAME
export const LOCALE_STORAGE_KEY = 'jetswap_preferred_locale'

