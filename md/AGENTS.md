# JetSwap – AI Coding Agent Instructions

## Project

JetSwap is a money-free product exchange platform.

Main brand promise:

> Para Yok. Takas Var.

The platform must never evolve into a traditional buy/sell marketplace.

Users list items they own, define what they want in exchange, receive intelligent swap matches, negotiate swap offers, communicate, complete swaps, and build reputation.

Core product flow:

```text
HAVE
↓
WANT
↓
MATCH
↓
OFFER
↓
SWAP
↓
TRUST
```

---

# 1. IMPORTANT DEVELOPMENT RULES

Before modifying any code:

1. Read this file completely.
2. Inspect the existing repository structure.
3. Inspect `prisma/schema.prisma`.
4. Inspect existing API routes.
5. Inspect existing frontend pages related to the feature.
6. Reuse existing architecture where reasonable.
7. Do not replace working functionality without a clear reason.
8. Do not perform large unrelated refactors.
9. Keep each change focused on the current sprint.
10. Preserve production compatibility.

Never assume a feature is implemented just because a Prisma model exists.

Always verify:

- database model
- API
- service/business logic
- frontend
- authorization
- validation
- error handling

independently.

---

# 2. CURRENT TECHNOLOGY STACK

Use the existing stack.

```text
Next.js 16
React 19
TypeScript
PostgreSQL
Prisma 7
NextAuth
Tailwind CSS 4
bcryptjs
```

Do not replace the stack unless explicitly requested.

Do not introduce another ORM.

Use Prisma for database access.

---

# 3. DATABASE

Database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

Primary schema:

```text
prisma/schema.prisma
```

All schema modifications must be intentional.

Before modifying Prisma models:

1. inspect existing relations
2. check delete behavior
3. check unique constraints
4. check indexes
5. consider migration compatibility

Do not delete existing production data structures without explicit instruction.

Prefer additive migrations.

---

# 4. SECURITY

Security is mandatory.

Never:

- trust client-supplied user IDs
- store plaintext passwords
- expose passwords
- log credentials
- expose private contact details prematurely
- allow users to modify other users' resources
- trust ownership fields sent by the frontend

Always get authenticated user identity from the server session.

Example:

```text
session.user.id
```

Never accept:

```text
userId
ownerId
senderId
```

from the browser when the server can derive it from the authenticated session.

---

# 5. PASSWORDS

Passwords must use `bcryptjs`.

Registration:

```text
plain password
↓
bcrypt hash
↓
database
```

Login:

```text
submitted password
↓
bcrypt.compare()
↓
stored hash
```

Never log passwords.

Never return password hashes to the frontend.

---

# 6. AUTHORIZATION

Every protected operation must verify:

```text
authenticated user
+
resource ownership or explicit permission
```

For example, a user may edit a product only when:

```text
product.userId === session.user.id
```

---

# 7. MONEY-FREE RULE

JetSwap must not become a sales platform.

Do not add:

- product prices
- Buy buttons
- checkout
- payment gateway
- currency values
- shopping cart
- payment offers

unless explicitly requested for a future JetSwap service fee feature.

Items are exchanged for other items or, later, services.

---

# 8. CORE DOMAIN LANGUAGE

Use consistent terms.

### HAVE

A product owned by the user.

Database entity:

```text
Product
```

### WANT

What the owner wants in exchange for a specific product.

Preferred entity:

```text
ProductWant
```

### MATCH

A possible exchange discovered by JetMatch.

### MUTUAL MATCH

User A wants something User B has and User B wants something User A has.

### ONE-WAY MATCH

One side's WANT matches the other side, but the second party is open to alternative offers.

### OFFER

A concrete swap proposal.

### SWAP

A completed accepted exchange.

### JETTRUST

User reputation and platform trust score.

---

# 9. IMPORTANT DATA MODEL PRINCIPLE

WANT preferences must be product-specific.

Incorrect architecture:

```text
User
└── SwapPreference
```

as the sole WANT mechanism.

Correct architecture:

```text
User
└── Product
    └── ProductWant[]
```

Example:

```text
User owns:
- iPhone
- Bicycle

iPhone WANT:
- MacBook
- Camera

Bicycle WANT:
- PlayStation
```

These preferences must remain independent.

---

# 10. PRODUCTWANT TARGET MODEL

Preferred conceptual structure:

```text
ProductWant
- id
- productId
- categoryId?
- subcategoryId?
- brandId?
- modelName?
- keywords?
- minimumCondition?
- country?
- region?
- city?
- maxDistance?
- priority
- createdAt
- updatedAt
```

A Product can have many ProductWant records.

Avoid putting all WANT information inside an unstructured JSON field when relational queries will be required by JetMatch.

---

# 11. TRADE OFFER ARCHITECTURE

Avoid long-term reliance on JSON arrays such as:

```text
offeredProductIds
requestedProductIds
```

Preferred relational architecture:

```text
TradeOffer
└── TradeOfferItem[]
```

Suggested structure:

```text
TradeOfferItem
- id
- tradeOfferId
- productId
- side
```

Side:

```text
OFFERED
REQUESTED
```

This must support:

```text
1 ↔ 1
1 ↔ 2
2 ↔ 1
2 ↔ 3
```

---

# 12. JETMATCH V1

Do not build an unnecessarily complex AI system first.

JetMatch V1 should be deterministic and explainable.

Suggested inputs:

```text
mutual WANT match
category
subcategory
brand
model
condition
location
distance
JetTrust
openToOtherOffers
```

Suggested initial score:

```text
Mutual WANT match       40
Category                15
Brand                   10
Model                   10
Condition                5
Location                10
Distance                 5
JetTrust                 5
---------------------------
TOTAL                  100
```

This scoring can later evolve.

---

# 13. MATCH LABELS

Suggested UX:

```text
90–100
Mükemmel Takas

75–89
Güçlü Eşleşme

60–74
Uygun Takas

Below 60
Keşfet
```

A match result should explain itself.

Example:

```text
%94 Mükemmel Takas

✓ Sen fotoğraf makinesi arıyorsun
✓ Ahmet iPhone arıyor
✓ Aynı şehirdesiniz
✓ Ürün durumları uyumlu
```

Do not show unexplained arbitrary percentages.

---

# 14. JETMATCH TYPES

Support these concepts:

```text
MUTUAL
ONE_WAY
```

`CHAIN` exists conceptually but must NOT be implemented during early MVP work unless explicitly requested.

Multi-party swap chains belong to a later phase.

---

# 15. PRODUCT CREATION

Existing multi-step product creation UI should be preserved unless there is a concrete usability reason to change it.

Desired flow:

```text
Category
↓
Details
↓
Images
↓
Location
↓
What do you want?
↓
Preview
↓
Publish
```

Temporary wizard state may use client state/localStorage.

Final submission must persist all relevant information in PostgreSQL.

---

# 16. IMAGE STORAGE

Do not store large image binaries directly in PostgreSQL.

Use an external/file storage abstraction.

The database should store image URLs and metadata.

If no production storage provider exists yet, create a clean abstraction so storage can later be switched.

Do not hard-code a specific third-party provider throughout the application.

---

# 17. CONTACT PRIVACY

Personal contact information must remain private until a swap reaches the approved stage.

Do not expose:

```text
phone
email
WhatsApp
exact address
```

to other users by default.

Contact unlock should require explicit consent according to the product flow.

---

# 18. MODERATION

The platform must support reporting:

```text
fake product
fraud
prohibited product
spam
money request
inappropriate content
harassment
other
```

Users must also be able to block other users.

---

# 19. MONEY REQUEST MODERATION

JetSwap's core rule is:

```text
No Money. Just Swap.
```

Future moderation should detect phrases related to money requests.

Examples:

```text
TL
₺
USD
$
EUR
€
satılık
fiyat
üstüne para
+ para
```

Do not block normal explanatory text blindly.

Prefer moderation signals over simplistic destructive filtering.

---

# 20. JETTRUST

JetTrust should ultimately be based only on platform behavior and verification.

Possible components:

```text
Verification       25%
Swap history       35%
Reviews            25%
Account behavior   15%
```

Never use protected demographic or unrelated personal attributes.

---

# 21. API DESIGN

Use predictable REST-style route organization unless an existing project convention requires otherwise.

Examples:

```text
/api/products
/api/products/[id]

/api/products/[id]/wants

/api/matches
/api/matches/[id]

/api/offers
/api/offers/[id]
/api/offers/[id]/counter
/api/offers/[id]/accept
/api/offers/[id]/reject

/api/messages
/api/conversations

/api/reviews
/api/reports
/api/notifications
```

---

# 22. API RESPONSES

Keep API response structures consistent.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Ürün bulunamadı."
  }
}
```

Do not expose raw database errors to users.

---

# 23. VALIDATION

All API input must be validated server-side.

Never rely only on HTML input validation.

Validate:

```text
types
required fields
string lengths
allowed enum values
resource ownership
product status
offer state transitions
```

A validation library may be introduced if it materially improves consistency.

Prefer Zod if a new validation dependency is required.

---

# 24. OFFER STATE MACHINE

Offer states must follow valid transitions.

Example:

```text
PENDING
↓
VIEWED
↓
NEGOTIATING / COUNTERED
↓
ACCEPTED
↓
EXCHANGED
```

Terminal/alternative states:

```text
REJECTED
WITHDRAWN
```

Never allow nonsensical transitions such as:

```text
REJECTED → EXCHANGED
```

without a new offer.

---

# 25. TRANSACTIONS

Use database transactions when multiple dependent records must change atomically.

Examples:

```text
accepting an offer
completing a swap
marking multiple products EXCHANGED
updating swap counters
creating trust/review eligibility
```

---

# 26. PRODUCT STATUS

Current statuses should remain conceptually:

```text
DRAFT
ACTIVE
EXCHANGED
ARCHIVED
```

Only ACTIVE products should participate in JetMatch.

---

# 27. SEARCH AND SEO

Architecture should eventually support SEO URLs such as:

```text
/takas/telefon
/takas/bisiklet
/takas/istanbul
/takas/istanbul/telefon
```

Do not implement thousands of thin empty SEO pages.

Only index meaningful pages containing useful content.

---

# 28. UI PRINCIPLES

JetSwap should feel simple even if matching logic is complex.

Primary user questions:

```text
What do I have?
What do I want?
What can I swap for it?
```

Avoid overwhelming users.

Use mobile-first responsive design.

---

# 29. MOBILE NAVIGATION TARGET

Future mobile navigation:

```text
Keşfet
JetMatch
+
Takaslar
Profil
```

The central `+` represents adding a product.

---

# 30. ANALYTICS EVENTS

Design actions so these events can later be emitted:

```text
sign_up
login

product_add_started
product_published

want_added

jetmatch_generated
jetmatch_viewed

offer_started
offer_sent
counter_offer_sent
offer_accepted

message_sent

contact_requested
contact_unlocked

swap_completed

review_submitted
```

Do not tightly couple business logic to GA4.

Domain events should be usable independently.

---

# 31. TESTING EXPECTATIONS

For every meaningful feature:

1. test the happy path
2. test unauthorized access
3. test invalid input
4. test ownership
5. test missing resources
6. test illegal state transitions

Prioritize API/business-logic tests.

---

# 32. BEFORE COMMITTING

Before considering a task complete:

Run:

```bash
npm run lint
npm run build
```

If database models changed:

```bash
npx prisma validate
npx prisma generate
```

Use the repository's supported migration process.

Do not mark work complete while build errors remain.

---

# 33. DO NOT DO

Do not:

- redesign the entire site without request
- replace Prisma
- replace PostgreSQL
- replace NextAuth during early sprints
- introduce microservices
- introduce Redis without a demonstrated need
- introduce Elasticsearch during MVP
- build Swap Chain during MVP
- add payments
- add product pricing
- create fake sample production data
- silently change user-facing product rules

---

# 34. DEVELOPMENT ORDER

Unless explicitly overridden, development should proceed in this order:

```text
Sprint 1
Authentication

Sprint 2
Products

Sprint 3
ProductWant

Sprint 4
JetMatch V1

Sprint 5
JetMatch UI

Sprint 6
Trade Offers

Sprint 7
Messaging

Sprint 8
Swap Completion + Reviews + JetTrust

Sprint 9
Moderation + Blocking

Sprint 10
Notifications

Sprint 11
Search + Location + Distance

Sprint 12
SEO + Analytics + PWA

Later
AI product recognition
Services
Swap chains
Mobile apps
```

Do not skip foundational sprints just to implement visually impressive later features.

---

# 35. FINAL PRINCIPLE

JetSwap is not an advertisement board.

Its primary value is not:

```text
LIST
```

Its primary value is:

```text
MATCH
```

Every major product decision should support this loop:

```text
HAVE → WANT → MATCH → OFFER → SWAP → TRUST
```