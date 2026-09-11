import { ItemCondition, TradeMethod, TradeOfferStatus } from '@/types'
import { SupportedLanguage } from './types'
import { dictionaries } from './locales'

export function getConditionLabel(condition: ItemCondition, lang: SupportedLanguage): string {
  const dict = dictionaries[lang] || dictionaries.tr
  return dict.conditions[condition] || condition
}

export function getTradeMethodLabel(method: TradeMethod, lang: SupportedLanguage): string {
  const dict = dictionaries[lang] || dictionaries.tr
  return dict.tradeMethods[method] || method
}

export function getOfferStatusLabel(status: TradeOfferStatus, lang: SupportedLanguage): string {
  const dict = dictionaries[lang] || dictionaries.tr
  return dict.statuses[status] || status
}
