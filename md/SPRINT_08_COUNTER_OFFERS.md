# JetSwap Sprint 8 — Structured Counter Offers

## AI AGENT TASK

Implement Sprint 8 only.

Sprint 8 adds structured counter-offer / offer revision capability on top of the existing `TradeOffer` architecture.

Do NOT implement contact reveal, trade completion, reviews, JetTrust, notifications, payments, AI, or Swap Chains.

---

# READ FIRST

Inspect completely:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/sprints/SPRINT_06_REPORT.md
docs/sprints/SPRINT_07_REPORT.md

prisma/schema.prisma

src/lib/offers/
src/lib/messages/

src/app/api/offers/
src/app/offers/
src/components/offers/
src/components/messages/

tests/offers.test.ts
tests/messages.test.ts
```

Search repository for:

```text
COUNTER_OFFERED
TradeOffer
TradeOfferItem
OfferItemRole
ACCEPTED
PENDING
```

Use the actual repository as source of truth.

---

# OBJECTIVE

Support:

```text
Original Offer

A offers:
iPhone

A requests:
Sony Camera

B does not accept exact terms.

B creates structured counter offer:

B requests:
iPhone + AirPods

B offers:
Sony Camera

↓
A reviews new terms
↓
A Accepts / Rejects / Counters again
```

This must be stored structurally, not only discussed in messages.

---

# IMPORTANT DESIGN DECISION

Do NOT mutate historical offer items in place.

A counteroffer must preserve history.

Preferred architecture:

```text
Original TradeOffer
↓
Counter TradeOffer
↓
Counter TradeOffer
↓
Final accepted version
```

Each revision is its own `TradeOffer`.

This preserves:

```text
audit history
who proposed what
when terms changed
```

---

# SCHEMA REVIEW

Current `TradeOffer` does not appear to include parent/revision fields.

Add the minimum relational fields required.

Recommended:

```prisma
parentOfferId String?
parentOffer   TradeOffer? @relation("OfferRevisions", fields: [parentOfferId], references: [id])
counterOffers TradeOffer[] @relation("OfferRevisions")
```

Optional:

```prisma
revision Int @default(1)
```

If `revision` can be derived safely from chain depth, it is optional.

Prefer explicit revision only if useful.

---

# MIGRATION

Create a proper Prisma migration.

Example name:

```text
add_trade_offer_revision_chain
```

Do NOT use `db push` as production migration substitute.

Validate:

```bash
npx prisma validate
npx prisma generate
```

---

# COUNTER OFFER RULE

Only sender or receiver of existing offer may create a counter.

Offer must currently be:

```text
PENDING
```

Do not counter:

```text
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

---

# WHO BECOMES SENDER

Counter offer sender:

```text
current authenticated user
```

Counter offer receiver:

```text
the other participant
```

This means sender/receiver may alternate each revision.

---

# ORIGINAL OFFER STATUS

When a counteroffer is created:

```text
original.status = COUNTER_OFFERED
```

New offer:

```text
new.status = PENDING
```

The new offer becomes the active actionable revision.

---

# IMPORTANT

Do not modify original offer's:

```text
TradeOfferItem rows
note
senderId
receiverId
```

Historical offer remains immutable except status transition.

---

# COUNTER API

Create:

```text
POST /api/offers/[id]/counter
```

Suggested body:

```json
{
  "offeredItemIds": ["..."],
  "requestedItemIds": ["..."],
  "note": "Bu şekilde takas edebiliriz."
}
```

---

# AUTHORIZATION

Authenticated user must be:

```text
offer.senderId
or
offer.receiverId
```

Otherwise:

```text
403
```

---

# COUNTER ITEM OWNERSHIP

This is critical.

The user creating the counter may only place their own AVAILABLE items under:

```text
OFFERED
```

The other user's AVAILABLE items may only appear under:

```text
REQUESTED
```

Ownership must be re-derived server-side.

Do not trust roles supplied by frontend.

---

# ITEM STATUS

Countering a PENDING offer does NOT reserve items.

All involved items remain:

```text
AVAILABLE
```

until a revision is ACCEPTED.

---

# COUNTER VALIDATION

Reuse Sprint 6 validation rules:

```text
AVAILABLE only
self-offer prevention
single counterparty
duplicate item prevention
cash note filtering
```

Do not duplicate validators unnecessarily.

---

# DUPLICATE COUNTER

Do not allow two active PENDING revisions from the same parent offer.

Once a counter is created:

parent becomes:

```text
COUNTER_OFFERED
```

and cannot be countered again.

Only the newest PENDING revision may be acted upon.

---

# OFFER CHAIN

The offer detail response should expose revision chain metadata.

Suggested:

```json
{
  "id": "...",
  "status": "PENDING",
  "parentOfferId": "...",
  "revision": 3,
  "history": [
    {
      "id": "...",
      "revision": 1,
      "status": "COUNTER_OFFERED"
    },
    {
      "id": "...",
      "revision": 2,
      "status": "COUNTER_OFFERED"
    },
    {
      "id": "...",
      "revision": 3,
      "status": "PENDING"
    }
  ]
}
```

Do not expose private contact info.

---

# ACCEPTANCE

Existing accept behavior should work on latest PENDING revision.

On accept:

```text
latest revision → ACCEPTED
participating items → PENDING_TRADE
```

Earlier revisions remain:

```text
COUNTER_OFFERED
```

Do not retroactively mark them ACCEPTED.

---

# REJECT

Receiver of latest PENDING revision may reject it:

```text
PENDING → REJECTED
```

Earlier history remains unchanged.

---

# CANCEL

Sender of latest PENDING revision may cancel:

```text
PENDING → CANCELLED
```

Earlier history remains unchanged.

---

# NO REVIVAL

Do not automatically reactivate an older offer after:

```text
REJECTED
CANCELLED
```

If users want new terms, they create a fresh offer.

---

# COUNTER UI

On `/offers/[id]` for PENDING offer, show:

```text
Karşı Teklif Yap
```

for both participants where appropriate.

The current receiver can naturally counter instead of accept/reject.

The sender may also create a new revision only if business rules allow both sides to counter; preferred V1:

```text
Both participants may counter a PENDING offer.
```

Document this.

---

# COUNTER MODAL

Reuse `CreateOfferModal` patterns where possible.

Create:

```text
CounterOfferModal
```

or refactor shared selector UI.

Display:

```text
Yeni Takas Şartları

Sen veriyorsun:
[ own AVAILABLE items ]

Karşı taraftan istiyorsun:
[ counterparty AVAILABLE items ]

Not:
[ textarea ]

[ Vazgeç ]
[ Karşı Teklifi Gönder ]
```

---

# PREFILL

Pre-fill existing terms from current offer where ownership still makes sense.

This allows user to make small changes instead of rebuilding from scratch.

Example:

```text
Current:
iPhone ↔ Camera

Counter:
iPhone + AirPods ↔ Camera
```

---

# ZERO CASH RULE

Counter note must pass:

```text
detectCashKeywords
```

Block:

```text
+ 500 TL
nakit fark
havale
para eklerim
```

---

# CONTACT PRIVACY

Counter note must also pass contact privacy filter:

```text
detectContactInfo
```

because `contactRevealed` is still false.

Do not allow users to hide phone/email inside counter note.

---

# MESSAGES

Messaging remains tied to each `TradeOffer`.

Preferred Sprint 8 behavior:

New counter revision starts a new message scope because it is a new `TradeOffer`.

However, UI should make revision history navigable.

Do NOT copy old `TradeMessage` rows into new offer.

Historical messages remain attached to historical revision.

---

# REVISION HISTORY UI

Add:

```text
Teklif Geçmişi
```

Example:

```text
Teklif #1
Gönderen: Selim
Durum: Karşı Teklif Yapıldı

Teklif #2
Gönderen: Ahmet
Durum: Karşı Teklif Yapıldı

Teklif #3
Gönderen: Selim
Durum: Bekliyor
```

Clicking older revision may open its detail page.

---

# STATUS LABEL

`COUNTER_OFFERED` user-facing:

```text
Karşı Teklif Yapıldı
```

This status means:

```text
This revision is no longer active.
A newer revision exists.
```

---

# OFFER LIST

For `/offers`:

Do not flood list with every historical revision as separate top-level unrelated entries.

Preferred:

Show latest revision per chain.

Optionally display:

```text
3 revizyon
```

or:

```text
Karşı teklif zinciri
```

Historical revisions accessed from detail.

---

# ROOT OFFER

Define root:

```text
parentOfferId == null
```

Chain:

```text
root
→ child
→ child
```

Avoid branching trees in Sprint 8.

Only one active child per revision.

---

# NO BRANCHING

Do not allow:

```text
parent
├── counter A
└── counter B
```

Require linear revision chain.

This keeps state deterministic.

---

# CONCURRENCY

Counter creation must be transactional.

Inside transaction:

1. re-read parent offer
2. verify still `PENDING`
3. verify no child already exists
4. validate items still AVAILABLE
5. set parent `COUNTER_OFFERED`
6. create child offer + items

Atomic.

---

# RACE CONDITION

If two counter requests happen simultaneously:

only one should succeed.

The other should return conflict.

Suggested:

```text
409 OFFER_ALREADY_REVISED
```

---

# API ERROR CODES

Recommended:

```text
OFFER_NOT_PENDING
OFFER_ALREADY_REVISED
INVALID_COUNTER_ITEMS
ITEM_UNAVAILABLE
FORBIDDEN
CASH_NEGOTIATION_BLOCKED
CONTACT_INFO_BLOCKED
```

---

# TESTS

Create:

```text
tests/counter-offers.test.ts
```

Minimum coverage:

```text
CREATE_COUNTER_VALID
PARENT_BECOMES_COUNTER_OFFERED
CHILD_IS_PENDING
PARENT_ITEMS_IMMUTABLE
SENDER_ALTERNATION
RECEIVER_DERIVATION
OFFERED_ITEM_OWNERSHIP
REQUESTED_ITEM_OWNERSHIP
UNAVAILABLE_ITEM
SELF_OFFER
CASH_BLOCK
CONTACT_BLOCK
NON_PARTICIPANT_FORBIDDEN
COUNTER_ACCEPTED_FORBIDDEN
COUNTER_REJECTED_FORBIDDEN
COUNTER_CANCELLED_FORBIDDEN
DUPLICATE_CHILD_BLOCKED
LINEAR_CHAIN
REVISION_HISTORY
LATEST_REVISION_ACCEPT
OLD_REVISION_NOT_ACTIONABLE
ITEMS_PENDING_AFTER_FINAL_ACCEPT
PRIVACY
```

---

# REGRESSION

Run:

```text
tests/messages.test.ts
tests/offers.test.ts
tests/jetmatch.test.ts
```

No regressions.

---

# DATABASE

Expected schema change:

```text
TradeOffer parent relation
```

Create migration.

Do not redesign existing tables.

---

# NO CONTACT REVEAL

Still:

```text
contactRevealed = false
```

Do not reveal:

```text
phone
email
social contact
```

---

# NO COMPLETION

Do not implement:

```text
COMPLETED
TRADED
completedAt
```

---

# NO REVIEWS

Do not implement review flow.

---

# NO NOTIFICATIONS

Do not implement email/push/in-app notification system yet.

---

# ACCEPTANCE CRITERIA

Sprint 8 is complete only if:

- structured counter offers exist
- old offers remain immutable
- parent-child revision relationship exists
- parent becomes COUNTER_OFFERED
- child becomes PENDING
- only participants may counter
- ownership rules are server validated
- zero-cash rules still apply
- contact privacy rules still apply
- linear revision chain enforced
- duplicate child creation blocked
- latest revision is actionable
- historical revisions are read-only
- offer history UI exists
- `/offers` does not become cluttered with revisions
- final accepted revision reserves items
- messages remain revision-scoped
- migration exists
- counter tests pass
- Sprint 7 message tests pass
- Sprint 6 offer tests pass
- JetMatch tests pass
- TypeScript passes
- lint passes
- build passes
- Prisma validates

---

# FINAL VALIDATION

Run:

```bash
npx tsx tests/counter-offers.test.ts
npx tsx tests/messages.test.ts
npx tsx tests/offers.test.ts
npx tsx tests/jetmatch.test.ts

npx tsc --noEmit
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

---

# REPORT

Create:

```text
docs/sprints/SPRINT_08_REPORT.md
```

Include:

```text
Completed
Architecture
Schema Changes
Migration
Modified Files
New Files
API Routes
Counter Offer State Machine
Revision Chain
UI
Privacy
Zero Cash
Concurrency
Tests
Known Limitations
Git Status
```

---

# FINAL RULE

Do not start Sprint 9.

Do not implement contact reveal.

Do not implement completion.

Do not commit/push unless explicitly instructed by user.

Report and stop.