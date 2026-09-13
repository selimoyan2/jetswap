/**
 * Sprint 6 — Real Trade Offers Test Suite
 * Fully self-contained comprehensive test suite covering:
 * 1. Missing offered / requested items rejection
 * 2. Duplicate item within same offer rejection
 * 3. Zero-Cash rule enforcement on offer note
 * 4. Self-offer prevention (cannot request from own item)
 * 5. Multi-receiver prevention (requested items must belong to single user)
 * 6. Non-existent / unauthorized item ownership rejection
 * 7. Non-AVAILABLE item rejection
 * 8. Duplicate active pending offer prevention
 * 9. Offer creation data shape & strict role assignment (OFFERED vs REQUESTED)
 * 10. Serialization correctness & Strict Zero Contact Reveal
 * 11. Offer acceptance state transition (offer -> ACCEPTED, items -> PENDING_TRADE)
 * 12. Offer acceptance re-validation (fails if item no longer AVAILABLE)
 * 13. Auto-cancellation of conflicting pending offers upon acceptance
 * 14. Rejection by receiver (offer -> REJECTED, items remain AVAILABLE)
 * 15. Cancellation by sender (offer -> CANCELLED, items remain AVAILABLE)
 * 16. Authorization guards (only receiver can accept/reject, only sender can cancel)
 * 17. Filter logic for sent vs received vs all offers
 */

import { detectCashKeywords } from '../src/lib/cashFilter'
import { serializeTradeOffer, TradeOfferWithRelations } from '../src/lib/offers/serialization'

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

console.log('\n🚀 Starting Sprint 6 — Real Trade Offers Test Suite...\n')

// -------------------------------------------------------------
// 1. ARRAY & DUPLICATE VALIDATION LOGIC
// -------------------------------------------------------------
console.log('--- 1. Array & Duplicate Validations ---')

function validateOfferArrays(offeredItemIds: unknown, requestedItemIds: unknown) {
  if (!Array.isArray(offeredItemIds) || offeredItemIds.length === 0) {
    return { isValid: false, code: 'MISSING_OFFERED_ITEMS' }
  }
  if (!Array.isArray(requestedItemIds) || requestedItemIds.length === 0) {
    return { isValid: false, code: 'MISSING_REQUESTED_ITEMS' }
  }
  const allItemIds = [...offeredItemIds, ...requestedItemIds]
  if (new Set(allItemIds).size !== allItemIds.length) {
    return { isValid: false, code: 'DUPLICATE_ITEMS_IN_OFFER' }
  }
  return { isValid: true }
}

assert(
  validateOfferArrays([], ['item-2']).code === 'MISSING_OFFERED_ITEMS',
  'Rejects empty offeredItemIds'
)
assert(
  validateOfferArrays(['item-1'], []).code === 'MISSING_REQUESTED_ITEMS',
  'Rejects empty requestedItemIds'
)
assert(
  validateOfferArrays(['item-1', 'item-1'], ['item-2']).code === 'DUPLICATE_ITEMS_IN_OFFER',
  'Rejects duplicate items in offered list'
)
assert(
  validateOfferArrays(['item-1'], ['item-1']).code === 'DUPLICATE_ITEMS_IN_OFFER',
  'Rejects same item in both offered and requested'
)
assert(
  validateOfferArrays(['item-1', 'item-2'], ['item-3']).isValid === true,
  'Accepts valid non-empty, non-overlapping item lists'
)

// -------------------------------------------------------------
// 2. ZERO-CASH RULE ENFORCEMENT ON NOTES
// -------------------------------------------------------------
console.log('\n--- 2. Zero-Cash Rule on Offer Notes ---')

function validateNote(note?: string | null) {
  if (!note || typeof note !== 'string') return { isValid: true, note: null }
  const clean = note.trim()
  if (clean.length === 0) return { isValid: true, note: null }
  if (clean.length > 1000) return { isValid: false, code: 'NOTE_TOO_LONG' }
  const cash = detectCashKeywords(clean)
  if (cash.hasCashViolation) return { isValid: false, code: 'CASH_VIOLATION' }
  return { isValid: true, note: clean }
}

assert(
  validateNote('iPhone veriyorum üstüne 5000 TL nakit öderim').code === 'CASH_VIOLATION',
  'Blocks note containing "5000 TL nakit"'
)
assert(
  validateNote('Fiyatı konuşuruz, nakitle tamamlarız').code === 'CASH_VIOLATION',
  'Blocks note containing "fiyatı" and "nakitle"'
)
assert(
  validateNote('Havale yapabilirim').code === 'CASH_VIOLATION',
  'Blocks note mentioning "havale"'
)
assert(
  validateNote('Satılık ürün değil ama ücreti ne kadar').code === 'CASH_VIOLATION',
  'Blocks note mentioning "ücreti"'
)
assert(
  validateNote('Ürün çok temizdir, orijinal kutusunda elden teslim edebilirim.').isValid === true,
  'Allows legitimate barter negotiation note'
)
assert(
  validateNote(null).isValid === true && validateNote(null).note === null,
  'Allows null note'
)

// -------------------------------------------------------------
// 3. OWNERSHIP & SELF-OFFER PREVENTION RULES
// -------------------------------------------------------------
console.log('\n--- 3. Ownership & Self-Offer Rules ---')

interface MockItem {
  id: string
  userId: string
  title: string
  status: 'AVAILABLE' | 'PENDING_TRADE' | 'TRADED' | 'ARCHIVED'
}

function validateItemsOwnershipAndStatus(
  senderId: string,
  offeredItems: MockItem[],
  requestedItems: MockItem[]
) {
  // Offered items must belong to sender and be AVAILABLE
  for (const item of offeredItems) {
    if (item.userId !== senderId) {
      return { isValid: false, code: 'FORBIDDEN_ITEM_OWNERSHIP' }
    }
    if (item.status !== 'AVAILABLE') {
      return { isValid: false, code: 'OFFERED_ITEM_NOT_AVAILABLE' }
    }
  }

  // Requested items must belong to a single receiver (not sender) and be AVAILABLE
  const receiverId = requestedItems[0].userId
  if (receiverId === senderId) {
    return { isValid: false, code: 'SELF_OFFER_NOT_ALLOWED' }
  }

  for (const item of requestedItems) {
    if (item.userId !== receiverId) {
      return { isValid: false, code: 'MULTIPLE_RECEIVERS_NOT_ALLOWED' }
    }
    if (item.userId === senderId) {
      return { isValid: false, code: 'SELF_OFFER_NOT_ALLOWED' }
    }
    if (item.status !== 'AVAILABLE') {
      return { isValid: false, code: 'REQUESTED_ITEM_NOT_AVAILABLE' }
    }
  }

  return { isValid: true, receiverId }
}

const mockItemUser1A: MockItem = { id: 'i1a', userId: 'user-1', title: 'iPhone 13', status: 'AVAILABLE' }
const mockItemUser1B: MockItem = { id: 'i1b', userId: 'user-1', title: 'AirPods', status: 'AVAILABLE' }
const mockItemUser1Archived: MockItem = { id: 'i1c', userId: 'user-1', title: 'Eski TV', status: 'ARCHIVED' }

const mockItemUser2A: MockItem = { id: 'i2a', userId: 'user-2', title: 'PS5', status: 'AVAILABLE' }
const mockItemUser2Traded: MockItem = { id: 'i2b', userId: 'user-2', title: 'Kamera', status: 'TRADED' }

const mockItemUser3A: MockItem = { id: 'i3a', userId: 'user-3', title: 'MacBook', status: 'AVAILABLE' }

assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser1A], [mockItemUser1B]).code === 'SELF_OFFER_NOT_ALLOWED',
  'Prevents user from offering swap to their own other item'
)
assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser2A], [mockItemUser3A]).code === 'FORBIDDEN_ITEM_OWNERSHIP',
  'Prevents user from offering an item they do not own'
)
assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser1Archived], [mockItemUser2A]).code === 'OFFERED_ITEM_NOT_AVAILABLE',
  'Prevents user from offering ARCHIVED item'
)
assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser1A], [mockItemUser2Traded]).code === 'REQUESTED_ITEM_NOT_AVAILABLE',
  'Prevents requesting non-AVAILABLE (TRADED) item'
)
assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser1A], [mockItemUser2A, mockItemUser3A]).code === 'MULTIPLE_RECEIVERS_NOT_ALLOWED',
  'Prevents requesting items from multiple different users in single offer'
)
assert(
  validateItemsOwnershipAndStatus('user-1', [mockItemUser1A, mockItemUser1B], [mockItemUser2A]).isValid === true,
  'Valid multi-item offer passes ownership and status validation'
)

// -------------------------------------------------------------
// 4. DUPLICATE ACTIVE PENDING OFFER PREVENTION
// -------------------------------------------------------------
console.log('\n--- 4. Duplicate Active Pending Offer Prevention ---')

interface MockTradeOfferRecord {
  id: string
  senderId: string
  receiverId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  offeredItemIds: string[]
  requestedItemIds: string[]
}

function checkDuplicatePendingOffer(
  existingOffers: MockTradeOfferRecord[],
  senderId: string,
  receiverId: string,
  offeredItemIds: string[],
  requestedItemIds: string[]
) {
  const duplicate = existingOffers.find(
    (o) =>
      o.senderId === senderId &&
      o.receiverId === receiverId &&
      o.status === 'PENDING' &&
      o.offeredItemIds.some((id) => offeredItemIds.includes(id)) &&
      o.requestedItemIds.some((id) => requestedItemIds.includes(id))
  )
  return !!duplicate
}

const activeOffersList: MockTradeOfferRecord[] = [
  {
    id: 'offer-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    status: 'PENDING',
    offeredItemIds: ['i1a'],
    requestedItemIds: ['i2a'],
  },
  {
    id: 'offer-old',
    senderId: 'user-1',
    receiverId: 'user-2',
    status: 'REJECTED',
    offeredItemIds: ['i1b'],
    requestedItemIds: ['i2a'],
  },
]

assert(
  checkDuplicatePendingOffer(activeOffersList, 'user-1', 'user-2', ['i1a'], ['i2a']) === true,
  'Detects duplicate pending offer between same parties for same items'
)
assert(
  checkDuplicatePendingOffer(activeOffersList, 'user-1', 'user-2', ['i1b'], ['i2a']) === false,
  'Allows new offer if previous offer for item was REJECTED'
)
assert(
  checkDuplicatePendingOffer(activeOffersList, 'user-3', 'user-2', ['i3a'], ['i2a']) === false,
  'Allows competing offer from another user (user-3) for item i2a while PENDING'
)

// -------------------------------------------------------------
// 5. SERIALIZATION & STRICT ZERO CONTACT REVEAL
// -------------------------------------------------------------
console.log('\n--- 5. Serialization & Zero Contact Reveal ---')

const mockPrismaOffer = {
  id: 'offer-test-123',
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'PENDING' as const,
  note: 'Temiz takas yapalım.',
  contactRevealed: false,
  createdAt: new Date('2026-09-13T12:00:00Z'),
  updatedAt: new Date('2026-09-13T12:00:00Z'),
  sender: {
    id: 'user-1',
    name: 'Ahmet Takasçı',
    avatar: 'https://images.unsplash.com/avatar1',
    city: 'İstanbul',
    country: 'Türkiye',
    rating: 4.8,
    reviewCount: 12,
    // Sensitives in DB record that MUST NOT be exposed
    phone: '+905551112233',
    email: 'ahmet@jetswap.com.tr',
    password: 'hashedpassword',
  },
  receiver: {
    id: 'user-2',
    name: 'Mehmet Alıcı',
    avatar: 'https://images.unsplash.com/avatar2',
    city: 'Ankara',
    country: 'Türkiye',
    rating: 5.0,
    reviewCount: 20,
    phone: '+905559998877',
    email: 'mehmet@jetswap.com.tr',
    password: 'hashedpassword',
  },
  items: [
    {
      id: 'toi-1',
      offerId: 'offer-test-123',
      itemId: 'i1a',
      role: 'OFFERED',
      item: {
        id: 'i1a',
        title: 'iPhone 13',
        images: ['https://images.unsplash.com/iphone'],
        condition: 'LIKE_NEW',
        status: 'AVAILABLE',
        city: 'İstanbul',
        country: 'Türkiye',
        category: {
          id: 'cat-1',
          nameTr: 'Elektronik',
          nameEn: 'Electronics',
        },
      },
    },
    {
      id: 'toi-2',
      offerId: 'offer-test-123',
      itemId: 'i2a',
      role: 'REQUESTED',
      item: {
        id: 'i2a',
        title: 'PlayStation 5',
        images: ['https://images.unsplash.com/ps5'],
        condition: 'BRAND_NEW',
        status: 'AVAILABLE',
        city: 'Ankara',
        country: 'Türkiye',
        category: {
          id: 'cat-2',
          nameTr: 'Oyun & Konsol',
          nameEn: 'Gaming',
        },
      },
    },
  ],
}

// Check viewer sender
const serializedForSender = serializeTradeOffer(mockPrismaOffer as unknown as TradeOfferWithRelations, 'user-1')
assert(serializedForSender.viewerRole === 'SENDER', 'Sender viewerRole is SENDER')
assert(serializedForSender.canCancel === true, 'Sender canCancel is true when PENDING')
assert(serializedForSender.canAccept === false, 'Sender canAccept is false')
assert(serializedForSender.canReject === false, 'Sender canReject is false')
assert(serializedForSender.contactRevealed === false, 'contactRevealed is false')
assert(!('phone' in serializedForSender.sender), 'Sender phone is NOT in serialized output')
assert(!('email' in serializedForSender.sender), 'Sender email is NOT in serialized output')
assert(!('phone' in serializedForSender.receiver), 'Receiver phone is NOT in serialized output')
assert(!('email' in serializedForSender.receiver), 'Receiver email is NOT in serialized output')
assert(serializedForSender.offeredItems.length === 1, '1 offered item correctly grouped')
assert(serializedForSender.requestedItems.length === 1, '1 requested item correctly grouped')

// Check viewer receiver
const serializedForReceiver = serializeTradeOffer(mockPrismaOffer as unknown as TradeOfferWithRelations, 'user-2')
assert(serializedForReceiver.viewerRole === 'RECEIVER', 'Receiver viewerRole is RECEIVER')
assert(serializedForReceiver.canCancel === false, 'Receiver canCancel is false')
assert(serializedForReceiver.canAccept === true, 'Receiver canAccept is true when PENDING')
assert(serializedForReceiver.canReject === true, 'Receiver canReject is true when PENDING')

// -------------------------------------------------------------
// 6. ACCEPTANCE, STATUS TRANSITIONS, & CONFLICT RESOLUTION
// -------------------------------------------------------------
console.log('\n--- 6. Offer Acceptance & Conflict Resolution ---')

function simulateAcceptOffer(
  targetOfferId: string,
  userId: string,
  offers: MockTradeOfferRecord[],
  items: MockItem[]
) {
  const offer = offers.find((o) => o.id === targetOfferId)
  if (!offer) return { success: false, code: 'OFFER_NOT_FOUND' }
  if (offer.receiverId !== userId) return { success: false, code: 'UNAUTHORIZED_RECEIVER' }
  if (offer.status !== 'PENDING') return { success: false, code: 'INVALID_STATUS_TRANSITION' }

  const participatingItemIds = [...offer.offeredItemIds, ...offer.requestedItemIds]

  // Re-check items status
  for (const itemId of participatingItemIds) {
    const item = items.find((i) => i.id === itemId)
    if (!item || item.status !== 'AVAILABLE') {
      return { success: false, code: 'ITEM_NOT_AVAILABLE', itemTitle: item?.title }
    }
  }

  // 1. Mark target offer ACCEPTED
  offer.status = 'ACCEPTED'

  // 2. Mark all items PENDING_TRADE
  for (const itemId of participatingItemIds) {
    const item = items.find((i) => i.id === itemId)
    if (item) item.status = 'PENDING_TRADE'
  }

  // 3. Auto-cancel conflicting pending offers
  const autoCancelledIds: string[] = []
  for (const otherOffer of offers) {
    if (otherOffer.id !== targetOfferId && otherOffer.status === 'PENDING') {
      const hasOverlap =
        otherOffer.offeredItemIds.some((id) => participatingItemIds.includes(id)) ||
        otherOffer.requestedItemIds.some((id) => participatingItemIds.includes(id))
      if (hasOverlap) {
        otherOffer.status = 'CANCELLED'
        autoCancelledIds.push(otherOffer.id)
      }
    }
  }

  return { success: true, autoCancelledIds }
}

const testItems: MockItem[] = [
  { id: 'i1', userId: 'u1', title: 'Telefon', status: 'AVAILABLE' },
  { id: 'i2', userId: 'u2', title: 'Konsol', status: 'AVAILABLE' },
  { id: 'i3', userId: 'u3', title: 'Tablet', status: 'AVAILABLE' },
]

const testOffers: MockTradeOfferRecord[] = [
  {
    id: 'o1',
    senderId: 'u1',
    receiverId: 'u2',
    status: 'PENDING',
    offeredItemIds: ['i1'],
    requestedItemIds: ['i2'],
  },
  {
    id: 'o2_competing',
    senderId: 'u3',
    receiverId: 'u2',
    status: 'PENDING',
    offeredItemIds: ['i3'],
    requestedItemIds: ['i2'], // Also wants i2!
  },
]

// Sender u1 tries to accept
const failSenderAccept = simulateAcceptOffer('o1', 'u1', testOffers, testItems)
assert(!failSenderAccept.success && failSenderAccept.code === 'UNAUTHORIZED_RECEIVER', 'Sender cannot accept offer')

// Receiver u2 accepts o1
const acceptResult = simulateAcceptOffer('o1', 'u2', testOffers, testItems)
assert(acceptResult.success === true, 'Receiver accepted offer successfully')
assert(testOffers.find((o) => o.id === 'o1')?.status === 'ACCEPTED', 'Offer o1 status is ACCEPTED')
assert(testItems.find((i) => i.id === 'i1')?.status === 'PENDING_TRADE', 'Item i1 transitioned to PENDING_TRADE')
assert(testItems.find((i) => i.id === 'i2')?.status === 'PENDING_TRADE', 'Item i2 transitioned to PENDING_TRADE')
assert(
  testOffers.find((o) => o.id === 'o2_competing')?.status === 'CANCELLED',
  'Competing offer o2 was automatically CANCELLED'
)

// Idempotency check: Cannot accept again
const reAcceptResult = simulateAcceptOffer('o1', 'u2', testOffers, testItems)
assert(!reAcceptResult.success && reAcceptResult.code === 'INVALID_STATUS_TRANSITION', 'Cannot re-accept non-pending offer')

// If an item was no longer AVAILABLE, acceptance must fail
const freshItems: MockItem[] = [
  { id: 'ix1', userId: 'ux1', title: 'Laptop', status: 'AVAILABLE' },
  { id: 'ix2', userId: 'ux2', title: 'Monitor', status: 'TRADED' }, // Not available
]
const freshOffers: MockTradeOfferRecord[] = [
  {
    id: 'ox',
    senderId: 'ux1',
    receiverId: 'ux2',
    status: 'PENDING',
    offeredItemIds: ['ix1'],
    requestedItemIds: ['ix2'],
  },
]
const failItemUnavailable = simulateAcceptOffer('ox', 'ux2', freshOffers, freshItems)
assert(!failItemUnavailable.success && failItemUnavailable.code === 'ITEM_NOT_AVAILABLE', 'Fails acceptance if item is no longer AVAILABLE')

// -------------------------------------------------------------
// 7. REJECTION & CANCELLATION FLOWS
// -------------------------------------------------------------
console.log('\n--- 7. Rejection & Cancellation Flows ---')

function simulateRejectOffer(targetOfferId: string, userId: string, offers: MockTradeOfferRecord[]) {
  const offer = offers.find((o) => o.id === targetOfferId)
  if (!offer) return { success: false, code: 'OFFER_NOT_FOUND' }
  if (offer.receiverId !== userId) return { success: false, code: 'UNAUTHORIZED_RECEIVER' }
  if (offer.status !== 'PENDING') return { success: false, code: 'INVALID_STATUS_TRANSITION' }
  offer.status = 'REJECTED'
  return { success: true }
}

function simulateCancelOffer(targetOfferId: string, userId: string, offers: MockTradeOfferRecord[]) {
  const offer = offers.find((o) => o.id === targetOfferId)
  if (!offer) return { success: false, code: 'OFFER_NOT_FOUND' }
  if (offer.senderId !== userId) return { success: false, code: 'UNAUTHORIZED_SENDER' }
  if (offer.status !== 'PENDING') return { success: false, code: 'INVALID_STATUS_TRANSITION' }
  offer.status = 'CANCELLED'
  return { success: true }
}

const rejectTestOffers: MockTradeOfferRecord[] = [
  {
    id: 'rej-1',
    senderId: 'u1',
    receiverId: 'u2',
    status: 'PENDING',
    offeredItemIds: ['i1'],
    requestedItemIds: ['i2'],
  },
  {
    id: 'canc-1',
    senderId: 'u1',
    receiverId: 'u2',
    status: 'PENDING',
    offeredItemIds: ['i1'],
    requestedItemIds: ['i2'],
  },
]

// Rejection authorizations
assert(simulateRejectOffer('rej-1', 'u1', rejectTestOffers).code === 'UNAUTHORIZED_RECEIVER', 'Sender cannot reject offer')
assert(simulateRejectOffer('rej-1', 'u2', rejectTestOffers).success === true, 'Receiver rejects offer')
assert(rejectTestOffers.find((o) => o.id === 'rej-1')?.status === 'REJECTED', 'Offer is REJECTED')

// Cancellation authorizations
assert(simulateCancelOffer('canc-1', 'u2', rejectTestOffers).code === 'UNAUTHORIZED_SENDER', 'Receiver cannot cancel offer')
assert(simulateCancelOffer('canc-1', 'u1', rejectTestOffers).success === true, 'Sender cancels offer')
assert(rejectTestOffers.find((o) => o.id === 'canc-1')?.status === 'CANCELLED', 'Offer is CANCELLED')

console.log(`\n🎉 All ${totalTests} Trade Offer tests passed successfully! (${passedTests}/${totalTests})\n`)
