import { detectCashKeywords } from '@/lib/cashFilter'
import { detectContactInfo } from '@/lib/contactFilter'
import { MessageValidationError } from './types'

// Cache to prevent duplicate identical messages within 3 seconds
interface RecentMessageCacheEntry {
  offerId: string
  senderId: string
  normalizedContent: string
  timestamp: number
}

const recentMessagesCache: RecentMessageCacheEntry[] = []

export function checkRecentSpam(
  offerId: string,
  senderId: string,
  content: string
): boolean {
  const now = Date.now()
  const normalized = content.trim().toLowerCase()

  // Clean entries older than 10 seconds
  while (recentMessagesCache.length > 0 && now - recentMessagesCache[0].timestamp > 10000) {
    recentMessagesCache.shift()
  }

  // Check if same offer, same sender, same content within 3000ms
  const isDuplicate = recentMessagesCache.some(
    entry =>
      entry.offerId === offerId &&
      entry.senderId === senderId &&
      entry.normalizedContent === normalized &&
      now - entry.timestamp < 3000
  )

  if (!isDuplicate) {
    recentMessagesCache.push({
      offerId,
      senderId,
      normalizedContent: normalized,
      timestamp: now,
    })
  }

  return isDuplicate
}

export function validateMessageContent(
  content: string,
  options?: { offerId?: string; senderId?: string; allowContact?: boolean }
): { isValid: boolean; error: MessageValidationError | null; cleanContent: string } {
  const trimmed = (content || '').trim()

  // 1. Empty message check
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: {
        code: 'EMPTY_CONTENT',
        message: 'Mesaj içeriği boş olamaz.',
      },
      cleanContent: '',
    }
  }

  // 2. Max length check (2000 characters)
  if (trimmed.length > 2000) {
    return {
      isValid: false,
      error: {
        code: 'MAX_LENGTH_EXCEEDED',
        message: 'Mesaj en fazla 2000 karakter olabilir.',
      },
      cleanContent: trimmed,
    }
  }

  // 3. Zero Cash Rule validation (ALWAYS ON regardless of contact reveal)
  const cashResult = detectCashKeywords(trimmed)
  if (cashResult.hasCashViolation) {
    return {
      isValid: false,
      error: {
        code: 'CASH_NEGOTIATION_BLOCKED',
        message: 'JetSwap\'ta nakit veya para farkı içeren teklifler kullanılamaz.',
      },
      cleanContent: trimmed,
    }
  }

  // 4. Contact Privacy Barrier validation (Active only when allowContact !== true)
  if (!options?.allowContact) {
    const contactResult = detectContactInfo(trimmed)
    if (contactResult.blocked) {
      return {
        isValid: false,
        error: {
          code: 'CONTACT_INFO_BLOCKED',
          message:
            contactResult.warningMessage ||
            'İletişim bilgilerini bu aşamada paylaşamazsın. Güvenli takas süreci tamamlandığında iletişim bilgileri kontrollü şekilde açılacaktır.',
        },
        cleanContent: trimmed,
      }
    }
  }

  // 5. Duplicate Spam Guard (if offerId and senderId provided)
  if (options?.offerId && options?.senderId) {
    if (checkRecentSpam(options.offerId, options.senderId, trimmed)) {
      return {
        isValid: false,
        error: {
          code: 'SPAM_RATE_LIMITED',
          message: 'Lütfen ardı ardına aynı mesajı tekrar göndermeyin.',
        },
        cleanContent: trimmed,
      }
    }
  }

  return {
    isValid: true,
    error: null,
    cleanContent: trimmed,
  }
}
