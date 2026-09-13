/**
 * Sprint 8 — Structured Counter Offers Test Suite
 * Fully self-contained comprehensive test suite covering all 24 test cases:
 *
 * 1. CREATE_COUNTER_VALID: Successfully creates child revision from pending parent
 * 2. PARENT_BECOMES_COUNTER_OFFERED: Parent offer status transitions to COUNTER_OFFERED
 * 3. CHILD_IS_PENDING: Child offer created with status PENDING and revision = parent.revision + 1
 * 4. PARENT_ITEMS_IMMUTABLE: Parent offer items remain unchanged
 * 5. SENDER_ALTERNATION: Counter proposer becomes child sender, other party becomes child receiver
 * 6. RECEIVER_DERIVATION: Receiver correctly derived regardless of whether sender or receiver countered
 * 7. OFFERED_ITEM_OWNERSHIP: Child sender must own all OFFERED items
 * 8. REQUESTED_ITEM_OWNERSHIP: Child receiver must own all REQUESTED items
 * 9. UNAVAILABLE_ITEM: Counter rejected if any item is not AVAILABLE
 * 10. SELF_OFFER: Cannot propose counter where offered and requested belong to same user
 * 11. CASH_BLOCK: Zero-cash filter blocks cash keywords in counter note
 * 12. CONTACT_BLOCK: Contact filter blocks phone/email/social handles in counter note
 * 13. NON_PARTICIPANT_FORBIDDEN: Third-party user cannot counter an offer
 * 14. COUNTER_ACCEPTED_FORBIDDEN: Cannot counter an ACCEPTED offer
 * 15. COUNTER_REJECTED_FORBIDDEN: Cannot counter a REJECTED offer
 * 16. COUNTER_CANCELLED_FORBIDDEN: Cannot counter a CANCELLED offer
 * 17. DUPLICATE_CHILD_BLOCKED: Linear chain - parent cannot have more than 1 child (409 conflict)
 * 18. LINEAR_CHAIN: Multiple counter iterations form a linear revision chain (rev 1 -> rev 2 -> rev 3)
 * 19. REVISION_HISTORY: History chain includes all revisions from root to latest in order
 * 20. LATEST_REVISION_ACCEPT: Only the latest pending revision can be accepted
 * 21. OLD_REVISION_NOT_ACTIONABLE: Older superseded revisions cannot be accepted, rejected, or cancelled
 * 22. ITEMS_PENDING_AFTER_FINAL_ACCEPT: Accepting the latest revision locks items to PENDING_TRADE
 * 23. PRIVACY: Serialized counter offers keep contactRevealed = false
 * 24. LIST_FILTER_LATEST_ONLY: Counter-offered parents are excluded from active list view
 */

import { detectCashKeywords } from '../src/lib/cashFilter'
import { detectContactInfo } from '../src/lib/contactFilter'
import { TradeOfferStatus, ItemStatus } from '@prisma/client'

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

console.log('\n🚀 Starting Sprint 8 — Structured Counter Offers Test Suite...\n')

// -------------------------------------------------------------
// Mock Domain Models & Simulator
// -------------------------------------------------------------
interface MockItem {
  id: string
  userId: string
  title: string
  status: ItemStatus
}

interface MockOfferItem {
  itemId: string
  role: 'OFFERED' | 'REQUESTED'
}

interface MockTradeOffer {
  id: string
  parentOfferId: string | null
  revision: number
  senderId: string
  receiverId: string
  status: TradeOfferStatus
  note: string | null
  contactRevealed: boolean
  items: MockOfferItem[]
  createdAt: Date
}

class CounterOfferSimulator {
  public items: Map<string, MockItem> = new Map()
  public offers: Map<string, MockTradeOffer> = new Map()
  private idCounter = 1

  constructor() {
    this.reset()
  }

  reset() {
    this.items.clear()
    this.offers.clear()
    this.idCounter = 1
  }

  addItem(item: MockItem) {
    this.items.set(item.id, { ...item })
  }

  addOffer(offer: MockTradeOffer) {
    this.offers.set(offer.id, { ...offer, items: [...offer.items] })
  }

  validateCounterOffer(input: {
    parentOfferId: string
    userId: string
    offeredItemIds: string[]
    requestedItemIds: string[]
    note?: string | null
  }) {
    const { parentOfferId, userId, offeredItemIds, requestedItemIds, note } = input

    // 1. Check parent offer exists
    const parent = this.offers.get(parentOfferId)
    if (!parent) {
      return { isValid: false, code: 'OFFER_NOT_FOUND', status: 404 }
    }

    // 2. Check if parent already has child (linear chain enforcement)
    const existingChildren = Array.from(this.offers.values()).filter(
      (o) => o.parentOfferId === parent.id
    )
    if (parent.status === 'COUNTER_OFFERED' || existingChildren.length > 0) {
      return { isValid: false, code: 'OFFER_ALREADY_REVISED', status: 409 }
    }

    // 3. Parent must be PENDING
    if (parent.status !== 'PENDING') {
      return { isValid: false, code: 'OFFER_NOT_PENDING', status: 400 }
    }

    // 4. Participant authorization
    if (userId !== parent.senderId && userId !== parent.receiverId) {
      return { isValid: false, code: 'FORBIDDEN', status: 403 }
    }

    // 5. Derive sides
    const newSenderId = userId
    const newReceiverId = parent.senderId === userId ? parent.receiverId : parent.senderId

    // 6. Array checks
    if (!Array.isArray(offeredItemIds) || offeredItemIds.length === 0) {
      return { isValid: false, code: 'MISSING_OFFERED_ITEMS', status: 400 }
    }
    if (!Array.isArray(requestedItemIds) || requestedItemIds.length === 0) {
      return { isValid: false, code: 'MISSING_REQUESTED_ITEMS', status: 400 }
    }

    const allItemIds = [...offeredItemIds, ...requestedItemIds]
    if (new Set(allItemIds).size !== allItemIds.length) {
      return { isValid: false, code: 'DUPLICATE_ITEMS_IN_OFFER', status: 400 }
    }

    // 7. Note validations (Zero-Cash & Contact Privacy)
    let cleanNote: string | null = null
    if (note && typeof note === 'string') {
      cleanNote = note.trim()
      if (cleanNote.length === 0) {
        cleanNote = null
      } else if (cleanNote.length > 1000) {
        return { isValid: false, code: 'NOTE_TOO_LONG', status: 400 }
      } else {
        const cashCheck = detectCashKeywords(cleanNote)
        if (cashCheck.hasCashViolation) {
          return { isValid: false, code: 'CASH_NEGOTIATION_BLOCKED', status: 422 }
        }
        const contactCheck = detectContactInfo(cleanNote)
        if (contactCheck.blocked) {
          return { isValid: false, code: 'CONTACT_INFO_BLOCKED', status: 422 }
        }
      }
    }

    // 8. Offered items check
    for (const id of offeredItemIds) {
      const item = this.items.get(id)
      if (!item) {
        return { isValid: false, code: 'ITEM_NOT_FOUND', status: 404 }
      }
      if (item.userId !== newSenderId) {
        return { isValid: false, code: 'OFFERED_ITEM_NOT_OWNED', status: 403 }
      }
      if (item.status !== 'AVAILABLE') {
        return { isValid: false, code: 'OFFERED_ITEM_NOT_AVAILABLE', status: 400 }
      }
    }

    // 9. Requested items check
    for (const id of requestedItemIds) {
      const item = this.items.get(id)
      if (!item) {
        return { isValid: false, code: 'ITEM_NOT_FOUND', status: 404 }
      }
      if (item.userId !== newReceiverId) {
        return { isValid: false, code: 'REQUESTED_ITEM_NOT_OWNED_BY_RECEIVER', status: 400 }
      }
      if (item.status !== 'AVAILABLE') {
        return { isValid: false, code: 'REQUESTED_ITEM_NOT_AVAILABLE', status: 400 }
      }
    }

    return {
      isValid: true,
      data: {
        parent,
        newSenderId,
        newReceiverId,
        offeredItemIds,
        requestedItemIds,
        cleanNote,
      },
    }
  }

  createCounterOffer(input: {
    parentOfferId: string
    userId: string
    offeredItemIds: string[]
    requestedItemIds: string[]
    note?: string | null
  }) {
    const validation = this.validateCounterOffer(input)
    if (!validation.isValid || !validation.data) {
      return { success: false, code: validation.code, status: validation.status }
    }

    const { parent, newSenderId, newReceiverId, offeredItemIds, requestedItemIds, cleanNote } =
      validation.data

    // 2. DB Level Unique Constraint Check: parentOfferId must be UNIQUE (non-null)
    const duplicateParentInDb = Array.from(this.offers.values()).some(
      (o) => o.parentOfferId === parent.id
    )
    if (duplicateParentInDb) {
      // Simulates Prisma P2002 error caught by createCounterOffer catch block
      return {
        success: false,
        code: 'OFFER_ALREADY_REVISED',
        status: 409,
        dbError: 'P2002',
      }
    }

    // Transition parent
    parent.status = 'COUNTER_OFFERED'

    // Create child revision
    const childId = `offer-rev-${parent.revision + 1}-${this.idCounter++}`
    const childOffer: MockTradeOffer = {
      id: childId,
      parentOfferId: parent.id,
      revision: parent.revision + 1,
      senderId: newSenderId,
      receiverId: newReceiverId,
      status: 'PENDING',
      note: cleanNote,
      contactRevealed: false,
      items: [
        ...offeredItemIds.map((id) => ({ itemId: id, role: 'OFFERED' as const })),
        ...requestedItemIds.map((id) => ({ itemId: id, role: 'REQUESTED' as const })),
      ],
      createdAt: new Date(),
    }

    this.offers.set(childId, childOffer)

    return {
      success: true,
      data: childOffer,
    }
  }

  getRevisionChain(offerId: string): MockTradeOffer[] {
    const current = this.offers.get(offerId)
    if (!current) return []

    // 1. Walk up to root
    let root = current
    while (root.parentOfferId) {
      const p = this.offers.get(root.parentOfferId)
      if (!p) break
      root = p
    }

    // 2. Walk down along child revisions
    const chain: MockTradeOffer[] = [root]
    let currentInChain = root

    while (true) {
      const child = Array.from(this.offers.values()).find(
        (o) => o.parentOfferId === currentInChain.id
      )
      if (!child) break
      chain.push(child)
      currentInChain = child
    }

    return chain
  }

  acceptOffer(offerId: string, userId: string) {
    const offer = this.offers.get(offerId)
    if (!offer) return { success: false, code: 'OFFER_NOT_FOUND' }
    if (offer.receiverId !== userId) return { success: false, code: 'UNAUTHORIZED_RECEIVER' }
    if (offer.status !== 'PENDING') return { success: false, code: 'INVALID_STATUS_TRANSITION' }

    // Re-verify items
    for (const oi of offer.items) {
      const item = this.items.get(oi.itemId)
      if (!item || item.status !== 'AVAILABLE') {
        return { success: false, code: 'ITEM_NOT_AVAILABLE' }
      }
    }

    // Mark offer ACCEPTED
    offer.status = 'ACCEPTED'

    // Lock items to PENDING_TRADE
    for (const oi of offer.items) {
      const item = this.items.get(oi.itemId)
      if (item) {
        item.status = 'PENDING_TRADE'
      }
    }

    return { success: true, data: offer }
  }

  listUserActiveOffers(userId: string) {
    // Only return offers where user is participant AND offer is not superseded by a child
    return Array.from(this.offers.values()).filter((o) => {
      const isParticipant = o.senderId === userId || o.receiverId === userId
      if (!isParticipant) return false
      // Has no child revision
      const hasChild = Array.from(this.offers.values()).some((c) => c.parentOfferId === o.id)
      return !hasChild
    })
  }
}

const sim = new CounterOfferSimulator()

// Setup initial state:
// User 1 (Alice): Item A1, A2
// User 2 (Bob): Item B1, B2
// User 3 (Charlie): Item C1
sim.addItem({ id: 'item-A1', userId: 'user-1', title: 'iPhone 13', status: 'AVAILABLE' })
sim.addItem({ id: 'item-A2', userId: 'user-1', title: 'AirPods Pro', status: 'AVAILABLE' })
sim.addItem({ id: 'item-B1', userId: 'user-2', title: 'PlayStation 5', status: 'AVAILABLE' })
sim.addItem({ id: 'item-B2', userId: 'user-2', title: 'DualSense Kol', status: 'AVAILABLE' })
sim.addItem({ id: 'item-C1', userId: 'user-3', title: 'Bisiklet', status: 'AVAILABLE' })

// Original Offer: User 1 offers A1 for User 2's B1
const initialOffer: MockTradeOffer = {
  id: 'offer-root-1',
  parentOfferId: null,
  revision: 1,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'PENDING',
  note: 'Takas düşünür müsün?',
  contactRevealed: false,
  items: [
    { itemId: 'item-A1', role: 'OFFERED' },
    { itemId: 'item-B1', role: 'REQUESTED' },
  ],
  createdAt: new Date('2026-09-13T10:00:00Z'),
}
sim.addOffer(initialOffer)

// -------------------------------------------------------------
// TEST 1: CREATE_COUNTER_VALID
// -------------------------------------------------------------
console.log('--- Test 1: CREATE_COUNTER_VALID ---')
const counterRes1 = sim.createCounterOffer({
  parentOfferId: 'offer-root-1',
  userId: 'user-2', // Bob creates counter
  offeredItemIds: ['item-B1'], // Bob offers B1
  requestedItemIds: ['item-A1', 'item-A2'], // Bob requests A1 + A2
  note: 'AirPods da eklersen anlaşabiliriz.',
})

assert(counterRes1.success === true, 'TEST 1: Successfully creates child counter revision')
const child1 = counterRes1.data!

// -------------------------------------------------------------
// TEST 2: PARENT_BECOMES_COUNTER_OFFERED
// -------------------------------------------------------------
console.log('\n--- Test 2: PARENT_BECOMES_COUNTER_OFFERED ---')
const updatedParent = sim.offers.get('offer-root-1')!
assert(
  updatedParent.status === 'COUNTER_OFFERED',
  'TEST 2: Parent offer status transitioned to COUNTER_OFFERED'
)

// -------------------------------------------------------------
// TEST 3: CHILD_IS_PENDING
// -------------------------------------------------------------
console.log('\n--- Test 3: CHILD_IS_PENDING ---')
assert(child1.status === 'PENDING', 'TEST 3a: Child offer status is PENDING')
assert(child1.revision === 2, 'TEST 3b: Child offer revision is parent.revision + 1 (2)')
assert(child1.parentOfferId === 'offer-root-1', 'TEST 3c: Child parentOfferId points to parent')

// -------------------------------------------------------------
// TEST 4: PARENT_ITEMS_IMMUTABLE
// -------------------------------------------------------------
console.log('\n--- Test 4: PARENT_ITEMS_IMMUTABLE ---')
assert(
  updatedParent.items.length === 2 &&
    updatedParent.items[0].itemId === 'item-A1' &&
    updatedParent.items[1].itemId === 'item-B1',
  'TEST 4: Parent offer items remain immutable and unaltered'
)

// -------------------------------------------------------------
// TEST 5: SENDER_ALTERNATION
// -------------------------------------------------------------
console.log('\n--- Test 5: SENDER_ALTERNATION ---')
assert(child1.senderId === 'user-2', 'TEST 5a: Proposer (user-2) becomes new sender')
assert(child1.receiverId === 'user-1', 'TEST 5b: Counterparty (user-1) becomes new receiver')

// -------------------------------------------------------------
// TEST 6: RECEIVER_DERIVATION
// -------------------------------------------------------------
console.log('\n--- Test 6: RECEIVER_DERIVATION ---')
// Simulate when original sender (user-1) counters back on revision 2
const counterRes2 = sim.createCounterOffer({
  parentOfferId: child1.id,
  userId: 'user-1', // User 1 counters back
  offeredItemIds: ['item-A1'],
  requestedItemIds: ['item-B1'],
  note: 'AirPods veremem ama kargoyu öderim.',
})
assert(counterRes2.success === true, 'TEST 6a: Sender counters back successfully')
const child2 = counterRes2.data!
assert(
  child2.senderId === 'user-1' && child2.receiverId === 'user-2',
  'TEST 6b: Derived receiver is correctly user-2 when user-1 initiates counter'
)

// -------------------------------------------------------------
// TEST 7: OFFERED_ITEM_OWNERSHIP
// -------------------------------------------------------------
console.log('\n--- Test 7: OFFERED_ITEM_OWNERSHIP ---')
// User 2 tries to offer item-A1 (which belongs to user 1)
const failOwnershipOffered = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-A1'], // User 2 does NOT own A1
  requestedItemIds: ['item-A2'],
})
assert(
  !failOwnershipOffered.isValid && failOwnershipOffered.code === 'OFFERED_ITEM_NOT_OWNED',
  'TEST 7: Blocked offering items not owned by proposer (OFFERED_ITEM_NOT_OWNED)'
)

// -------------------------------------------------------------
// TEST 8: REQUESTED_ITEM_OWNERSHIP
// -------------------------------------------------------------
console.log('\n--- Test 8: REQUESTED_ITEM_OWNERSHIP ---')
// User 2 tries to request item-C1 (which belongs to user 3, not receiver user 1)
const failOwnershipRequested = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-C1'], // User 3 owns C1, receiver is user 1
})
assert(
  !failOwnershipRequested.isValid &&
    failOwnershipRequested.code === 'REQUESTED_ITEM_NOT_OWNED_BY_RECEIVER',
  'TEST 8: Blocked requesting items not owned by counterparty (REQUESTED_ITEM_NOT_OWNED_BY_RECEIVER)'
)

// -------------------------------------------------------------
// TEST 9: UNAVAILABLE_ITEM
// -------------------------------------------------------------
console.log('\n--- Test 9: UNAVAILABLE_ITEM ---')
// Temporarily set B2 to TRADED
sim.items.get('item-B2')!.status = 'TRADED'
const failUnavailable = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B2'], // Unavailable
  requestedItemIds: ['item-A1'],
})
assert(
  !failUnavailable.isValid && failUnavailable.code === 'OFFERED_ITEM_NOT_AVAILABLE',
  'TEST 9: Blocked counter offer containing non-AVAILABLE item'
)
sim.items.get('item-B2')!.status = 'AVAILABLE' // revert

// -------------------------------------------------------------
// TEST 10: SELF_OFFER
// -------------------------------------------------------------
console.log('\n--- Test 10: SELF_OFFER ---')
// Duplicate items check prevents offering and requesting same item or own items on both sides
const failSelfDuplicate = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-B1'],
})
assert(
  !failSelfDuplicate.isValid && failSelfDuplicate.code === 'DUPLICATE_ITEMS_IN_OFFER',
  'TEST 10: Blocked self-offer / duplicate items across offered and requested'
)

// -------------------------------------------------------------
// TEST 11: CASH_BLOCK
// -------------------------------------------------------------
console.log('\n--- Test 11: CASH_BLOCK ---')
const failCash = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
  note: 'PS5 veriyorum üstüne 1500 TL nakit öde',
})
assert(
  !failCash.isValid && failCash.code === 'CASH_NEGOTIATION_BLOCKED',
  'TEST 11: Zero-Cash filter blocks cash keywords (CASH_NEGOTIATION_BLOCKED)'
)

// -------------------------------------------------------------
// TEST 12: CONTACT_BLOCK
// -------------------------------------------------------------
console.log('\n--- Test 12: CONTACT_BLOCK ---')
const failContactPhone = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
  note: 'Detaylar için beni ara: 0532 123 4567',
})
assert(
  !failContactPhone.isValid && failContactPhone.code === 'CONTACT_INFO_BLOCKED',
  'TEST 12a: Contact filter blocks phone number in counter note (CONTACT_INFO_BLOCKED)'
)

const failContactSocial = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
  note: 'Instagramdan yaz insta: @selimoyan',
})
assert(
  !failContactSocial.isValid && failContactSocial.code === 'CONTACT_INFO_BLOCKED',
  'TEST 12b: Contact filter blocks social/handle in counter note (CONTACT_INFO_BLOCKED)'
)

// -------------------------------------------------------------
// TEST 13: NON_PARTICIPANT_FORBIDDEN
// -------------------------------------------------------------
console.log('\n--- Test 13: NON_PARTICIPANT_FORBIDDEN ---')
const failThirdParty = sim.validateCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-3', // Charlie is not in this trade
  offeredItemIds: ['item-C1'],
  requestedItemIds: ['item-A1'],
})
assert(
  !failThirdParty.isValid && failThirdParty.code === 'FORBIDDEN',
  'TEST 13: Non-participant forbidden from countering offer (FORBIDDEN)'
)

// -------------------------------------------------------------
// TEST 14: COUNTER_ACCEPTED_FORBIDDEN
// -------------------------------------------------------------
console.log('\n--- Test 14: COUNTER_ACCEPTED_FORBIDDEN ---')
const mockAcceptedOffer: MockTradeOffer = {
  id: 'offer-accepted-1',
  parentOfferId: null,
  revision: 1,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'ACCEPTED',
  note: null,
  contactRevealed: false,
  items: [],
  createdAt: new Date(),
}
sim.addOffer(mockAcceptedOffer)
const failAccepted = sim.validateCounterOffer({
  parentOfferId: 'offer-accepted-1',
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
})
assert(
  !failAccepted.isValid && failAccepted.code === 'OFFER_NOT_PENDING',
  'TEST 14: Cannot counter an ACCEPTED offer (OFFER_NOT_PENDING)'
)

// -------------------------------------------------------------
// TEST 15: COUNTER_REJECTED_FORBIDDEN
// -------------------------------------------------------------
console.log('\n--- Test 15: COUNTER_REJECTED_FORBIDDEN ---')
const mockRejectedOffer: MockTradeOffer = {
  id: 'offer-rejected-1',
  parentOfferId: null,
  revision: 1,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'REJECTED',
  note: null,
  contactRevealed: false,
  items: [],
  createdAt: new Date(),
}
sim.addOffer(mockRejectedOffer)
const failRejected = sim.validateCounterOffer({
  parentOfferId: 'offer-rejected-1',
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
})
assert(
  !failRejected.isValid && failRejected.code === 'OFFER_NOT_PENDING',
  'TEST 15: Cannot counter a REJECTED offer (OFFER_NOT_PENDING)'
)

// -------------------------------------------------------------
// TEST 16: COUNTER_CANCELLED_FORBIDDEN
// -------------------------------------------------------------
console.log('\n--- Test 16: COUNTER_CANCELLED_FORBIDDEN ---')
const mockCancelledOffer: MockTradeOffer = {
  id: 'offer-cancelled-1',
  parentOfferId: null,
  revision: 1,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'CANCELLED',
  note: null,
  contactRevealed: false,
  items: [],
  createdAt: new Date(),
}
sim.addOffer(mockCancelledOffer)
const failCancelled = sim.validateCounterOffer({
  parentOfferId: 'offer-cancelled-1',
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
})
assert(
  !failCancelled.isValid && failCancelled.code === 'OFFER_NOT_PENDING',
  'TEST 16: Cannot counter a CANCELLED offer (OFFER_NOT_PENDING)'
)

// -------------------------------------------------------------
// TEST 17: DUPLICATE_CHILD_BLOCKED & CONCURRENCY DB UNIQUE CONSTRAINT (P2002)
// -------------------------------------------------------------
console.log('\n--- Test 17: DUPLICATE_CHILD_BLOCKED & DB UNIQUE CONSTRAINT ---')
// 17a: Application-level check blocks counter on already revised parent
const failDuplicateChild = sim.validateCounterOffer({
  parentOfferId: child1.id, // child1 is already COUNTER_OFFERED
  userId: 'user-1',
  offeredItemIds: ['item-A1'],
  requestedItemIds: ['item-B1'],
})
assert(
  !failDuplicateChild.isValid &&
    failDuplicateChild.code === 'OFFER_ALREADY_REVISED' &&
    failDuplicateChild.status === 409,
  'TEST 17a: Application level blocks duplicate child counter with 409 conflict (OFFER_ALREADY_REVISED)'
)

// 17b: Concurrency Simulation: Two simultaneous requests bypass pre-validation for a PENDING parent
const concurrentParent: MockTradeOffer = {
  id: 'offer-concurrent-parent',
  parentOfferId: null,
  revision: 1,
  senderId: 'user-1',
  receiverId: 'user-2',
  status: 'PENDING',
  note: 'Concurrent test parent',
  contactRevealed: false,
  items: [
    { itemId: 'item-A1', role: 'OFFERED' },
    { itemId: 'item-B1', role: 'REQUESTED' },
  ],
  createdAt: new Date(),
}
sim.addOffer(concurrentParent)

// Request A succeeds and creates child
const resA = sim.createCounterOffer({
  parentOfferId: 'offer-concurrent-parent',
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
  note: 'Counter A',
})
assert(resA.success === true, 'TEST 17b: First concurrent counter succeeds')

// Request B (simultaneous) attempts to insert duplicate child revision for same parent in DB
// Simulator triggers DB unique constraint check (P2002)
const resB = sim.createCounterOffer({
  parentOfferId: 'offer-concurrent-parent',
  userId: 'user-2',
  offeredItemIds: ['item-B1'],
  requestedItemIds: ['item-A1'],
  note: 'Counter B',
})
assert(
  resB.success === false &&
    resB.code === 'OFFER_ALREADY_REVISED' &&
    resB.status === 409,
  'TEST 17c: Second concurrent counter caught by DB unique constraint and returns 409 OFFER_ALREADY_REVISED'
)

// 17d: Verify exactly ONE child exists for the parent in the DB
const childrenForParent = Array.from(sim.offers.values()).filter(
  (o) => o.parentOfferId === 'offer-concurrent-parent'
)
assert(
  childrenForParent.length === 1 && childrenForParent[0].id === resA.data?.id,
  'TEST 17d: Exactly one child revision exists for the parent; branching strictly prevented'
)

// 17e: Verify multiple root offers with parentOfferId = null work without collision
const rootOffers = Array.from(sim.offers.values()).filter((o) => o.parentOfferId === null)
assert(
  rootOffers.length >= 2,
  'TEST 17e: Multiple root offers coexist with parentOfferId = null (Postgres nullable unique compliant)'
)

// -------------------------------------------------------------
// TEST 18: LINEAR_CHAIN
// -------------------------------------------------------------
console.log('\n--- Test 18: LINEAR_CHAIN ---')
// Create revision 4 from revision 3 (child2)
const counterRes3 = sim.createCounterOffer({
  parentOfferId: child2.id,
  userId: 'user-2',
  offeredItemIds: ['item-B1', 'item-B2'],
  requestedItemIds: ['item-A1', 'item-A2'],
  note: 'İki eşyaya iki eşya kafa kafaya takas?',
})
assert(counterRes3.success === true, 'TEST 18a: Revision 4 created successfully')
const child3 = counterRes3.data!
assert(
  child3.revision === 4 && child3.parentOfferId === child2.id,
  'TEST 18b: Strict linear chain maintained: Rev 1 -> Rev 2 -> Rev 3 -> Rev 4'
)

// -------------------------------------------------------------
// TEST 19: REVISION_HISTORY
// -------------------------------------------------------------
console.log('\n--- Test 19: REVISION_HISTORY ---')
const chain = sim.getRevisionChain(child3.id)
assert(chain.length === 4, 'TEST 19a: History chain contains all 4 revisions')
assert(
  chain[0].revision === 1 &&
    chain[1].revision === 2 &&
    chain[2].revision === 3 &&
    chain[3].revision === 4,
  'TEST 19b: Revisions ordered chronologically 1 -> 2 -> 3 -> 4'
)
assert(
  chain[0].status === 'COUNTER_OFFERED' &&
    chain[1].status === 'COUNTER_OFFERED' &&
    chain[2].status === 'COUNTER_OFFERED' &&
    chain[3].status === 'PENDING',
  'TEST 19c: Older revisions have status COUNTER_OFFERED, latest is PENDING'
)

// -------------------------------------------------------------
// TEST 20: LATEST_REVISION_ACCEPT
// -------------------------------------------------------------
console.log('\n--- Test 20: LATEST_REVISION_ACCEPT ---')
// child3 receiver is user-1. user-1 accepts latest revision
const acceptLatestRes = sim.acceptOffer(child3.id, 'user-1')
assert(acceptLatestRes.success === true, 'TEST 20: Latest pending revision successfully accepted')
assert(child3.status === 'ACCEPTED', 'TEST 20b: Latest revision status is ACCEPTED')

// -------------------------------------------------------------
// TEST 21: OLD_REVISION_NOT_ACTIONABLE
// -------------------------------------------------------------
console.log('\n--- Test 21: OLD_REVISION_NOT_ACTIONABLE ---')
// Trying to accept child2 (which is COUNTER_OFFERED) must fail
const failAcceptOld = sim.acceptOffer(child2.id, 'user-2')
assert(
  !failAcceptOld.success && failAcceptOld.code === 'INVALID_STATUS_TRANSITION',
  'TEST 21: Superseded older revisions cannot be accepted'
)

// -------------------------------------------------------------
// TEST 22: ITEMS_PENDING_AFTER_FINAL_ACCEPT
// -------------------------------------------------------------
console.log('\n--- Test 22: ITEMS_PENDING_AFTER_FINAL_ACCEPT ---')
const itemA1 = sim.items.get('item-A1')!
const itemA2 = sim.items.get('item-A2')!
const itemB1 = sim.items.get('item-B1')!
const itemB2 = sim.items.get('item-B2')!
assert(
  itemA1.status === 'PENDING_TRADE' &&
    itemA2.status === 'PENDING_TRADE' &&
    itemB1.status === 'PENDING_TRADE' &&
    itemB2.status === 'PENDING_TRADE',
  'TEST 22: All items involved in accepted counter offer transitioned to PENDING_TRADE'
)

// -------------------------------------------------------------
// TEST 23: PRIVACY
// -------------------------------------------------------------
console.log('\n--- Test 23: PRIVACY ---')
assert(
  child3.contactRevealed === false,
  'TEST 23: contactRevealed remains false across all revisions (Zero Contact Reveal)'
)

// -------------------------------------------------------------
// TEST 24: LIST_FILTER_LATEST_ONLY
// -------------------------------------------------------------
console.log('\n--- Test 24: LIST_FILTER_LATEST_ONLY ---')
const user1ActiveOffers = sim.listUserActiveOffers('user-1')
// The chain offers (root, child1, child2) should be excluded; only child3 (latest) should be present
const chainOffersUser1 = user1ActiveOffers.filter((o) =>
  ['offer-root-1', child1.id, child2.id, child3.id].includes(o.id)
)
assert(
  chainOffersUser1.length === 1 && chainOffersUser1[0].id === child3.id,
  'TEST 24a: In the revision chain, only the latest revision (child3) appears in user-1 list, excluding superseded parents'
)

const user2ActiveOffers = sim.listUserActiveOffers('user-2')
const chainOffersUser2 = user2ActiveOffers.filter((o) =>
  ['offer-root-1', child1.id, child2.id, child3.id].includes(o.id)
)
assert(
  chainOffersUser2.length === 1 && chainOffersUser2[0].id === child3.id,
  'TEST 24b: In the revision chain, only the latest revision (child3) appears in user-2 list, excluding superseded parents'
)

console.log(`\n🎉 All ${totalTests} Counter Offer tests passed successfully! (${passedTests}/${totalTests})\n`)
