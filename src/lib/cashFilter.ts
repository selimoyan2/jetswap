/**
 * JetSwap Cash Detection & Prevention Filter (PRD Madde 38)
 * Para talebini ve satış girişimlerini metin içinde tespit eder.
 */

const CASH_KEYWORDS = [
  'tl', 'try', 'usd', 'eur', 'dolar', 'dollar', 'euro', 'lira',
  'satılık', 'satilik', 'fiyat', 'fiyatı', 'fiyati', 'satıyorum', 'satiyorum',
  '+ para', '+para', 'nakit', 'ücret', 'ucret', 'havale', 'eft', 'iban',
  'kredi kartı', 'kredi karti', 'taksit', 'elden para', 'para ver', 'para farkı', 'para farki'
]

const CASH_SYMBOLS = ['₺', '$', '€', '£', '¥']

export interface CashDetectionResult {
  hasCashViolation: boolean
  matchedWords: string[]
  warningMessage: string | null
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function detectCashKeywords(text: string): CashDetectionResult {
  if (!text) {
    return { hasCashViolation: false, matchedWords: [], warningMessage: null }
  }

  const lower = text.toLowerCase()
  const matchedWords: string[] = []

  // Check symbols
  for (const sym of CASH_SYMBOLS) {
    if (text.includes(sym)) {
      matchedWords.push(sym)
    }
  }

  // Check keywords with escaped regex
  for (const kw of CASH_KEYWORDS) {
    const escaped = escapeRegExp(kw)
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ])${escaped}($|\\s|[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ])`, 'i')
    if (regex.test(lower)) {
      if (!matchedWords.includes(kw)) {
        matchedWords.push(kw)
      }
    }
  }

  // Specific check for number followed by currency, e.g. "15000 tl", "500$", "1000 lira"
  const priceRegex = /\d+\s*(tl|try|usd|eur|dolar|euro|lira|bin tl|k tl)/i
  if (priceRegex.test(lower)) {
    const match = lower.match(priceRegex)
    if (match && !matchedWords.includes(match[0])) {
      matchedWords.push(match[0])
    }
  }

  const hasViolation = matchedWords.length > 0

  return {
    hasCashViolation: hasViolation,
    matchedWords,
    warningMessage: hasViolation
      ? `⚠️ Para Uyarısı (PRD Madde 38): Metinde "${matchedWords.join(', ')}" ifadesi tespit edildi. JetSwap yalnızca takas platformudur; para karşılığı satış veya ek nakit talebine izin verilmez.`
      : null
  }
}
