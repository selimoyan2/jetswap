import { ItemCondition, TradeMethod, TradeOfferStatus } from '@/types'
import { SupportedLanguage, SUPPORTED_LOCALES } from './config'
import { dictionaries } from './locales'

export function getConditionLabel(condition: ItemCondition | string, lang: SupportedLanguage = 'tr'): string {
  const dict = dictionaries[lang] || dictionaries.tr
  return dict.conditions[condition as keyof typeof dict.conditions] || condition
}

export const getItemConditionLabel = getConditionLabel


export function getTradeMethodLabel(method: TradeMethod | string, lang: SupportedLanguage = 'tr'): string {
  const dict = dictionaries[lang] || dictionaries.tr
  if (method === 'FACE_TO_FACE') return dict.tradeMethods.HAND_TO_HAND
  if (method === 'CARGO') return dict.tradeMethods.CARGO_ONLY
  return (dict.tradeMethods as Record<string, string>)[method] || method
}


export function getOfferStatusLabel(status: TradeOfferStatus | string, lang: SupportedLanguage = 'tr'): string {
  const dict = dictionaries[lang] || dictionaries.tr
  return dict.statuses[status as keyof typeof dict.statuses] || status
}

export function formatLocalizedDate(
  dateInput: Date | string | number,
  lang: SupportedLanguage = 'tr',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return ''
    const localeCode = SUPPORTED_LOCALES[lang]?.localeCode || 'tr-TR'
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return d.toLocaleDateString(localeCode, options || defaultOptions)
  } catch {
    return ''
  }
}
