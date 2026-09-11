import { tr } from './tr'
import { en } from './en'
import { SupportedLanguage, TranslationSchema } from '../types'

export { tr, en }

export const dictionaries: Record<SupportedLanguage, TranslationSchema> = {
  tr,
  en,
}

/**
 * Clean JSON exporter for mobile clients (Flutter, React Native)
 * Allows directly retrieving or serializing language assets.
 */
export function getMobileDictionary(lang: SupportedLanguage): TranslationSchema {
  return dictionaries[lang] || dictionaries.tr
}

export function getAllMobileDictionaries(): Record<SupportedLanguage, TranslationSchema> {
  return dictionaries
}
