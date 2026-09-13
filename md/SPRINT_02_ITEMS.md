# JetSwap Sprint 2 — Real Item System

## AI AGENT TASK

Implement Sprint 2 only.

Do not implement JetMatch, offers, messaging, reviews, moderation, notifications, or later sprint features during this task.

Read first:

```text
AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md
prisma/schema.prisma
src/lib/auth.ts
src/lib/prisma.ts
src/lib/require-user.ts
src/app/products
src/app/api
src/app/page.tsx
```

Also inspect the latest Sprint 1 authentication implementation before changing anything.

---

# OBJECTIVE

Convert the current item/product creation experience into a real PostgreSQL-backed JetSwap item system.

The platform must support:

```text
authenticated user
↓
create item
↓
persist item in PostgreSQL
↓
view item detail
↓
view own portfolio
↓
manage own item
```

Use the existing real JetSwap data model.

Do NOT rename the existing `Item` model to `Product`.

---

# CURRENT DATA MODEL

The current Prisma schema already contains the main item model:

```prisma
model Item {
  id                String         @id @default(cuid())
  userId            String
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  title             String
  description       String

  categoryId        String
  category          Category       @relation(fields: [categoryId], references: [id])

  condition         ItemCondition  @default(GOOD)
  tradeMethod       TradeMethod    @default(BOTH)

  images            String[]

  country           String         @default("TR")
  city              String         @default("İstanbul")

  targetCategories  String[]
  targetDescription String

  valueTier         String?        @default("MEDIUM")

  status            ItemStatus     @default(AVAILABLE)

  viewCount         Int            @default(0)

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  offerItems        TradeOfferItem[]
}
```

Use this architecture.

Do not replace `images String[]` during Sprint 2.

Do not introduce a separate image model yet.

Do not redesign the WANT architecture during Sprint 2.

---

# ITEM STATUS

Existing enum:

```prisma
enum ItemStatus {
  AVAILABLE
  PENDING_TRADE
  TRADED
  ARCHIVED
}
```

Interpretation:

```text
AVAILABLE
Takasa açık

PENDING_TRADE
Takas sürecinde

TRADED
Takas tamamlandı

ARCHIVED
Pasif / arşivlenmiş
```

Only `AVAILABLE` items are publicly tradable.

---

# TRADE METHOD

Existing enum:

```prisma
enum TradeMethod {
  HAND_TO_HAND
  CARGO_ONLY
  BOTH
}
```

Use these values consistently.

Do not use arbitrary frontend strings once data is submitted.

---

# STEP 1 — BASELINE AUDIT

Before modifications:

```bash
npm install
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Inspect current routes.

Identify any existing:

```text
/api/items
/api/products
/items
/products
```

routes before creating new ones.

Prefer consistency with the existing app.

If existing frontend uses `/products`, it may remain as a URL path temporarily even though the database entity is `Item`.

Do not rename all UI routes unless necessary.

---

# STEP 2 — CATEGORY VERIFICATION

Inspect the existing `Category` model and seed data.

Confirm that categories exist in PostgreSQL.

The item creation UI must submit a real:

```text
categoryId
```

not only a category name or slug.

If the UI currently uses names/slugs:

```text
Telefon
Bilgisayar
Kamera
```

resolve those into actual Category records safely.

Do not create duplicate categories during every item creation request.

---

# STEP 3 — CREATE ITEM API

Create or complete:

```text
POST /api/items
```

Preferred route.

If the current frontend is already wired to:

```text
/api/products
```

you may temporarily support that route as a compatibility layer, but the business entity remains `Item`.

Avoid duplicate business logic.

Recommended architecture:

```text
route handler
↓
validation
↓
authenticated user
↓
item service / Prisma
↓
response
```

---

# STEP 4 — AUTHENTICATION

Item creation must require login.

Use the authenticated user from the server.

Example:

```text
requireUser()
```

or the existing Sprint 1 helper.

Never accept:

```text
userId
ownerId
```

from the browser.

The server must set:

```text
userId = authenticatedUser.id
```

---

# STEP 5 — ITEM CREATE INPUT

Accept the fields required by the current schema:

```text
title
description
categoryId
condition
tradeMethod
images
country
city
targetCategories
targetDescription
valueTier
```

Do not allow the client to set:

```text
userId
viewCount
createdAt
updatedAt
```

Do not allow arbitrary initial status values.

New published item status should normally be:

```text
AVAILABLE
```

---

# STEP 6 — SERVER-SIDE VALIDATION

Validate all inputs.

Minimum validation:

### title

Required.

Suggested:

```text
3–120 characters
```

### description

Required.

Suggested:

```text
10–5000 characters
```

### categoryId

Required.

Must point to an existing category.

### condition

Must be one of:

```text
BRAND_NEW
LIKE_NEW
GOOD
FAIR
```

### tradeMethod

Must be one of:

```text
HAND_TO_HAND
CARGO_ONLY
BOTH
```

### images

Array of strings.

Prevent excessive item counts.

Suggested MVP maximum:

```text
10 images
```

Validate that values are reasonable URLs or known uploaded asset references.

### country

Required or default to:

```text
TR
```

### city

Required.

### targetCategories

Array of strings.

May be empty only if product rules allow fully open offers.

### targetDescription

Required unless the item is explicitly configured as open to all offers.

If the current model requires this field, provide a valid fallback rather than storing meaningless text.

### valueTier

Only allow known values:

```text
LOW
MEDIUM
HIGH
PREMIUM
```

Prefer introducing an enum in a later migration if appropriate.

Do not perform unrelated schema redesign during Sprint 2.

---

# STEP 7 — API RESPONSE

Successful creation:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "status": "AVAILABLE"
  }
}
```

Use:

```text
201 Created
```

Validation failure:

```text
400
```

Unauthenticated:

```text
401
```

Invalid category:

```text
400 or 404
```

Server error:

```text
500
```

Do not expose raw Prisma exceptions.

---

# STEP 8 — CONNECT EXISTING CREATION WIZARD

Inspect the current item/product creation pages.

Preserve the multi-step UX where possible.

Typical flow may include:

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

Temporary wizard state may continue using:

```text
localStorage
```

during the creation process.

However, after final publish:

```text
all relevant data must be persisted in PostgreSQL
```

---

# STEP 9 — FIX FINAL SUBMISSION

The existing final preview/publish button must submit real item data.

Do not leave:

```text
console.log only
mock success
fake API response
```

behavior.

Build the final payload from the wizard state.

Map frontend values to Prisma enums.

Example mapping:

```text
new
→ BRAND_NEW

like-new
→ LIKE_NEW

good
→ GOOD

used/fair
→ FAIR
```

Do not store arbitrary frontend labels directly in enum fields.

---

# STEP 10 — TARGET CATEGORIES

The current Item model already contains:

```text
targetCategories String[]
targetDescription String
```

During Sprint 2, preserve this architecture.

The creation wizard must correctly persist:

```text
what the user wants in exchange
```

Example:

```text
targetCategories:
[
  "fotograf-makinesi",
  "laptop"
]

targetDescription:
"Sony veya Canon fotoğraf makinesi ya da temiz bir MacBook düşünüyorum."
```

Do not create `ItemWant` or `ProductWant` in Sprint 2.

That belongs to the next architecture refinement.

---

# STEP 11 — IMAGE HANDLING

Inspect the existing frontend image implementation.

Determine whether the wizard currently stores:

```text
base64
blob URL
temporary browser URL
remote URL
```

Do not store temporary browser-only URLs in PostgreSQL.

Examples that must NOT be stored:

```text
blob:http://localhost/...
```

The final DB value must be a persistent asset URL.

If no real image upload system exists yet:

1. create a simple storage abstraction
2. clearly separate upload from Item creation
3. avoid storing fake URLs

If production file storage cannot be fully implemented in this sprint, provide a safe development fallback and document the limitation.

Do not store raw image binary data inside the `Item` table.

---

# STEP 12 — PUBLIC ITEM LIST API

Create:

```text
GET /api/items
```

Minimum behavior:

Return public:

```text
AVAILABLE
```

items.

Include required relation data:

```text
category
public owner information
```

Do not expose:

```text
password
private phone
private email
```

---

# STEP 13 — PAGINATION

Do not return unlimited items.

Implement basic pagination.

Suggested query:

```text
?page=1&limit=20
```

Maximum safe limit:

```text
50
```

Return metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 123,
    "totalPages": 7
  }
}
```

---

# STEP 14 — ITEM DETAIL API

Create:

```text
GET /api/items/[id]
```

or slug-based equivalent if the project already has slug architecture.

For Sprint 2, ID-based routes are acceptable.

Return:

```text
title
description
images
condition
tradeMethod
country
city
targetCategories
targetDescription
valueTier
status
createdAt
viewCount
category
public owner summary
```

Do not return private contact details.

---

# STEP 15 — ITEM DETAIL PAGE

Create or complete a public page.

Preferred conceptual URL:

```text
/items/[id]
```

If current frontend already uses:

```text
/products/[id]
```

you may retain it for compatibility.

Display:

```text
images
title
description
condition
trade method
location
category
what user wants
owner public summary
created date
```

Do not expose user phone/email.

---

# STEP 16 — VIEW COUNT

Increment `viewCount` carefully.

Do not increment excessively due to:

```text
React re-renders
server component refreshes
API retries
```

For MVP, simple detail-page access increment is acceptable.

Do not count owner preview views if easily avoidable.

Do not make view counting block item rendering.

---

# STEP 17 — OWNER PORTFOLIO

Create authenticated user's portfolio page.

Suggested route:

```text
/profile/items
```

or existing dashboard convention.

Sections:

```text
Takasa Açık
Takas Sürecinde
Takaslandı
Arşiv
```

Map to:

```text
AVAILABLE
PENDING_TRADE
TRADED
ARCHIVED
```

---

# STEP 18 — MY ITEMS API

Create:

```text
GET /api/items/mine
```

or equivalent.

Must use session identity.

Do not accept:

```text
?userId=...
```

to determine ownership.

Return all statuses belonging to the authenticated user.

---

# STEP 19 — EDIT ITEM

Create:

```text
PATCH /api/items/[id]
```

Only owner may edit.

Before update:

```text
find item
↓
verify ownership
↓
validate input
↓
update
```

Non-owner:

```text
403 Forbidden
```

Unknown item:

```text
404
```

---

# STEP 20 — EDITABLE FIELDS

Allow owner to update:

```text
title
description
categoryId
condition
tradeMethod
images
country
city
targetCategories
targetDescription
valueTier
```

Do not allow client to update:

```text
userId
viewCount
createdAt
```

Status should use dedicated actions where practical.

---

# STEP 21 — ARCHIVE ITEM

Allow owner to archive an item.

Preferred:

```text
PATCH /api/items/[id]/archive
```

or consistent equivalent.

Result:

```text
status = ARCHIVED
```

Do not permanently delete user history unnecessarily.

---

# STEP 22 — REACTIVATE ITEM

Allow owner to reactivate an archived item if valid.

Transition:

```text
ARCHIVED
→
AVAILABLE
```

Do not reactivate:

```text
TRADED
```

items automatically.

---

# STEP 23 — STATUS RULES

Enforce sensible status transitions.

Allowed during Sprint 2:

```text
AVAILABLE → ARCHIVED
ARCHIVED → AVAILABLE
```

Do not manually allow:

```text
AVAILABLE → TRADED
AVAILABLE → PENDING_TRADE
```

from the basic item-edit page.

Those status changes belong to the trade-offer flow in later sprints.

---

# STEP 24 — DELETE POLICY

Do not prioritize permanent item deletion.

Preferred behavior:

```text
archive instead of delete
```

If delete functionality already exists, ensure:

```text
only owner
no active trade dependency
safe cascading behavior
```

Do not create complex deletion flow during Sprint 2 unless required.

---

# STEP 25 — HOMEPAGE DATA

Inspect the homepage.

If it currently contains demo/static item cards, replace appropriate marketplace areas with real DB data.

Important:

Do NOT leave fake marketplace statistics pretending to be real.

Do not display fabricated:

```text
item counts
member counts
successful swap counts
```

unless they are clearly marked as demo or generated from real DB data.

---

# STEP 26 — DEMO ITEMS

If static demo item cards remain useful for design development:

Clearly separate them from production listings.

Preferred production behavior:

```text
no real items
→ meaningful empty state
```

Example:

```text
Henüz takasa açık ürün bulunmuyor.
İlk ürününü ekleyerek JetSwap topluluğunu başlat.
```

Do not fabricate marketplace liquidity.

---

# STEP 27 — PUBLIC OWNER DATA

Public item owner summary may include:

```text
name
avatar
city
country
rating
reviewCount
member since
```

Do NOT expose:

```text
password
email
phone
```

Phone/contact reveal belongs to later trade flow.

---

# STEP 28 — ERROR STATES

Frontend must handle:

```text
loading
not found
unauthorized
validation error
server error
empty state
```

Avoid browser `alert()` for normal production UX if practical.

Prefer inline feedback/toast consistent with the current UI system.

Do not redesign the whole UI just to add notifications.

---

# STEP 29 — PRISMA QUERIES

Use `select` intentionally.

Do not blindly:

```text
include: { user: true }
```

if it exposes sensitive fields.

Example concept:

```ts
user: {
  select: {
    id: true,
    name: true,
    avatar: true,
    city: true,
    country: true,
    rating: true,
    reviewCount: true,
    createdAt: true,
  }
}
```

---

# STEP 30 — SECURITY TESTS

Verify:

### Unauthenticated create

Expected:

```text
401
```

### Authenticated create

Expected:

```text
201
```

### User A edits User A's item

Expected:

```text
success
```

### User B edits User A's item

Expected:

```text
403
```

### Invalid category

Expected:

```text
error
```

### Invalid enum

Expected:

```text
error
```

---

# STEP 31 — FUNCTIONAL TESTS

Test:

```text
register/login
↓
create item
↓
DB record exists
↓
item appears in portfolio
↓
item appears in public listing
↓
item detail opens
↓
edit item
↓
archive item
↓
public listing no longer shows it
↓
reactivate item
↓
public listing shows it again
```

---

# STEP 32 — DATABASE MIGRATION RULE

Do not use destructive schema reset.

Do not run:

```bash
prisma migrate reset
```

against production.

If schema changes become necessary:

Development:

```bash
npx prisma migrate dev --name sprint2-items
```

Production later:

```bash
npx prisma migrate deploy
```

However, prefer using the existing Item schema without unnecessary changes during Sprint 2.

---

# STEP 33 — BUILD VALIDATION

Before completion run:

```bash
npm run lint
npm run build
npx tsc --noEmit
npx prisma validate
npx prisma generate
```

All new errors introduced by Sprint 2 must be fixed.

---

# STEP 34 — DO NOT DO

During Sprint 2 DO NOT implement:

```text
JetMatch algorithm
Match score
Trade offers
Counter offers
Messaging
Contact reveal
Swap completion
Reviews
JetTrust calculation
Moderation
Notifications
Saved searches
AI product recognition
AI descriptions
Swap chains
Payments
Product pricing
```

Do not rename the whole database model from:

```text
Item
```

to:

```text
Product
```

Do not replace PostgreSQL or Prisma.

Do not upgrade Prisma during this sprint.

---

# STEP 35 — DOCUMENTATION

At the end create/update a Sprint 2 report.

Suggested:

```text
docs/sprints/SPRINT_02_REPORT.md
```

Include:

```text
Completed
Modified Files
New Routes
Database Changes
Environment Variables
Tests
Known Limitations
```

---

# ACCEPTANCE CRITERIA

Sprint 2 is complete only when all of the following are true:

- logged-in user can create a real Item
- Item persists in PostgreSQL
- correct authenticated `userId` is stored
- real `categoryId` is stored
- enum values are valid
- targetCategories persist
- targetDescription persists
- public AVAILABLE items can be listed
- item detail page works
- owner portfolio works
- owner can edit own item
- non-owner cannot edit item
- item can be archived
- archived item disappears from public marketplace
- archived item can be reactivated
- private user contact data is not exposed
- homepage/public marketplace no longer depends on fake production listings
- lint passes
- TypeScript check passes
- production build passes
- Prisma validation passes

---

# FINAL REPORT FORMAT

When complete, report:

## Completed

List implemented functionality.

## Modified Files

List every important modified/new file.

## API Routes

List created/changed routes.

## Database Changes

Explain whether Prisma schema changed.

## Environment Variables

List any new variables.

## Tests

List commands and results.

## Known Limitations

Be explicit.

## Git Status

State whether changes are committed/pushed.

Do not start Sprint 3 automatically.

Wait for explicit instruction.