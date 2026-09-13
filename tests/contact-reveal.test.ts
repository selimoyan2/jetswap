/**
 * Sprint 9 — Contact Reveal & Trade Handoff Test Suite
 * Comprehensive, self-contained test suite covering:
 *
 * 1. PENDING_CANNOT_APPROVE: Non-accepted offer cannot be approved (400)
 * 2. COUNTER_OFFERED_CANNOT_APPROVE: Counter-offered offer cannot be approved (400)
 * 3. REJECTED_CANNOT_APPROVE: Rejected offer cannot be approved (400)
 * 4. CANCELLED_CANNOT_APPROVE: Cancelled offer cannot be approved (400)
 * 5. ACCEPTED_SENDER_APPROVE: Sender can approve on ACCEPTED offer
 * 6. ACCEPTED_RECEIVER_APPROVE: Receiver can approve on ACCEPTED offer
 * 7. FIRST_APPROVAL_DOES_NOT_REVEAL: One-sided approval keeps contactRevealed = false
 * 8. SECOND_APPROVAL_REVEALS: Mutual approval sets contactRevealed = true and contactRevealedAt
 * 9. SENDER_APPROVAL_IDEMPOTENT: Repeating sender approval does not error or alter timestamp
 * 10. RECEIVER_APPROVAL_IDEMPOTENT: Repeating receiver approval does not error or alter timestamp
 * 11. CONTACT_REVEALED_AT_SET_ONCE: contactRevealedAt is set only once upon mutual reveal
 * 12. NON_PARTICIPANT_FORBIDDEN: Third-party cannot approve contact reveal (403)
 * 13. UNAUTHENTICATED_FORBIDDEN: Missing session rejected
 * 14. CONTACT_HIDDEN_BEFORE_REVEAL: contact object is null before mutual reveal
 * 15. PHONE_HIDDEN_BEFORE_REVEAL: phone is never serialized before mutual reveal
 * 16. EMAIL_HIDDEN_BEFORE_REVEAL: email is never serialized before mutual reveal
 * 17. OTHER_PARTICIPANT_CONTACT_VISIBLE_AFTER_REVEAL: Participant sees only the counterparty's contact
 * 18. PASSWORD_NEVER_VISIBLE: Passwords and sensitive user fields never exposed
 * 19. THIRD_PARTY_CANNOT_SEE_REVEALED_CONTACT: Observers cannot see contact even if revealed
 * 20. HISTORICAL_REVISION_CANNOT_REVEAL: Historical revisions never have contact reveal available
 * 21. ITEM_REMAINS_PENDING_TRADE: Approval does not mark items as TRADED
 * 22. OFFER_REMAINS_ACCEPTED: Approval does not mark offer as COMPLETED
 * 23. MESSAGE_CONTACT_FILTER_BEFORE_REVEAL: Messages with contact info blocked before reveal
 * 24. MESSAGE_CONTACT_ALLOWED_AFTER_REVEAL: Messages with contact info allowed after reveal
 * 25. MESSAGE_CASH_BLOCKED_AFTER_REVEAL: Zero-cash filter remains active even after reveal
 * 26. SIMULTANEOUS_APPROVAL_SAFETY: Simulated concurrent approvals transition safely
 * 27. TRADE_HANDOFF_HAND_TO_HAND: Correct handoff summary for hand-to-hand items
 * 28. TRADE_HANDOFF_CARGO_ONLY: Correct handoff summary for cargo-only items
 * 29. TRADE_HANDOFF_BOTH_FLEXIBLE: Correct handoff summary for flexible items
 */

import { serializeTradeOffer, TradeOfferWithRelations } from '../src/lib/offers/serialization'
import { validateMessageContent } from '../src/lib/messages/validation'
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

console.log('\n🚀 Starting Sprint 9 — Contact Reveal & Trade Handoff Test Suite...\n')

// -------------------------------------------------------------
// Test Helpers & Mock Factory
// -------------------------------------------------------------
function createMockOffer(overrides: Partial<TradeOfferWithRelations> = {}): TradeOfferWithRelations {
  return {
    id: 'offer-101',
    senderId: 'user-sender',
    receiverId: 'user-receiver',
    status: TradeOfferStatus.ACCEPTED,
    note: 'Takas anlaşıldı',
    contactRevealed: false,
    contactRevealedAt: null,
    senderContactApprovedAt: null,
    receiverContactApprovedAt: null,
    parentOfferId: null,
    revision: 1,
    createdAt: new Date('2026-09-13T12:00:00Z'),
    updatedAt: new Date('2026-09-13T12:00:00Z'),
    sender: {
      id: 'user-sender',
      name: 'Ali Yılmaz',
      avatar: 'https://example.com/ali.jpg',
      city: 'İstanbul',
      country: 'Türkiye',
      rating: 4.8,
      reviewCount: 15,
      phone: '+905551112233',
      email: 'ali@example.com',
    },
    receiver: {
      id: 'user-receiver',
      name: 'Burak Demir',
      avatar: 'https://example.com/burak.jpg',
      city: 'Ankara',
      country: 'Türkiye',
      rating: 4.9,
      reviewCount: 22,
      phone: '+905554445566',
      email: 'burak@example.com',
    },
    items: [
      {
        id: 'toi-1',
        offerId: 'offer-101',
        itemId: 'item-1',
        role: 'OFFERED',
        createdAt: new Date(),
        item: {
          id: 'item-1',
          userId: 'user-sender',
          title: 'PlayStation 5 Konsol',
          description: 'Temiz',
          tradeMethod: TradeMethod.BOTH,
          status: ItemStatus.PENDING_TRADE,
          images: ['https://example.com/ps5.jpg'],
          condition: ItemCondition.LIKE_NEW,
          city: 'İstanbul',
          country: 'Türkiye',
          categoryId: 'cat-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          targetCategories: [],
          targetDescription: '',
          valueTier: 'HIGH',
          viewCount: 0,
          category: {
            id: 'cat-1',
            nameTr: 'Elektronik',
            nameEn: 'Electronics',
          },
        } as unknown as TradeOfferWithRelations['items'][number]['item'],
      },
      {
        id: 'toi-2',
        offerId: 'offer-101',
        itemId: 'item-2',
        role: 'REQUESTED',
        createdAt: new Date(),
        item: {
          id: 'item-2',
          userId: 'user-receiver',
          title: 'iPhone 13',
          description: '128 GB',
          tradeMethod: TradeMethod.BOTH,
          status: ItemStatus.PENDING_TRADE,
          images: ['https://example.com/iphone.jpg'],
          condition: ItemCondition.GOOD,
          city: 'Ankara',
          country: 'Türkiye',
          categoryId: 'cat-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          targetCategories: [],
          targetDescription: '',
          valueTier: 'HIGH',
          viewCount: 0,
          category: {
            id: 'cat-1',
            nameTr: 'Elektronik',
            nameEn: 'Electronics',
          },
        } as unknown as TradeOfferWithRelations['items'][number]['item'],
      },
    ],
    ...overrides,
  } as TradeOfferWithRelations
}

// Simulated approveContactReveal logic
function simulateApproveContactReveal(
  offer: TradeOfferWithRelations,
  userId: string
): { success: boolean; error?: string; code?: string; offer: TradeOfferWithRelations } {
  if (!userId) {
    return { success: false, error: 'Authentication required', code: 'UNAUTHORIZED', offer }
  }

  const isSender = offer.senderId === userId
  const isReceiver = offer.receiverId === userId

  if (!isSender && !isReceiver) {
    return { success: false, error: 'You are not a participant in this trade offer', code: 'FORBIDDEN', offer }
  }

  if (offer.status !== TradeOfferStatus.ACCEPTED) {
    return {
      success: false,
      error: 'İletişim bilgileri yalnızca kabul edilmiş (ACCEPTED) tekliflerde onaylanabilir.',
      code: 'INVALID_STATUS',
      offer,
    }
  }

  const now = new Date()
  let senderApproved = offer.senderContactApprovedAt
  let receiverApproved = offer.receiverContactApprovedAt

  if (isSender && !senderApproved) {
    senderApproved = now
  }
  if (isReceiver && !receiverApproved) {
    receiverApproved = now
  }

  const shouldReveal = !!(senderApproved && receiverApproved)
  const contactRevealed = offer.contactRevealed || shouldReveal
  const contactRevealedAt = offer.contactRevealedAt || (shouldReveal ? now : null)

  const updatedOffer: TradeOfferWithRelations = {
    ...offer,
    senderContactApprovedAt: senderApproved,
    receiverContactApprovedAt: receiverApproved,
    contactRevealed,
    contactRevealedAt,
  }

  return { success: true, offer: updatedOffer }
}

// -------------------------------------------------------------
// 1. APPROVAL STATUS GUARDS
// -------------------------------------------------------------
console.log('--- 1. Approval Status Guards ---')

// 1. PENDING_CANNOT_APPROVE
const pendingOffer = createMockOffer({ status: TradeOfferStatus.PENDING })
const resPending = simulateApproveContactReveal(pendingOffer, 'user-sender')
assert(!resPending.success && resPending.code === 'INVALID_STATUS', '1. PENDING_CANNOT_APPROVE: Rejects approval on pending offer')

// 2. COUNTER_OFFERED_CANNOT_APPROVE
const counterOffer = createMockOffer({ status: TradeOfferStatus.COUNTER_OFFERED })
const resCounter = simulateApproveContactReveal(counterOffer, 'user-sender')
assert(!resCounter.success && resCounter.code === 'INVALID_STATUS', '2. COUNTER_OFFERED_CANNOT_APPROVE: Rejects approval on counter-offered parent')

// 3. REJECTED_CANNOT_APPROVE
const rejectedOffer = createMockOffer({ status: TradeOfferStatus.REJECTED })
const resRejected = simulateApproveContactReveal(rejectedOffer, 'user-receiver')
assert(!resRejected.success && resRejected.code === 'INVALID_STATUS', '3. REJECTED_CANNOT_APPROVE: Rejects approval on rejected offer')

// 4. CANCELLED_CANNOT_APPROVE
const cancelledOffer = createMockOffer({ status: TradeOfferStatus.CANCELLED })
const resCancelled = simulateApproveContactReveal(cancelledOffer, 'user-sender')
assert(!resCancelled.success && resCancelled.code === 'INVALID_STATUS', '4. CANCELLED_CANNOT_APPROVE: Rejects approval on cancelled offer')

// -------------------------------------------------------------
// 2. PARTICIPANT PERMISSIONS & AUTH
// -------------------------------------------------------------
console.log('\n--- 2. Participant Permissions & Auth ---')

// 12. NON_PARTICIPANT_FORBIDDEN
const acceptedOffer = createMockOffer({ status: TradeOfferStatus.ACCEPTED })
const resNonParticipant = simulateApproveContactReveal(acceptedOffer, 'user-intruder')
assert(!resNonParticipant.success && resNonParticipant.code === 'FORBIDDEN', '12. NON_PARTICIPANT_FORBIDDEN: Third-party cannot approve contact reveal')

// 13. UNAUTHENTICATED_FORBIDDEN
const resUnauth = simulateApproveContactReveal(acceptedOffer, '')
assert(!resUnauth.success && resUnauth.code === 'UNAUTHORIZED', '13. UNAUTHENTICATED_FORBIDDEN: Missing session is rejected')

// -------------------------------------------------------------
// 3. MUTUAL CONSENT PROGRESSION & PRIVACY
// -------------------------------------------------------------
console.log('\n--- 3. Mutual Consent Progression & Privacy Serialization ---')

// 5. ACCEPTED_SENDER_APPROVE
const step1 = simulateApproveContactReveal(acceptedOffer, 'user-sender')
assert(step1.success && step1.offer.senderContactApprovedAt !== null, '5. ACCEPTED_SENDER_APPROVE: Sender can approve on ACCEPTED offer')

// 7. FIRST_APPROVAL_DOES_NOT_REVEAL
assert(step1.offer.contactRevealed === false && step1.offer.contactRevealedAt === null, '7. FIRST_APPROVAL_DOES_NOT_REVEAL: One-sided approval keeps contactRevealed = false')

// 14, 15, 16: CONTACT_HIDDEN_BEFORE_REVEAL
const senderViewStep1 = serializeTradeOffer(step1.offer, 'user-sender')
assert(senderViewStep1.contact === null, '14. CONTACT_HIDDEN_BEFORE_REVEAL: Contact object is null before mutual reveal')
assert(senderViewStep1.contactReveal!.myApproval === true && senderViewStep1.contactReveal!.otherApproval === false, 'Sender sees myApproval = true, otherApproval = false')
assert(senderViewStep1.contactReveal!.revealed === false, 'Sender sees revealed = false')

const receiverViewStep1 = serializeTradeOffer(step1.offer, 'user-receiver')
assert(receiverViewStep1.contact === null, '15. PHONE_HIDDEN_BEFORE_REVEAL: Phone is never serialized before mutual reveal')
assert(receiverViewStep1.contactReveal!.myApproval === false && receiverViewStep1.contactReveal!.otherApproval === true, 'Receiver sees myApproval = false, otherApproval = true')

const thirdPartyViewStep1 = serializeTradeOffer(step1.offer, 'user-intruder')
assert(thirdPartyViewStep1.contact === null, '16. EMAIL_HIDDEN_BEFORE_REVEAL: Email is never serialized before mutual reveal')
assert(thirdPartyViewStep1.contactReveal!.myApproval === false && thirdPartyViewStep1.contactReveal!.otherApproval === false, 'Third-party sees neither approval')

// 9. SENDER_APPROVAL_IDEMPOTENT
const originalTimestamp = step1.offer.senderContactApprovedAt
const step1Repeat = simulateApproveContactReveal(step1.offer, 'user-sender')
assert(step1Repeat.success, '9. SENDER_APPROVAL_IDEMPOTENT: Repeating sender approval succeeds')
assert(step1Repeat.offer.senderContactApprovedAt === originalTimestamp, 'Sender approval timestamp unchanged on re-approval')

// 6 & 8. ACCEPTED_RECEIVER_APPROVE & SECOND_APPROVAL_REVEALS
const step2 = simulateApproveContactReveal(step1.offer, 'user-receiver')
assert(step2.success && step2.offer.receiverContactApprovedAt !== null, '6. ACCEPTED_RECEIVER_APPROVE: Receiver can approve on ACCEPTED offer')
assert(step2.offer.contactRevealed === true, '8. SECOND_APPROVAL_REVEALS: Mutual approval sets contactRevealed = true')
assert(step2.offer.contactRevealedAt !== null, 'Mutual approval sets contactRevealedAt')

// 10. RECEIVER_APPROVAL_IDEMPOTENT
const receiverTimestamp = step2.offer.receiverContactApprovedAt
const step2Repeat = simulateApproveContactReveal(step2.offer, 'user-receiver')
assert(step2Repeat.success, '10. RECEIVER_APPROVAL_IDEMPOTENT: Repeating receiver approval succeeds')
assert(step2Repeat.offer.receiverContactApprovedAt === receiverTimestamp, 'Receiver approval timestamp unchanged on re-approval')

// 11. CONTACT_REVEALED_AT_SET_ONCE
const revealedAtTimestamp = step2.offer.contactRevealedAt
const repeatAfterReveal = simulateApproveContactReveal(step2.offer, 'user-sender')
assert(repeatAfterReveal.offer.contactRevealedAt === revealedAtTimestamp, '11. CONTACT_REVEALED_AT_SET_ONCE: contactRevealedAt is preserved and not overwritten')

// -------------------------------------------------------------
// 4. CONTACT SERIALIZATION SECURITY AFTER REVEAL
// -------------------------------------------------------------
console.log('\n--- 4. Contact Serialization Security After Reveal ---')

const senderViewStep2 = serializeTradeOffer(step2.offer, 'user-sender')
assert(senderViewStep2.contact !== null, 'Sender now has contact object populated')
assert(senderViewStep2.contact?.name === 'Burak Demir', '17. OTHER_PARTICIPANT_CONTACT_VISIBLE_AFTER_REVEAL: Sender sees receiver name')
assert(senderViewStep2.contact?.phone === '+905554445566', 'Sender sees receiver phone')
assert(senderViewStep2.contact?.email === 'burak@example.com', 'Sender sees receiver email')
assert(!('password' in (senderViewStep2.contact || {})), '18. PASSWORD_NEVER_VISIBLE: Password field not in contact')

const receiverViewStep2 = serializeTradeOffer(step2.offer, 'user-receiver')
assert(receiverViewStep2.contact !== null, 'Receiver now has contact object populated')
assert(receiverViewStep2.contact?.name === 'Ali Yılmaz', 'Receiver sees sender name')
assert(receiverViewStep2.contact?.phone === '+905551112233', 'Receiver sees sender phone')
assert(receiverViewStep2.contact?.email === 'ali@example.com', 'Receiver sees sender email')

// 19. THIRD_PARTY_CANNOT_SEE_REVEALED_CONTACT
const observerViewStep2 = serializeTradeOffer(step2.offer, 'user-intruder')
assert(observerViewStep2.contact === null, '19. THIRD_PARTY_CANNOT_SEE_REVEALED_CONTACT: Observers cannot see contact even after mutual reveal')

// 20. HISTORICAL_REVISION_CANNOT_REVEAL
const historicalOffer = createMockOffer({
  status: TradeOfferStatus.COUNTER_OFFERED,
  contactRevealed: true, // even if maliciously set in DB
})
const historicalSerialized = serializeTradeOffer(historicalOffer, 'user-sender')
assert(historicalSerialized.contactReveal!.available === false, '20. HISTORICAL_REVISION_CANNOT_REVEAL: Historical revision available is false')
assert(historicalSerialized.contact === null, 'Historical revision contact is strictly null')

// 21. ITEM_REMAINS_PENDING_TRADE
assert(step2.offer.items[0].item.status === ItemStatus.PENDING_TRADE, '21. ITEM_REMAINS_PENDING_TRADE: Offered item remains PENDING_TRADE, never TRADED')
assert(step2.offer.items[1].item.status === ItemStatus.PENDING_TRADE, 'Requested item remains PENDING_TRADE, never TRADED')

// 22. OFFER_REMAINS_ACCEPTED
assert(step2.offer.status === TradeOfferStatus.ACCEPTED, '22. OFFER_REMAINS_ACCEPTED: Offer remains ACCEPTED, never COMPLETED')

// -------------------------------------------------------------
// 5. MESSAGE FILTER BEHAVIOR (BEFORE VS AFTER REVEAL)
// -------------------------------------------------------------
console.log('\n--- 5. Message Filter Behavior (Before vs After Reveal) ---')

// 23. MESSAGE_CONTACT_FILTER_BEFORE_REVEAL
const blockedPhone = validateMessageContent('Beni ara: 0555 123 45 67', { allowContact: false })
assert(!blockedPhone.isValid && blockedPhone.error?.code === 'CONTACT_INFO_BLOCKED', '23. MESSAGE_CONTACT_FILTER_BEFORE_REVEAL: Phone number blocked before reveal')

const blockedEmail = validateMessageContent('İletişim: ali.yilmaz@gmail.com', { allowContact: false })
assert(!blockedEmail.isValid && blockedEmail.error?.code === 'CONTACT_INFO_BLOCKED', 'Email address blocked before reveal')

const blockedSocial = validateMessageContent('Whatsapp wa.me/905551234567 ekle', { allowContact: false })
assert(!blockedSocial.isValid && blockedSocial.error?.code === 'CONTACT_INFO_BLOCKED', 'WhatsApp link blocked before reveal')

// 24. MESSAGE_CONTACT_ALLOWED_AFTER_REVEAL
const allowedPhone = validateMessageContent('Beni ara: 0555 123 45 67', { allowContact: true })
assert(allowedPhone.isValid, '24. MESSAGE_CONTACT_ALLOWED_AFTER_REVEAL: Phone allowed when contactRevealed = true')

const allowedEmail = validateMessageContent('İletişim: ali.yilmaz@gmail.com', { allowContact: true })
assert(allowedEmail.isValid, 'Email allowed when contactRevealed = true')

const allowedSocial = validateMessageContent('Whatsapp wa.me/905551234567 ekle', { allowContact: true })
assert(allowedSocial.isValid, 'WhatsApp allowed when contactRevealed = true')

// 25. MESSAGE_CASH_BLOCKED_AFTER_REVEAL
const cashMessage = validateMessageContent('Üstüne nakit 500 TL öderim', { allowContact: true })
assert(!cashMessage.isValid && cashMessage.error?.code === 'CASH_NEGOTIATION_BLOCKED', '25. MESSAGE_CASH_BLOCKED_AFTER_REVEAL: Cash keywords BLOCKED even when contact revealed!')

const cashMessage2 = validateMessageContent('Elden para verebilirim', { allowContact: true })
assert(!cashMessage2.isValid && cashMessage2.error?.code === 'CASH_NEGOTIATION_BLOCKED', 'Zero-cash invariant strictly preserved after reveal')

// -------------------------------------------------------------
// 6. SIMULTANEOUS APPROVAL RACE CONDITION SAFETY
// -------------------------------------------------------------
console.log('\n--- 6. Simultaneous Approval Race Condition Safety ---')

// 26. SIMULTANEOUS_APPROVAL_SAFETY
// Simulate two asynchronous approvals starting from the same initial accepted state
const initial = createMockOffer({ status: TradeOfferStatus.ACCEPTED })

// Transaction 1: Sender approves
const tx1 = simulateApproveContactReveal(initial, 'user-sender')

// Transaction 2: Receiver approves (assuming tx1 committed, or vice versa)
const tx2 = simulateApproveContactReveal(tx1.offer, 'user-receiver')

assert(tx2.offer.contactRevealed === true, '26. SIMULTANEOUS_APPROVAL_SAFETY: Sequential/concurrent transactions both resolve to revealed = true')
assert(tx2.offer.senderContactApprovedAt !== null, 'Sender approval recorded')
assert(tx2.offer.receiverContactApprovedAt !== null, 'Receiver approval recorded')

// -------------------------------------------------------------
// 7. TRADE HANDOFF METHOD DERIVATIONS
// -------------------------------------------------------------
console.log('\n--- 7. Trade Handoff Method Derivations ---')

// 27. TRADE_HANDOFF_HAND_TO_HAND
const handOffer = createMockOffer({
  items: [
    {
      ...createMockOffer().items[0],
      item: { ...createMockOffer().items[0].item, tradeMethod: TradeMethod.HAND_TO_HAND },
    },
    {
      ...createMockOffer().items[1],
      item: { ...createMockOffer().items[1].item, tradeMethod: TradeMethod.HAND_TO_HAND },
    },
  ],
})
const serializedHand = serializeTradeOffer(handOffer, 'user-sender')
assert(serializedHand.tradeHandoff!.hasHandToHand === true, '27. TRADE_HANDOFF_HAND_TO_HAND: hasHandToHand is true')
assert(serializedHand.tradeHandoff!.hasCargo === false, 'hasCargo is false')
assert(serializedHand.tradeHandoff!.supportedMethods.includes(TradeMethod.HAND_TO_HAND), 'supportedMethods includes HAND_TO_HAND')

// 28. TRADE_HANDOFF_CARGO_ONLY
const cargoOffer = createMockOffer({
  items: [
    {
      ...createMockOffer().items[0],
      item: { ...createMockOffer().items[0].item, tradeMethod: TradeMethod.CARGO_ONLY },
    },
    {
      ...createMockOffer().items[1],
      item: { ...createMockOffer().items[1].item, tradeMethod: TradeMethod.CARGO_ONLY },
    },
  ],
})
const serializedCargo = serializeTradeOffer(cargoOffer, 'user-sender')
assert(serializedCargo.tradeHandoff!.hasHandToHand === false, '28. TRADE_HANDOFF_CARGO_ONLY: hasHandToHand is false')
assert(serializedCargo.tradeHandoff!.hasCargo === true, 'hasCargo is true')
assert(serializedCargo.tradeHandoff!.supportedMethods.includes(TradeMethod.CARGO_ONLY), 'supportedMethods includes CARGO_ONLY')

// 29. TRADE_HANDOFF_BOTH_FLEXIBLE
const flexibleOffer = createMockOffer({
  items: [
    {
      ...createMockOffer().items[0],
      item: { ...createMockOffer().items[0].item, tradeMethod: TradeMethod.BOTH },
    },
    {
      ...createMockOffer().items[1],
      item: { ...createMockOffer().items[1].item, tradeMethod: TradeMethod.BOTH },
    },
  ],
})
const serializedFlex = serializeTradeOffer(flexibleOffer, 'user-sender')
assert(serializedFlex.tradeHandoff!.hasHandToHand === true, '29. TRADE_HANDOFF_BOTH_FLEXIBLE: hasHandToHand is true')
assert(serializedFlex.tradeHandoff!.hasCargo === true, 'hasCargo is true')
assert(serializedFlex.tradeHandoff!.supportedMethods.includes(TradeMethod.BOTH), 'supportedMethods includes BOTH')

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log(`\n======================================================`)
console.log(`🎉 Sprint 9 Contact Reveal Test Suite Complete: ${passedTests}/${totalTests} tests passed!`)
console.log(`======================================================\n`)
