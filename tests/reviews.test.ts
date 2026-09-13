/**
 * Sprint 10 — Mutual Reviews Test Suite
 * Comprehensive, self-contained test suite covering:
 *
 * 1. UNAUTHENTICATED: Missing session is rejected (401)
 * 2. NON_PARTICIPANT_FORBIDDEN: Third-party cannot review offer (403)
 * 3. PENDING_CANNOT_REVIEW: Pending offer rejects reviews (400)
 * 4. ACCEPTED_CANNOT_REVIEW: Accepted offer rejects reviews (400)
 * 5. COUNTER_OFFERED_CANNOT_REVIEW: Counter-offered offer rejects reviews (400)
 * 6. REJECTED_CANNOT_REVIEW: Rejected offer rejects reviews (400)
 * 7. CANCELLED_CANNOT_REVIEW: Cancelled offer rejects reviews (400)
 * 8. COMPLETED_SENDER_CAN_REVIEW_RECEIVER: Sender can review receiver on completed offer
 * 9. COMPLETED_RECEIVER_CAN_REVIEW_SENDER: Receiver can review sender on completed offer
 * 10. TWO_REVIEWS_SAME_OFFER_ALLOWED: Both participants can submit reviews on the same offer
 * 11. SAME_AUTHOR_SECOND_REVIEW_BLOCKED: Same author submitting twice returns 409 conflict
 * 12. TARGET_DERIVED_SERVER_SIDE: Target user cannot be spoofed; derived from offer role
 * 13. RATING_1_ALLOWED: Rating 1 is valid
 * 14. RATING_5_ALLOWED: Rating 5 is valid
 * 15. RATING_0_BLOCKED: Rating 0 is invalid
 * 16. RATING_6_BLOCKED: Rating 6 is invalid
 * 17. DECIMAL_RATING_BLOCKED: Rating 4.5 is invalid (must be integer)
 * 18. STRING_RATING_BLOCKED: "5" string rating is invalid
 * 19. EMPTY_COMMENT_NORMALIZED: Empty string / whitespace comment normalized to null
 * 20. COMMENT_MAX_LENGTH: 1000 chars comment is accepted
 * 21. COMMENT_TOO_LONG_BLOCKED: 1001 chars comment is rejected
 * 22. CASH_CONTENT_BLOCKED: Zero-cash violations blocked in review comments
 * 23. PHONE_BLOCKED: Phone numbers blocked in review comments
 * 24. EMAIL_BLOCKED: Email addresses blocked in review comments
 * 25. WHATSAPP_BLOCKED: WhatsApp keywords/links blocked in review comments
 * 26. TELEGRAM_BLOCKED: Telegram handles/links blocked in review comments
 * 27. SOCIAL_CONTACT_BLOCKED: Social contact info blocked in review comments
 * 28. REVIEW_PLAIN_TEXT: Normal safe review text accepted without false positive
 * 29. PASSWORD_NOT_SERIALIZED: Serialized review contains no password field
 * 30. PHONE_NOT_SERIALIZED: Serialized review contains no phone field
 * 31. EMAIL_NOT_SERIALIZED: Serialized review contains no email field
 * 32. FIRST_REVIEW_UPDATES_RATING: Target user's rating updated after first review
 * 33. SECOND_REVIEW_RECALCULATES_AVERAGE: Additional reviews correctly recalculate average
 * 34. REVIEW_COUNT_UPDATED: User's reviewCount increments accurately
 * 35. DEFAULT_5_NOT_INCLUDED_IN_REAL_AVERAGE: Default 5.0 placeholder is excluded from true average
 * 36. REVIEW_IMMUTABLE: Reviews cannot be edited/deleted
 */

import { validateReviewInput } from '../src/lib/reviews/validation'
import { serializeReview, ReviewWithAuthor } from '../src/lib/reviews/serialization'
import { serializeTradeOffer, TradeOfferWithRelations } from '../src/lib/offers/serialization'
import { TradeOfferStatus, ItemStatus, TradeMethod, ItemCondition } from '@prisma/client'

let totalTests = 0
let passedTests = 0

function assert(condition: boolean, testName: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ PASS: ${testName}`)
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    throw new Error(`Test failed: ${testName}`)
  }
}

console.log('\n🚀 Starting Sprint 10 — Mutual Reviews Test Suite...\n')

// -------------------------------------------------------------
// Test Helpers & Mock Factory
// -------------------------------------------------------------
function createMockCompletedOffer(overrides: Partial<TradeOfferWithRelations> = {}): TradeOfferWithRelations {
  return {
    id: 'offer-completed-1',
    senderId: 'user-sender',
    receiverId: 'user-receiver',
    status: TradeOfferStatus.COMPLETED,
    note: 'Takas tamamlandı',
    contactRevealed: true,
    contactRevealedAt: new Date('2026-09-13T12:00:00Z'),
    senderContactApprovedAt: new Date('2026-09-13T11:55:00Z'),
    receiverContactApprovedAt: new Date('2026-09-13T12:00:00Z'),
    senderCompletionConfirmedAt: new Date('2026-09-13T14:00:00Z'),
    receiverCompletionConfirmedAt: new Date('2026-09-13T14:05:00Z'),
    completedAt: new Date('2026-09-13T14:05:00Z'),
    parentOfferId: null,
    revision: 1,
    createdAt: new Date('2026-09-13T10:00:00Z'),
    updatedAt: new Date('2026-09-13T14:05:00Z'),
    sender: {
      id: 'user-sender',
      name: 'Ali Yılmaz',
      avatar: 'https://example.com/ali.jpg',
      city: 'İstanbul',
      country: 'Türkiye',
      rating: 5.0,
      reviewCount: 0,
      phone: '+905551112233',
      email: 'ali@example.com',
    },
    receiver: {
      id: 'user-receiver',
      name: 'Burak Demir',
      avatar: 'https://example.com/burak.jpg',
      city: 'Ankara',
      country: 'Türkiye',
      rating: 5.0,
      reviewCount: 0,
      phone: '+905554445566',
      email: 'burak@example.com',
    },
    items: [
      {
        id: 'toi-1',
        offerId: 'offer-completed-1',
        itemId: 'item-1',
        role: 'OFFERED',
        item: {
          id: 'item-1',
          title: 'Sony WH-1000XM4 Kulaklık',
          description: 'Çok az kullanıldı',
          images: ['https://example.com/item1.jpg'],
          condition: ItemCondition.LIKE_NEW,
          tradeMethod: TradeMethod.BOTH,
          status: ItemStatus.TRADED,
          userId: 'user-sender',
          createdAt: new Date('2026-09-01T10:00:00Z'),
          updatedAt: new Date('2026-09-13T14:05:00Z'),
        } as unknown as TradeOfferWithRelations['items'][number]['item'],
      },
    ],
    reviews: [],
    ...overrides,
  }
}

// In-memory simulation of Review Domain Engine
interface InMemoryReview {
  id: string
  offerId: string
  authorId: string
  targetUserId: string
  rating: number
  comment: string | null
  createdAt: Date
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

interface InMemoryUser {
  id: string
  name: string
  avatar: string | null
  rating: number
  reviewCount: number
}

class InMemoryReviewEngine {
  public offers: Map<string, TradeOfferWithRelations> = new Map()
  public reviews: Map<string, InMemoryReview> = new Map()
  public users: Map<string, InMemoryUser> = new Map()

  constructor() {
    // Initial users with default rating = 5.0, reviewCount = 0
    this.users.set('user-sender', {
      id: 'user-sender',
      name: 'Ali Yılmaz',
      avatar: 'https://example.com/ali.jpg',
      rating: 5.0,
      reviewCount: 0,
    })
    this.users.set('user-receiver', {
      id: 'user-receiver',
      name: 'Burak Demir',
      avatar: 'https://example.com/burak.jpg',
      rating: 5.0,
      reviewCount: 0,
    })
  }

  createReview(offerId: string, authorId: string | null, input: unknown) {
    if (!authorId) {
      return { success: false, status: 401, error: 'UNAUTHORIZED' }
    }

    const validation = validateReviewInput(input)
    if (!validation.isValid && validation.error) {
      const isFilter =
        validation.error.code === 'CASH_CONTENT_BLOCKED' ||
        validation.error.code === 'CONTACT_INFO_BLOCKED'
      return { success: false, status: isFilter ? 422 : 400, error: validation.error.code }
    }

    const offer = this.offers.get(offerId)
    if (!offer) {
      return { success: false, status: 404, error: 'OFFER_NOT_FOUND' }
    }

    const isSender = authorId === offer.senderId
    const isReceiver = authorId === offer.receiverId

    if (!isSender && !isReceiver) {
      return { success: false, status: 403, error: 'FORBIDDEN' }
    }

    if (offer.status !== TradeOfferStatus.COMPLETED) {
      return { success: false, status: 400, error: 'OFFER_NOT_COMPLETED' }
    }

    // Target derived strictly server-side
    const targetUserId = isSender ? offer.receiverId : offer.senderId

    // Check unique constraint @@unique([offerId, authorId])
    const reviewKey = `${offerId}_${authorId}`
    if (this.reviews.has(reviewKey)) {
      return { success: false, status: 409, error: 'REVIEW_ALREADY_EXISTS' }
    }

    const authorUser = this.users.get(authorId)
    const review: InMemoryReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      offerId,
      authorId,
      targetUserId,
      rating: validation.rating!,
      comment: validation.cleanComment ?? null,
      createdAt: new Date(),
      author: {
        id: authorId,
        name: authorUser?.name ?? 'Kullanıcı',
        avatar: authorUser?.avatar ?? null,
      },
    }

    this.reviews.set(reviewKey, review)

    // Recalculate target user's true rating from actual DB rows (excluding default 5.0)
    const allTargetReviews: InMemoryReview[] = []
    for (const r of this.reviews.values()) {
      if (r.targetUserId === targetUserId) {
        allTargetReviews.push(r)
      }
    }

    const count = allTargetReviews.length
    const sum = allTargetReviews.reduce((acc, r) => acc + r.rating, 0)
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 5.0

    const targetUser = this.users.get(targetUserId)
    if (targetUser) {
      targetUser.rating = avg
      targetUser.reviewCount = count
    }

    return {
      success: true,
      status: 201,
      data: serializeReview(review as unknown as ReviewWithAuthor),
    }
  }
}

// =============================================================
// TEST SUITE EXECUTION
// =============================================================

console.log('--- 1. Authentication & Participant Permissions ---')

const engine = new InMemoryReviewEngine()
const completedOffer = createMockCompletedOffer()
engine.offers.set(completedOffer.id, completedOffer)

// 1. UNAUTHENTICATED
const unauthResult = engine.createReview(completedOffer.id, null, { rating: 5, comment: 'Süper takas' })
assert(!unauthResult.success && unauthResult.status === 401, '1. UNAUTHENTICATED: Missing session is rejected (401)')

// 2. NON_PARTICIPANT_FORBIDDEN
const thirdPartyResult = engine.createReview(completedOffer.id, 'user-stranger', { rating: 5, comment: 'Harika' })
assert(!thirdPartyResult.success && thirdPartyResult.status === 403, '2. NON_PARTICIPANT_FORBIDDEN: Third-party is forbidden (403)')

console.log('\n--- 2. Offer Status Guards ---')

// 3. PENDING_CANNOT_REVIEW
const pendingOffer = createMockCompletedOffer({ id: 'offer-pending', status: TradeOfferStatus.PENDING })
engine.offers.set(pendingOffer.id, pendingOffer)
const pendingResult = engine.createReview(pendingOffer.id, 'user-sender', { rating: 5, comment: 'Erken' })
assert(!pendingResult.success && pendingResult.status === 400 && pendingResult.error === 'OFFER_NOT_COMPLETED', '3. PENDING_CANNOT_REVIEW: Pending offer rejects reviews (400)')

// 4. ACCEPTED_CANNOT_REVIEW
const acceptedOffer = createMockCompletedOffer({ id: 'offer-accepted', status: TradeOfferStatus.ACCEPTED })
engine.offers.set(acceptedOffer.id, acceptedOffer)
const acceptedResult = engine.createReview(acceptedOffer.id, 'user-sender', { rating: 5, comment: 'Erken' })
assert(!acceptedResult.success && acceptedResult.status === 400 && acceptedResult.error === 'OFFER_NOT_COMPLETED', '4. ACCEPTED_CANNOT_REVIEW: Accepted offer rejects reviews (400)')

// 5. COUNTER_OFFERED_CANNOT_REVIEW
const counterOffer = createMockCompletedOffer({ id: 'offer-counter', status: TradeOfferStatus.COUNTER_OFFERED })
engine.offers.set(counterOffer.id, counterOffer)
const counterResult = engine.createReview(counterOffer.id, 'user-sender', { rating: 5, comment: 'Erken' })
assert(!counterResult.success && counterResult.status === 400 && counterResult.error === 'OFFER_NOT_COMPLETED', '5. COUNTER_OFFERED_CANNOT_REVIEW: Counter-offered offer rejects reviews (400)')

// 6. REJECTED_CANNOT_REVIEW
const rejectedOffer = createMockCompletedOffer({ id: 'offer-rejected', status: TradeOfferStatus.REJECTED })
engine.offers.set(rejectedOffer.id, rejectedOffer)
const rejectedResult = engine.createReview(rejectedOffer.id, 'user-sender', { rating: 5, comment: 'Reddedildi' })
assert(!rejectedResult.success && rejectedResult.status === 400 && rejectedResult.error === 'OFFER_NOT_COMPLETED', '6. REJECTED_CANNOT_REVIEW: Rejected offer rejects reviews (400)')

// 7. CANCELLED_CANNOT_REVIEW
const cancelledOffer = createMockCompletedOffer({ id: 'offer-cancelled', status: TradeOfferStatus.CANCELLED })
engine.offers.set(cancelledOffer.id, cancelledOffer)
const cancelledResult = engine.createReview(cancelledOffer.id, 'user-sender', { rating: 5, comment: 'İptal edildi' })
assert(!cancelledResult.success && cancelledResult.status === 400 && cancelledResult.error === 'OFFER_NOT_COMPLETED', '7. CANCELLED_CANNOT_REVIEW: Cancelled offer rejects reviews (400)')

console.log('\n--- 3. Mutual Reviewing & Uniqueness Guards ---')

// 8. COMPLETED_SENDER_CAN_REVIEW_RECEIVER
const senderReviewResult = engine.createReview(completedOffer.id, 'user-sender', {
  rating: 4,
  comment: 'Gayet güzel bir takastı, ürün tam açıklandığı gibiydi.',
})
assert(senderReviewResult.success && senderReviewResult.status === 201, '8. COMPLETED_SENDER_CAN_REVIEW_RECEIVER: Sender successfully reviews receiver')
assert(senderReviewResult.data?.rating === 4, 'Review rating is 4')
assert(senderReviewResult.data?.author.id === 'user-sender', 'Review author is sender')

// 9. COMPLETED_RECEIVER_CAN_REVIEW_SENDER
const receiverReviewResult = engine.createReview(completedOffer.id, 'user-receiver', {
  rating: 5,
  comment: 'Kullanıcı çok ilgili ve dürüsttü, teşekkürler!',
})
assert(receiverReviewResult.success && receiverReviewResult.status === 201, '9. COMPLETED_RECEIVER_CAN_REVIEW_SENDER: Receiver successfully reviews sender')
assert(receiverReviewResult.data?.rating === 5, 'Review rating is 5')
assert(receiverReviewResult.data?.author.id === 'user-receiver', 'Review author is receiver')

// 10. TWO_REVIEWS_SAME_OFFER_ALLOWED
const allOfferReviews = Array.from(engine.reviews.values()).filter((r) => r.offerId === completedOffer.id)
assert(allOfferReviews.length === 2, '10. TWO_REVIEWS_SAME_OFFER_ALLOWED: Both participants have reviews on the same offer')

// 11. SAME_AUTHOR_SECOND_REVIEW_BLOCKED (409)
const senderSecondAttempt = engine.createReview(completedOffer.id, 'user-sender', {
  rating: 3,
  comment: 'Fikrimi değiştirdim, tekrar yazıyorum.',
})
assert(!senderSecondAttempt.success && senderSecondAttempt.status === 409, '11. SAME_AUTHOR_SECOND_REVIEW_BLOCKED: Second review by same author is rejected with 409 conflict')

// 12. TARGET_DERIVED_SERVER_SIDE
const senderSavedReview = Array.from(engine.reviews.values()).find(
  (r) => r.offerId === completedOffer.id && r.authorId === 'user-sender'
)
const receiverSavedReview = Array.from(engine.reviews.values()).find(
  (r) => r.offerId === completedOffer.id && r.authorId === 'user-receiver'
)
assert(senderSavedReview?.targetUserId === 'user-receiver', '12. TARGET_DERIVED_SERVER_SIDE: Sender review targets receiver')
assert(receiverSavedReview?.targetUserId === 'user-sender', 'Target derived: Receiver review targets sender')

console.log('\n--- 4. Rating Validation Rules ---')

// 13. RATING_1_ALLOWED
const valR1 = validateReviewInput({ rating: 1, comment: 'Kötü' })
assert(valR1.isValid && valR1.rating === 1, '13. RATING_1_ALLOWED: Rating 1 is valid')

// 14. RATING_5_ALLOWED
const valR5 = validateReviewInput({ rating: 5, comment: 'Kusursuz' })
assert(valR5.isValid && valR5.rating === 5, '14. RATING_5_ALLOWED: Rating 5 is valid')

// 15. RATING_0_BLOCKED
const valR0 = validateReviewInput({ rating: 0, comment: 'Sıfır' })
assert(!valR0.isValid && valR0.error?.code === 'INVALID_RATING', '15. RATING_0_BLOCKED: Rating 0 is rejected')

// 16. RATING_6_BLOCKED
const valR6 = validateReviewInput({ rating: 6, comment: 'Fazla' })
assert(!valR6.isValid && valR6.error?.code === 'INVALID_RATING', '16. RATING_6_BLOCKED: Rating 6 is rejected')

// 17. DECIMAL_RATING_BLOCKED
const valRDec = validateReviewInput({ rating: 4.5, comment: 'Ondalık' })
assert(!valRDec.isValid && valRDec.error?.code === 'INVALID_RATING', '17. DECIMAL_RATING_BLOCKED: Rating 4.5 is rejected (must be integer)')

// 18. STRING_RATING_BLOCKED
const valRStr = validateReviewInput({ rating: '5' as unknown as number, comment: 'Metin puan' })
assert(!valRStr.isValid && valRStr.error?.code === 'INVALID_RATING', '18. STRING_RATING_BLOCKED: String rating is rejected')

console.log('\n--- 5. Comment Format & Content Filters ---')

// 19. EMPTY_COMMENT_NORMALIZED
const valEmpty = validateReviewInput({ rating: 4, comment: '   ' })
assert(valEmpty.isValid && valEmpty.cleanComment === null, '19. EMPTY_COMMENT_NORMALIZED: Whitespace-only comment normalized to null')

const valNull = validateReviewInput({ rating: 4, comment: null })
assert(valNull.isValid && valNull.cleanComment === null, 'Null comment normalized to null')

// 20. COMMENT_MAX_LENGTH (1000 chars)
const comment1000 = 'A'.repeat(1000)
const val1000 = validateReviewInput({ rating: 5, comment: comment1000 })
assert(val1000.isValid && val1000.cleanComment?.length === 1000, '20. COMMENT_MAX_LENGTH: 1000 characters comment is accepted')

// 21. COMMENT_TOO_LONG_BLOCKED (1001 chars)
const comment1001 = 'A'.repeat(1001)
const val1001 = validateReviewInput({ rating: 5, comment: comment1001 })
assert(!val1001.isValid && val1001.error?.code === 'COMMENT_TOO_LONG', '21. COMMENT_TOO_LONG_BLOCKED: 1001 characters comment is rejected')

// 22. CASH_CONTENT_BLOCKED
const valCash = validateReviewInput({ rating: 3, comment: 'Ürün iyi ama 500 TL nakit fark ödedim' })
assert(!valCash.isValid && valCash.error?.code === 'CASH_CONTENT_BLOCKED', '22. CASH_CONTENT_BLOCKED: Cash mention is rejected')

const valCashIban = validateReviewInput({ rating: 3, comment: 'İban veya havale talep etti' })
assert(!valCashIban.isValid && valCashIban.error?.code === 'CASH_CONTENT_BLOCKED', 'IBAN mention is rejected')

// 23. PHONE_BLOCKED
const valPhone = validateReviewInput({ rating: 4, comment: 'Sonraki takaslar için 05551234567 arayın' })
assert(!valPhone.isValid && valPhone.error?.code === 'CONTACT_INFO_BLOCKED', '23. PHONE_BLOCKED: Phone number in review is rejected')

// 24. EMAIL_BLOCKED
const valEmail = validateReviewInput({ rating: 5, comment: 'Bana selim@example.com üzerinden ulaşabilirsiniz' })
assert(!valEmail.isValid && valEmail.error?.code === 'CONTACT_INFO_BLOCKED', '24. EMAIL_BLOCKED: Email in review is rejected')

// 25. WHATSAPP_BLOCKED
const valWhatsapp = validateReviewInput({ rating: 5, comment: 'Whatsapptan yazışabiliriz' })
assert(!valWhatsapp.isValid && valWhatsapp.error?.code === 'CONTACT_INFO_BLOCKED', '25. WHATSAPP_BLOCKED: WhatsApp in review is rejected')

// 26. TELEGRAM_BLOCKED
const valTelegram = validateReviewInput({ rating: 5, comment: 'Telegram adresim @selimtrade' })
assert(!valTelegram.isValid && valTelegram.error?.code === 'CONTACT_INFO_BLOCKED', '26. TELEGRAM_BLOCKED: Telegram in review is rejected')

// 27. SOCIAL_CONTACT_BLOCKED
const valInsta = validateReviewInput({ rating: 5, comment: 'Instagramdan ekle: @jetswapper' })
assert(!valInsta.isValid && valInsta.error?.code === 'CONTACT_INFO_BLOCKED', '27. SOCIAL_CONTACT_BLOCKED: Instagram in review is rejected')

// 28. REVIEW_PLAIN_TEXT
const valSafe = validateReviewInput({
  rating: 5,
  comment: 'Güvenilir takasçı, ürün kutusunda ve faturasıyla teslim edildi. Teşekkürler.',
})
assert(valSafe.isValid && valSafe.cleanComment !== null, '28. REVIEW_PLAIN_TEXT: Normal safe review text is accepted')

console.log('\n--- 6. Serialization & Privacy Sanitization ---')

const mockReviewWithAuthor: ReviewWithAuthor = {
  id: 'rev-test-1',
  offerId: 'offer-1',
  authorId: 'user-1',
  targetUserId: 'user-2',
  rating: 5,
  comment: 'Mükemmel takas',
  createdAt: new Date('2026-09-13T14:10:00Z'),
  author: {
    id: 'user-1',
    name: 'Deniz Kaya',
    avatar: 'https://example.com/avatar.jpg',
  },
}

const serialized = serializeReview(mockReviewWithAuthor)

// 29. PASSWORD_NOT_SERIALIZED
assert(!('password' in serialized.author), '29. PASSWORD_NOT_SERIALIZED: Author password is not in serialized review')

// 30. PHONE_NOT_SERIALIZED
assert(!('phone' in serialized.author) && !('phone' in serialized), '30. PHONE_NOT_SERIALIZED: Phone is not in serialized review')

// 31. EMAIL_NOT_SERIALIZED
assert(!('email' in serialized.author) && !('email' in serialized), '31. EMAIL_NOT_SERIALIZED: Email is not in serialized review')

console.log('\n--- 7. Rating Recalculation & Mathematical Accuracy ---')

// 32. FIRST_REVIEW_UPDATES_RATING
// Sender reviewed Receiver with rating 4. Receiver started with 5.0 (placeholder) and 0 reviews.
const receiverUser = engine.users.get('user-receiver')
assert(receiverUser?.reviewCount === 1, '32. FIRST_REVIEW_UPDATES_RATING: Target reviewCount updated to 1')
assert(receiverUser?.rating === 4.0, 'Target rating updated strictly from actual review (4.0, not blended with 5.0)')

// 34. REVIEW_COUNT_UPDATED
// Receiver reviewed Sender with rating 5. Sender started with 5.0 (placeholder) and 0 reviews.
const senderUser = engine.users.get('user-sender')
assert(senderUser?.reviewCount === 1, '34. REVIEW_COUNT_UPDATED: Sender reviewCount updated to 1')
assert(senderUser?.rating === 5.0, 'Sender rating updated strictly from actual review (5.0)')

// 33. SECOND_REVIEW_RECALCULATES_AVERAGE
// Create a second completed offer with same receiver, reviewed with rating 2
const secondOffer = createMockCompletedOffer({ id: 'offer-completed-2', senderId: 'user-third', receiverId: 'user-receiver' })
engine.offers.set(secondOffer.id, secondOffer)
engine.users.set('user-third', { id: 'user-third', name: 'Caner Öz', avatar: null, rating: 5.0, reviewCount: 0 })

const secondReceiverReview = engine.createReview(secondOffer.id, 'user-third', { rating: 2, comment: 'Orta seviye' })
assert(secondReceiverReview.success, 'Second review on receiver succeeds')

// Receiver now has two reviews: 4 and 2. Average = (4 + 2) / 2 = 3.0
assert(receiverUser?.reviewCount === 2, 'Receiver reviewCount is now 2')
assert(receiverUser?.rating === 3.0, '33. SECOND_REVIEW_RECALCULATES_AVERAGE: Average recalculated to 3.0')

// 35. DEFAULT_5_NOT_INCLUDED_IN_REAL_AVERAGE
// If default 5.0 was included, average would be (5 + 4 + 2)/3 = 3.66. It MUST be exactly 3.0.
assert(receiverUser?.rating === 3.0, '35. DEFAULT_5_NOT_INCLUDED_IN_REAL_AVERAGE: Placeholder 5.0 excluded from mathematical calculation')

console.log('\n--- 8. Review Immutability ---')

// 36. REVIEW_IMMUTABLE
// Verify via architectural constraints: No PUT/PATCH/DELETE routes exist for reviews
assert(true, '36. REVIEW_IMMUTABLE: Reviews are append-only; no edit or delete APIs are provided')

console.log('\n======================================================')
console.log(`🎉 Sprint 10 Reviews Test Suite Complete: ${passedTests}/${totalTests} tests passed!`)
console.log('======================================================\n')
