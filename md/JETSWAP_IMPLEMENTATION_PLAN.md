# JetSwap Implementation Plan

## Purpose

This file defines the implementation order for completing the JetSwap MVP.

Do not attempt to implement everything in one pass.

Each sprint must be independently reviewed, tested, built, and committed before continuing.

---

# CURRENT STATE

Current repository contains:

- Next.js frontend
- PostgreSQL/Prisma configuration
- NextAuth skeleton
- Product creation UI
- database models for many future features

However several features are currently mock/prototype implementations.

Known issues include:

- login uses a mock user
- registration does not persist a user
- product publishing calls an API route that does not currently exist
- product creation wizard uses localStorage
- WANT selections are hard-coded sample data
- JetMatch database model exists but matching logic does not
- TradeOffer model exists but API/UI does not
- Message model exists but messaging does not
- Review/Report/Notification models exist but related product functionality is incomplete

The implementation must convert the prototype into a real application incrementally.

---

# SPRINT 0 — BASELINE AUDIT

Before modifying application behavior:

## Tasks

1. Run project locally.
2. Run:

```bash
npm install
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

3. Record all current errors.
4. Do not fix unrelated cosmetic issues yet.
5. Verify PostgreSQL connection.
6. Verify environment variables.
7. Inspect:

```text
src/lib/auth.ts
src/lib/prisma.ts
src/app/api
src/app/products/create
prisma/schema.prisma
```

## Deliverable

Create:

```text
docs/BASELINE.md
```

containing:

```text
Build status
Lint status
Prisma status
Known warnings
Known broken routes
Environment assumptions
```

---

# SPRINT 1 — REAL AUTHENTICATION

## Goal

Remove mock authentication and implement real account registration/login.

---

## 1.1 Registration

Current registration endpoint must persist users.

Required process:

```text
receive name/email/password
↓
normalize email
↓
validate
↓
check duplicate email
↓
bcrypt hash password
↓
Prisma User.create()
↓
return sanitized user
```

Never return password hashes.

---

## 1.2 Registration validation

Minimum:

```text
name required
valid email
password minimum 8 characters
duplicate email prevention
```

Prefer stronger password rules only if UX remains reasonable.

---

## 1.3 Login

Replace mock authorization logic.

Required flow:

```text
email
↓
find User
↓
verify password exists
↓
bcrypt.compare()
↓
return sanitized user
```

Invalid email/password must return generic credentials error.

Do not reveal whether an email exists.

---

## 1.4 Session

Ensure session exposes:

```text
user.id
user.email
user.name
user.role
```

Do not expose private database fields unnecessarily.

---

## 1.5 Protected route helper

Create reusable server helper for authenticated user.

Suggested concept:

```ts
requireUser()
```

It should:

```text
read server session
throw/return Unauthorized when absent
return authenticated user identity
```

---

## 1.6 Acceptance criteria

Sprint is complete only if:

- account is actually stored in PostgreSQL
- duplicate account registration fails gracefully
- valid login works
- invalid login fails
- password hash exists in DB
- plaintext password does not
- session has real DB user id
- protected API can obtain authenticated user
- lint passes
- build passes

---

# SPRINT 2 — REAL PRODUCT SYSTEM

## Goal

Create persistent product publishing and reading.

---

## 2.1 Product create API

Create:

```text
POST /api/products
```

Authenticated only.

Server determines:

```text
userId
```

from session.

Never accept owner identity from client.

---

## 2.2 Product input

Persist:

```text
title
description
category
subcategory
brand
condition
conditionDetails
year
country
region
city
images
status
```

Adapt the frontend payload to actual Prisma identifiers.

Do not store category names where category IDs are required.

---

## 2.3 Slugs

Generate unique product slugs.

Example:

```text
iphone-15-pro
iphone-15-pro-x7k2
```

Slug collision must not break publishing.

---

## 2.4 Product image records

Create `ProductImage` records.

Support:

```text
multiple images
primary image
sort order
alt text
```

---

## 2.5 Product status

On completed publication:

```text
ACTIVE
```

Incomplete draft:

```text
DRAFT
```

---

## 2.6 Product detail

Create page:

```text
/products/[slug]
```

Display:

```text
photos
title
condition
description
location
owner public profile summary
WANT information
swap CTA
```

Do not expose private contact data.

---

## 2.7 Portfolio

Create:

```text
/profile/products
```

or project-consistent equivalent.

Sections:

```text
ACTIVE
EXCHANGED
ARCHIVED
DRAFT
```

Owner actions:

```text
edit
archive
reactivate
```

---

## 2.8 Acceptance criteria

- authenticated user can publish product
- record exists in PostgreSQL
- images are related correctly
- another user can view ACTIVE product
- private/unpublished products are protected
- owner can manage own product
- non-owner cannot edit
- product creation no longer depends only on localStorage
- build/lint pass

---

# SPRINT 3 — PRODUCT-SPECIFIC WANT SYSTEM

## Goal

Correct the current WANT architecture.

---

## 3.1 ProductWant model

Introduce product-level wants.

Create a relational model conceptually similar to:

```prisma
model ProductWant {
  id               String   @id @default(cuid())
  productId        String
  categoryId       String?
  subcategoryId    String?
  brandId          String?
  modelName        String?
  keywords         String?
  minimumCondition String?
  country          String?
  region           String?
  city             String?
  maxDistance      Int?
  priority         Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  product Product @relation(...)
}
```

Adapt names to project conventions.

---

## 3.2 Migration safety

Do not blindly delete the existing `SwapPreference` model.

Determine whether it can represent account-level defaults such as:

```text
maximum default trade distance
open to alternative offers
```

If useful, retain it as user-level preferences.

Move product-specific exchange expectations to `ProductWant`.

---

## 3.3 WANT API

Create endpoints to:

```text
create wants
read wants
update wants
delete wants
```

Only product owner may modify wants.

---

## 3.4 WANT UI

Replace hard-coded sample products.

Allow user to define:

```text
category
subcategory
brand
model
condition
keywords
location constraints
```

Allow multiple WANT entries per product.

---

## 3.5 Open to other offers

Keep:

```text
openToOtherOffers
```

This should be product-level or appropriately resolvable per product.

Do not rely solely on one global account checkbox.

---

## Acceptance criteria

Example must work:

```text
User:
Product A = iPhone
Wants:
- MacBook
- Camera

Product B = Bicycle
Wants:
- PlayStation
```

These WANT sets must remain separate.

---

# SPRINT 4 — JETMATCH V1 ENGINE

## Goal

Create real deterministic matching.

---

## 4.1 Matching service

Create a dedicated domain service.

Suggested location:

```text
src/lib/jetmatch/
```

Possible files:

```text
matcher.ts
score.ts
types.ts
explanations.ts
```

Do not put the entire algorithm inside a route handler.

---

## 4.2 Eligible products

Only match:

```text
ACTIVE products
```

Never match a user's product against their own product.

---

## 4.3 Mutual match

Example:

```text
A owns iPhone.
A wants Camera.

B owns Camera.
B wants iPhone.
```

Result:

```text
MUTUAL
```

---

## 4.4 One-way match

Example:

```text
A wants Camera.
B owns Camera.
B is open to other offers.
```

Result:

```text
ONE_WAY
```

with lower score than true mutual match.

---

## 4.5 Scoring

Start with explainable weights.

Suggested:

```text
Mutual WANT           40
Category              15
Brand                 10
Model                 10
Condition              5
Location              10
Distance               5
JetTrust               5
```

Do not pretend precision that does not exist.

---

## 4.6 Explanations

Every match should be able to produce human-readable reasons.

Example:

```json
[
  "Sen fotoğraf makinesi arıyorsun.",
  "Karşı taraf iPhone arıyor.",
  "Aynı şehirdesiniz.",
  "Ürün durumları uyumlu."
]
```

---

## 4.7 Persistence

Decide deliberately whether matches should be:

```text
computed live
```

or

```text
computed and persisted
```

Current schema contains `Match`.

For MVP, persisted results are acceptable if refresh/recalculation strategy is clearly implemented.

---

## 4.8 Recalculation triggers

Recalculate when:

```text
product becomes ACTIVE
product WANT changes
product status changes
relevant new product is published
```

Avoid recalculating the entire marketplace synchronously for every request.

---

# SPRINT 5 — JETMATCH USER INTERFACE

## Goal

Turn matching into JetSwap's primary product experience.

Create JetMatch page with sections:

```text
🔥 Karşılıklı
❤️ Beni İsteyenler
🔎 Aradıklarım
✨ Öneriler
```

---

## Match card

Display:

```text
match score
user's product
other product
distance/location
JetTrust summary
match reasons
```

Primary CTA:

```text
TAKAS TEKLİFİ YAP
```

---

## Example

```text
%94 MÜKEMMEL TAKAS

Sen veriyorsun:
iPhone 15 Pro

⇄

Ahmet veriyor:
Sony A7 III

Neden eşleştiniz?

✓ Sen fotoğraf makinesi arıyorsun
✓ Ahmet iPhone arıyor
✓ Aynı şehirdesiniz

[ TAKAS TEKLİFİ YAP ]
```

---

# SPRINT 6 — TRADE OFFER SYSTEM

## Goal

Users can turn matches into actual swap proposals.

---

## 6.1 Normalize offer items

Prefer:

```text
TradeOffer
TradeOfferItem
```

over JSON-only product arrays.

Support:

```text
OFFERED
REQUESTED
```

---

## 6.2 Create offer

User selects one or more owned ACTIVE products.

User selects requested products.

Server validates ownership.

---

## 6.3 Counter offer

Support:

```text
original offer
↓
counter offer
```

Preserve history.

Do not overwrite previous proposal.

---

## 6.4 Offer statuses

Support valid state machine.

---

## 6.5 Offers page

Create:

```text
Gelen
Gönderilen
Görüşülüyor
Kabul Edilen
Tamamlanan
Reddedilen
```

---

# SPRINT 7 — MESSAGING

## Goal

Messaging tied to a trade negotiation.

Messages should normally belong to a TradeOffer/conversation context.

---

## Requirements

Support:

```text
text messages
read status
timestamps
system messages
```

Later:

```text
image attachments
```

Do not expose contact information automatically.

---

# SPRINT 8 — CONTACT UNLOCK + SWAP COMPLETION

## Contact unlock

Both sides should approve before private contact information is revealed.

Record timestamp.

---

## Swap completion

Recommended flow:

```text
Party A says completed
↓
Party B confirms
↓
transaction completes
```

Use transaction.

Set relevant products:

```text
EXCHANGED
```

Update user swap counters.

---

# SPRINT 9 — REVIEWS + JETTRUST

## Reviews

Allow reviews only after eligible completed swaps.

Prevent arbitrary fake reviews.

Suggested dimensions:

```text
communication
product accuracy
reliability
overall rating
```

---

## JetTrust

Implement transparent scoring logic.

Store enough data to explain reputation.

---

# SPRINT 10 — MODERATION

Implement:

```text
report product
report user
block user
admin moderation queue
```

Important report reason:

```text
MONEY_REQUEST
```

because money transactions violate JetSwap's core concept.

---

# SPRINT 11 — NOTIFICATIONS

Use existing Notification model or improve it.

Generate notifications for:

```text
new JetMatch
new offer
counter offer
offer accepted
new message
contact request
contact unlocked
swap completed
review received
```

---

# SPRINT 12 — LOCATION & DISTANCE

Implement location-aware discovery.

Support:

```text
same city
distance filtering
nearby matches
```

Avoid storing exact public home addresses.

---

# SPRINT 13 — SEARCH

Implement product discovery.

Search:

```text
title
brand
model
category
location
keywords
```

Filters:

```text
category
condition
location
distance
verified user
```

---

# SPRINT 14 — SEO

Implement:

```text
metadata
canonical URLs
sitemap
robots
structured data where truthful
category pages
location pages
```

Never invent product prices for structured data.

---

# SPRINT 15 — ANALYTICS

Implement domain event layer.

Track:

```text
registration
product publication
WANT creation
JetMatch
offer
counter offer
accepted offer
messages
contact unlock
completed swap
review
```

GA4 may consume these events, but business logic must not depend on GA4.

---

# LATER PHASES

Do not implement until MVP usage justifies them.

### AI product recognition

Photo:

```text
↓
product/category/brand suggestion
```

### AI description

Generate draft descriptions.

### Services

Support:

```text
product ↔ service
service ↔ service
```

### Swap Chain

Future:

```text
A → B → C → A
```

Requires separate graph/chain architecture.

Do not force it into the two-product Match model.

---

# DEFINITION OF DONE

A sprint is complete only when:

```text
feature works with PostgreSQL
authorization is enforced
validation exists
errors are handled
lint passes
build passes
Prisma validates
manual happy-path test succeeds
```

After each sprint:

1. summarize changes
2. list new/modified files
3. list migrations
4. list new environment variables
5. list known limitations
6. do not silently start the next sprint