# JetSwap Sprint 6 — Real Trade Offers

## AI AGENT TASK

Implement Sprint 6 only.

Sprint 6 creates the first real barter offer workflow using the existing Prisma models:

```text
TradeOffer
TradeOfferItem
TradeOfferStatus
OfferItemRole
```

Do NOT replace these models with JSON arrays or a second offer architecture.

Do NOT implement messaging, contact reveal, trade completion, reviews, JetTrust, notifications, payments, AI, or Swap Chains.

---

# READ FIRST

Inspect:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/sprints/SPRINT_05_REPORT.md
docs/JETMATCH_V1_SCORING.md

prisma/schema.prisma

src/app/jetmatch/
src/components/jetmatch/
src/app/api/jetmatch/

src/app/items/
src/app/profile/items/

src/lib/auth*
src/lib/require-user*
src/lib/prisma*
```

Search repository for:

```text
TradeOffer
TradeOfferItem
OfferItemRole
TradeOfferStatus
```

If no offer implementation exists, build on the existing Prisma schema.

Do not create duplicate business logic.

---

# OBJECTIVE

Enable:

```text
User A
owns Item A
↓
JetMatch finds Item B
owned by User B
↓
A clicks "Takas Teklifi Gönder"
↓
A confirms what they offer
and what they request
↓
TradeOffer created
↓
User B sees incoming offer
↓
B can Accept or Reject
```

Sprint 6 ends here.

Do NOT open contact details yet.

---

# EXISTING SCHEMA

Use the existing structure:

```prisma
model TradeOffer {
  id
  senderId
  receiverId
  status
  note
  contactRevealed
  contactRevealedAt
  completedAt
  createdAt
  updatedAt
  items TradeOfferItem[]
}

model TradeOfferItem {
  id
  offerId
  itemId
  role OfferItemRole
}
```

Roles:

```text
OFFERED
REQUESTED
```

Meaning:

```text
OFFERED
= sender gives this item

REQUESTED
= sender wants this item from receiver
```

Do not invert these meanings.

---

# SPRINT 6 SCOPE

Implement:

```text
Create offer
List sent offers
List received offers
Offer detail
Accept offer
Reject offer
Cancel own pending offer
JetMatch CTA integration
Item detail CTA integration
Offer status UI
Ownership/security rules
```

Do NOT implement:

```text
messaging
counter-offer flow
contact reveal
completion
reviews
notifications
```

`COUNTER_OFFERED`, `COMPLETED` enum values already exist but must not be fully implemented in Sprint 6.

---

# OFFER CREATION RULE

Minimum V1 offer:

```text
1 OFFERED Item
1 REQUESTED Item
```

Example:

```text
A gives:
iPhone

A requests:
Sony Camera
```

Database:

```text
TradeOffer
senderId = A
receiverId = B

TradeOfferItem:
iPhone
role = OFFERED

TradeOfferItem:
Sony Camera
role = REQUESTED
```

---

# MULTI-ITEM ARCHITECTURE

The schema already supports future:

```text
1 ↔ 2
2 ↔ 1
2 ↔ 3
```

Do not redesign it.

However Sprint 6 UI may begin with:

```text
1 OFFERED
1 REQUESTED
```

for simplicity.

The API/service should be designed so adding multiple item IDs later is straightforward.

---

# SECURITY — SERVER IS SOURCE OF TRUTH

Never trust:

```text
senderId
receiverId
```

from frontend.

Determine:

```text
senderId
```

from authenticated session.

Determine:

```text
receiverId
```

from ownership of REQUESTED item.

---

# CREATE OFFER API

Create:

```text
POST /api/offers
```

Suggested input:

```json
{
  "offeredItemIds": ["item-a"],
  "requestedItemIds": ["item-b"],
  "note": "İstersen İstanbul içinde elden takas yapabiliriz."
}
```

Do not accept:

```text
senderId
receiverId
status
contactRevealed
```

from client.

---

# VALIDATION — OFFERED ITEMS

Each OFFERED item must:

```text
exist
belong to authenticated sender
status = AVAILABLE
```

Sender cannot offer:

```text
another user's item
ARCHIVED
TRADED
PENDING_TRADE
```

---

# VALIDATION — REQUESTED ITEMS

Each REQUESTED item must:

```text
exist
belong to another user
status = AVAILABLE
```

All requested items in one offer must belong to the same receiver for Sprint 6.

Do not allow one offer involving requested items from multiple users.

---

# SELF-OFFER PREVENTION

Never allow:

```text
senderId === receiverId
```

Return validation error.

---

# EMPTY OFFER PREVENTION

Require:

```text
>= 1 OFFERED
>= 1 REQUESTED
```

For Sprint 6 UI:

prefer exactly:

```text
1 offered
1 requested
```

but service architecture may support arrays.

---

# DUPLICATE ITEM PREVENTION

An item must not appear twice in the same offer.

Also prevent:

```text
same item in OFFERED and REQUESTED
```

---

# DUPLICATE ACTIVE OFFER

Prevent accidental duplicate active offers.

If same sender already has a:

```text
PENDING
```

offer with same OFFERED and REQUESTED item pair:

do not create another.

Return a meaningful response such as:

```text
Bu ürünler için zaten bekleyen bir teklifin var.
```

---

# MONEY RULE

Offer note must be checked using existing cash keyword detection.

Block notes containing monetary bargaining such as:

```text
+ 500 TL
üzerine para
nakit fark
para eklerim
```

Reuse existing:

```text
detectCashKeywords
```

or equivalent.

Do not create a second cash-filter implementation.

---

# NOTE VALIDATION

Suggested:

```text
optional
max 1000 characters
```

Trim input.

Empty trimmed note becomes null.

---

# CREATE TRANSACTION

Use a Prisma transaction.

Create:

```text
TradeOffer
+
TradeOfferItem OFFERED rows
+
TradeOfferItem REQUESTED rows
```

atomically.

If any write fails:

no partial offer should remain.

---

# ITEM STATUS DURING PENDING

Important:

Do NOT immediately change Item status to:

```text
PENDING_TRADE
```

when an offer is merely created.

Reason:

One AVAILABLE item may receive multiple competing offers.

Keep items AVAILABLE while offers are PENDING.

---

# OFFER ACCEPTANCE

Create:

```text
POST /api/offers/[id]/accept
```

or PATCH equivalent according to repo conventions.

Only:

```text
receiver
```

may accept.

Offer must currently be:

```text
PENDING
```

---

# ACCEPT VALIDATION

Before accepting, revalidate all items.

OFFERED items:

```text
still belong to sender
still AVAILABLE
```

REQUESTED items:

```text
still belong to receiver
still AVAILABLE
```

If any item is unavailable:

do not accept.

Return:

```text
Bu teklif artık geçerli değil; ürünlerden biri takasa açık değil.
```

---

# ACCEPT TRANSACTION

On successful acceptance:

```text
TradeOffer.status = ACCEPTED
```

And all items participating in this accepted offer become:

```text
PENDING_TRADE
```

Use one transaction.

This reserves them for the next stage.

---

# IMPORTANT — OTHER PENDING OFFERS

When Item A or Item B becomes reserved by an accepted offer:

other PENDING offers involving any of those same items can no longer be accepted.

Preferred Sprint 6 behavior:

either:

```text
automatically CANCEL those conflicting pending offers
```

or:

```text
keep them PENDING but validation prevents acceptance
```

Preferred:

Automatically cancel conflicting pending offers in the same transaction if implementation is clean and safe.

Document behavior.

Do not silently leave misleading actionable offers if easy to avoid.

---

# NO CONTACT REVEAL YET

Existing schema contains:

```text
contactRevealed
contactRevealedAt
```

Do NOT set:

```text
contactRevealed = true
```

in Sprint 6.

Even after:

```text
status = ACCEPTED
```

contact details remain hidden.

Contact reveal belongs to a later controlled stage.

---

# REJECT OFFER

Create:

```text
POST /api/offers/[id]/reject
```

Only receiver may reject.

Allowed:

```text
PENDING → REJECTED
```

Rejecting does not alter Item status.

---

# CANCEL OFFER

Create:

```text
POST /api/offers/[id]/cancel
```

Only sender may cancel.

Allowed:

```text
PENDING → CANCELLED
```

Do not allow cancel after ACCEPTED in Sprint 6.

---

# STATUS TRANSITIONS

Sprint 6 supports:

```text
PENDING → ACCEPTED
PENDING → REJECTED
PENDING → CANCELLED
```

Do not implement:

```text
COUNTER_OFFERED
COMPLETED
```

yet.

Reject illegal transitions.

Example:

```text
REJECTED → ACCEPTED
```

must fail.

---

# LIST OFFERS API

Create:

```text
GET /api/offers
```

Authenticated.

Recommended filters:

```text
?type=received
?type=sent
```

Optional:

```text
?status=PENDING
```

Return only offers where user is:

```text
sender
or
receiver
```

---

# OFFER DETAIL API

Create:

```text
GET /api/offers/[id]
```

Only sender or receiver may view.

Other users:

```text
403
```

---

# SAFE SELECTS

Include only necessary public user fields.

Never expose:

```text
password
email
phone
```

during Sprint 6.

---

# OFFER RESPONSE SHAPE

Example:

```json
{
  "id": "...",
  "status": "PENDING",
  "sender": {
    "id": "...",
    "name": "Selim",
    "avatar": "..."
  },
  "receiver": {
    "id": "...",
    "name": "Ahmet",
    "avatar": "..."
  },
  "offeredItems": [
    {
      "id": "...",
      "title": "iPhone 15 Pro",
      "images": []
    }
  ],
  "requestedItems": [
    {
      "id": "...",
      "title": "Sony A7 III",
      "images": []
    }
  ],
  "note": "...",
  "createdAt": "..."
}
```

Do not return raw relational rows if a cleaner API shape is practical.

---

# DOMAIN SERVICE

Do not put all business rules directly inside API route files.

Recommended:

```text
src/lib/offers/
```

Possible:

```text
types.ts
validation.ts
queries.ts
service.ts
transitions.ts
serialization.ts
index.ts
```

Keep architecture understandable.

---

# OFFER CREATION UI

Enable existing JetMatch button:

```text
Takas Teklifi Gönder
```

It should no longer say:

```text
Yakında
```

Open a modal or dedicated screen.

Recommended V1:

```text
Offer Modal
```

---

# JETMATCH PRE-FILL

From a JetMatch match:

```text
sourceItem
candidateItem
```

preselect:

```text
sourceItem = OFFERED
candidateItem = REQUESTED
```

User should see clearly:

```text
Sen veriyorsun
↓
iPhone 15 Pro

Sen istiyorsun
↓
Sony A7 III
```

---

# CONFIRMATION COPY

Example:

```text
Takas Teklifini Gönder

Senin vereceğin:
iPhone 15 Pro

Karşı taraftan istediğin:
Sony A7 III

Notun:
[ textarea ]

[ Vazgeç ]
[ Teklifi Gönder ]
```

Do not use pricing language.

---

# SEND SUCCESS STATE

After successful creation:

show:

```text
Takas teklifin gönderildi.
```

Possible CTA:

```text
Tekliflerime Git
```

Do not claim receiver accepted.

---

# OFFERS PAGE

Create:

```text
/offers
```

Authenticated.

Tabs:

```text
Gelen Teklifler
Gönderdiğim Teklifler
```

Optional status filter.

---

# INCOMING OFFER CARD

Show:

```text
sender
what they offer
what they request
note
status
date
```

For PENDING:

```text
[ Kabul Et ]
[ Reddet ]
```

---

# SENT OFFER CARD

Show:

```text
what I offered
what I requested
receiver
status
date
```

For PENDING:

```text
[ Teklifi İptal Et ]
```

---

# OFFER DETAIL PAGE

Create:

```text
/offers/[id]
```

Show exchange visually:

```text
Senin eşyan
↕
Karşı tarafın eşyası
```

Adjust labels depending sender/receiver perspective.

---

# STATUS LABELS

User-facing Turkish:

```text
PENDING
Bekliyor

ACCEPTED
Kabul Edildi

REJECTED
Reddedildi

CANCELLED
İptal Edildi

COUNTER_OFFERED
Karşı Teklif

COMPLETED
Tamamlandı
```

Sprint 6 only activates first four.

---

# ACCEPT CONFIRMATION

Do not accept accidentally with one click if current UX patterns use confirmations.

Use confirmation dialog:

```text
Bu takas teklifini kabul etmek istiyor musun?

Kabul ettiğinde iki tarafın ilgili eşyaları takas süreci için rezerve edilir.
```

Do not mention contact reveal yet.

---

# REJECT CONFIRMATION

Simple confirmation optional.

Avoid accidental rejection.

---

# CANCEL CONFIRMATION

Explain:

```text
Teklifi iptal ettiğinde karşı taraf artık bu teklifi kabul edemez.
```

---

# ITEM DETAIL INTEGRATION

On another user's AVAILABLE Item detail:

if authenticated user owns at least one AVAILABLE Item:

allow:

```text
Takas Teklifi Gönder
```

User selects which own Item to offer.

This can reuse Offer Modal.

Do not require JetMatch to create an offer.

JetMatch is recommendation, not mandatory gateway.

---

# OFFER ITEM SELECTOR

When starting from non-JetMatch Item detail:

show user's AVAILABLE items.

Example:

```text
Hangi eşyanı teklif etmek istiyorsun?
```

Only own AVAILABLE items.

---

# SELF ITEM PAGE

Do not show:

```text
Takas Teklifi Gönder
```

on user's own item.

---

# NAVIGATION

Add:

```text
Teklifler
```

to authenticated user navigation.

Reuse existing nav system.

Do not overcrowd unauthenticated navbar.

---

# BADGES / COUNTS

Do NOT implement real-time unread notification badges unless existing infrastructure already supports them.

Static navigation link is enough.

Notifications belong later.

---

# ITEM STATUS UI

When offer ACCEPTED and Item becomes:

```text
PENDING_TRADE
```

portfolio should display current existing status label appropriately.

Do not let user archive/reactivate a PENDING_TRADE item through normal Item actions unless existing business rules explicitly support it.

---

# CONFLICT SAFETY

Critical race condition:

Two receivers/senders may act close together.

Offer acceptance must be transaction-safe.

At minimum re-read relevant items inside transaction before accepting.

Do not rely only on frontend state.

---

# AUTHORIZATION MATRIX

## Create

Authenticated user only.

## View offer

Sender or receiver only.

## Accept

Receiver only.

## Reject

Receiver only.

## Cancel

Sender only.

Any unauthorized action:

```text
403
```

Unauthenticated:

```text
401
```

---

# VALIDATION TESTS

Test:

### Create valid 1↔1

Expected:

```text
TradeOffer PENDING
2 TradeOfferItem rows
```

---

### Offer other user's item as OFFERED

Expected:

```text
403 or validation error
```

---

### Request own item

Expected:

```text
rejected
```

---

### Request unavailable item

Expected:

```text
rejected
```

---

### Offer unavailable item

Expected:

```text
rejected
```

---

### Duplicate active offer

Expected:

```text
blocked
```

---

### Cash note

Expected:

```text
422
```

or existing cash-rule status convention.

---

### Accept as sender

Expected:

```text
403
```

---

### Reject as sender

Expected:

```text
403
```

---

### Cancel as receiver

Expected:

```text
403
```

---

### Accept as receiver

Expected:

```text
status = ACCEPTED
participating Item.status = PENDING_TRADE
```

---

### Reject

Expected:

```text
status = REJECTED
items remain AVAILABLE
```

---

### Cancel

Expected:

```text
status = CANCELLED
items remain AVAILABLE
```

---

### Accept already rejected

Expected:

```text
invalid transition
```

---

### Accept conflicting offer

If an item has already become PENDING_TRADE:

Expected:

```text
rejected
```

---

# PRIVACY TEST

Offer API must not leak:

```text
email
phone
password
```

before later contact-reveal stage.

---

# CASH RULE TEST

Examples to block:

```text
500 TL eklerim
üzerine 2000 lira
nakit fark veririm
para ekleyebilirim
```

Do not over-block innocent text if existing filter handles context.

Reuse existing implementation.

---

# DATABASE CHANGES

Prefer:

```text
0 Prisma schema changes
0 migrations
```

Existing schema is already adequate.

If indexes are truly needed for offer queries, document why before modifying schema.

Do not redesign tables.

---

# POSSIBLE INDEXES

Only if performance need is clear:

```text
TradeOffer.senderId
TradeOffer.receiverId
TradeOffer.status
TradeOfferItem.offerId
TradeOfferItem.itemId
```

But do not add unnecessary migration for premature optimization.

---

# NO CONTACT REVEAL

Very important:

Sprint 6 must NOT:

```text
show phone
show email
set contactRevealed = true
```

Even after ACCEPTED.

Contact reveal will have its own explicit workflow later.

---

# NO MESSAGING

Do not build:

```text
TradeMessage UI
POST message
chat
websocket
polling
```

Sprint 7.

---

# NO COUNTER OFFER

Even though enum exists:

```text
COUNTER_OFFERED
```

Do not implement counteroffers in Sprint 6.

We will design them carefully in a later offer/negotiation sprint.

---

# NO COMPLETION

Do not set:

```text
COMPLETED
TRADED
completedAt
```

in Sprint 6.

Accepted means:

```text
negotiation/takas süreci başladı
```

not completed.

---

# FILE ORGANIZATION

Recommended:

```text
src/lib/offers/
  types.ts
  validation.ts
  service.ts
  serialization.ts
  transitions.ts
  index.ts

src/app/api/offers/route.ts
src/app/api/offers/[id]/route.ts
src/app/api/offers/[id]/accept/route.ts
src/app/api/offers/[id]/reject/route.ts
src/app/api/offers/[id]/cancel/route.ts

src/app/offers/page.tsx
src/app/offers/[id]/page.tsx

src/components/offers/
  create-offer-modal.tsx
  offer-card.tsx
  offer-status-badge.tsx
  offer-exchange-view.tsx
```

Adapt to existing conventions.

---

# JETMATCH INTEGRATION

Update:

```text
src/components/jetmatch/match-card.tsx
```

Current disabled:

```text
Takas Teklifi Gönder
Yakında
```

becomes real:

```text
Takas Teklifi Gönder
```

Pass:

```text
sourceItemId
candidateItemId
```

to Offer Modal.

Do not pass user IDs from UI as authority.

---

# UX — PREVENT DOUBLE SUBMIT

Offer create button must:

```text
disable while submitting
show loading
prevent double requests
```

Handle duplicate request server-side too.

---

# API ERRORS

User-facing examples:

```text
Bu ürün artık takasa açık değil.
Bu teklif zaten mevcut.
Teklif gönderilemedi. Tekrar deneyebilirsin.
Notunda nakit/para teklifi kullanamazsın.
```

Never expose raw Prisma errors.

---

# ACCESSIBILITY

Modal/page:

```text
keyboard accessible
focus managed
buttons labeled
status not represented by color alone
```

---

# MOBILE

Offer UI must work at:

```text
375px
768px
desktop
```

No horizontal overflow.

---

# FINAL VALIDATION

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
npx prisma validate
npx tsx tests/jetmatch.test.ts
```

Create dedicated offer tests:

```text
tests/offers.test.ts
```

Cover at least:

```text
CREATE_VALID
CREATE_UNAUTHENTICATED
OWNERSHIP
SELF_OFFER
UNAVAILABLE_ITEM
DUPLICATE_OFFER
CASH_NOTE
LIST_SENT
LIST_RECEIVED
DETAIL_AUTHORIZATION
ACCEPT
ACCEPT_FORBIDDEN
REJECT
REJECT_FORBIDDEN
CANCEL
CANCEL_FORBIDDEN
INVALID_TRANSITION
CONFLICTING_ACCEPT
PRIVACY
```

---

# ACCEPTANCE CRITERIA

Sprint 6 is complete only if:

- real TradeOffer records are created
- TradeOfferItem relations are used
- OFFERED/REQUESTED roles are correct
- sender is derived from session
- receiver is derived from requested Item owner
- only AVAILABLE items may be used
- self-offers are blocked
- duplicate active offers are blocked
- cash notes are blocked
- offer creation is transactional
- received offers can be listed
- sent offers can be listed
- sender/receiver can view detail
- unrelated users cannot view
- receiver can accept
- receiver can reject
- sender can cancel pending
- invalid transitions are rejected
- accepted items become PENDING_TRADE
- rejected/cancelled items stay AVAILABLE
- contact information remains hidden
- JetMatch CTA creates real offer
- another user's Item detail can start offer
- `/offers` exists
- `/offers/[id]` exists
- navigation includes Teklifler
- no messaging implemented
- no contact reveal implemented
- no counteroffer implemented
- no completion implemented
- no unnecessary Prisma redesign
- TypeScript passes
- lint passes
- build passes
- Prisma validates
- JetMatch tests still pass
- Offer tests pass

---

# REPORT

Create:

```text
docs/sprints/SPRINT_06_REPORT.md
```

Include:

```text
Completed
Architecture
Modified Files
New Files
API Routes
Offer State Machine
Security Rules
Item Status Behavior
JetMatch Integration
UI
Database Changes
Tests
Known Limitations
Git Status
```

---

# FINAL RULE

Do not start Sprint 7.

Do not implement messaging.

Do not reveal contact information.

Do not commit/push unless explicitly instructed by user.

Report and stop.