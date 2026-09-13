import { detectCashKeywords } from '@/lib/cashFilter'
import { detectContactInfo } from '@/lib/contactFilter'
import { CreateReviewInput, ReviewValidationResult } from './types'

export function validateReviewInput(input: unknown): ReviewValidationResult {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      error: {
        code: 'INVALID_RATING',
        message: 'Geçersiz değerlendirme verisi.',
      },
    }
  }

  const { rating, comment } = input as CreateReviewInput

  // 1. Rating validation: strict integer between 1 and 5
  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_RATING',
        message: 'Puan 1 ile 5 arasında tam sayı olmalıdır.',
      },
    }
  }

  // 2. Comment validation: optional, max 1000 chars, zero-cash and contact info checks
  let cleanComment: string | null = null

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      return {
        isValid: false,
        error: {
          code: 'COMMENT_TOO_LONG',
          message: 'Değerlendirme yorumu metin formatında olmalıdır.',
        },
      }
    }

    const trimmed = comment.trim()

    if (trimmed.length > 0) {
      if (trimmed.length > 1000) {
        return {
          isValid: false,
          error: {
            code: 'COMMENT_TOO_LONG',
            message: 'Değerlendirme yorumu en fazla 1000 karakter olabilir.',
          },
        }
      }

      // Zero-Cash check on review comments
      const cashResult = detectCashKeywords(trimmed)
      if (cashResult.hasCashViolation) {
        return {
          isValid: false,
          error: {
            code: 'CASH_CONTENT_BLOCKED',
            message: 'Değerlendirme yorumunda nakit veya para ile ilgili ifadeler kullanılamaz.',
          },
        }
      }

      // Contact Info barrier (always enforced on reviews to prevent public leak)
      const contactResult = detectContactInfo(trimmed)
      if (contactResult.blocked) {
        return {
          isValid: false,
          error: {
            code: 'CONTACT_INFO_BLOCKED',
            message: 'Değerlendirme yorumunda telefon, e-posta veya sosyal medya gibi iletişim bilgileri paylaşılamaz.',
          },
        }
      }

      cleanComment = trimmed
    }
  }

  return {
    isValid: true,
    rating,
    cleanComment,
  }
}
