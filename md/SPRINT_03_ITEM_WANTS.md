# JetSwap Sprint 3 — Structured Item Wants

## AI AGENT TASK

Implement Sprint 3 only.

Do not implement JetMatch scoring, match generation, trade offers, messaging, notifications, reviews, moderation, or later sprint features during this task.

Read first:

```text
AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md
docs/sprints/SPRINT_02_REPORT.md
prisma/schema.prisma

src/app/api/items
src/app/items
src/app/profile/items
src/components/create-listing-modal.tsx
src/lib/categories.ts
src/lib/prisma.ts
src/lib/require-user.ts
```

Also inspect the latest Sprint 1 and Sprint 2 implementations before making changes.

---

# OBJECTIVE

Replace the current partially structured WANT representation:

```text
targetCategories String[]
targetDescription String
```

with a proper relational structure that can later be used efficiently by JetMatch.

The new architecture must allow each Item to have multiple independent exchange preferences.

Example:

```text
Item:
iPhone 15 Pro

Wants:
1. Category: Camera
   Brand: Sony
   Model: A7 III
   Minimum condition: GOOD

2. Category: Laptop
   Brand: Apple
   Model: MacBook Air

3. Open preference:
   Category: Gaming Console
```

The system must continue supporting the existing user experience and existing data.

Do not implement actual matching in Sprint 3.

---

# CORE ARCHITECTURE

Current:

```text
Item
├── targetCategories String[]
└── targetDescription String
```

Target:

```text
Item
└── ItemWant[]
```

Each Item may have zero, one, or many ItemWant records.

---

# STEP 1 — BASELINE

Before modifications run:

```bash
npm install
npm run lint
npm run build
npx tsc --noEmit
npx prisma validate
npx prisma generate
```

Document current failures if any.

Do not make unrelated fixes.

---

# STEP 2 — INSPECT CURRENT DATA

Inspect how Sprint 2 currently writes:

```text
targetCategories
targetDescription
```

Identify:

- API payload
- create listing modal
- edit flow
- item detail display
- portfolio display

Do not remove legacy fields before understanding all consumers.

---

# STEP 3 — CREATE ITEMWANT MODEL

Add a relational Prisma model.

Recommended conceptual model:

```prisma
model ItemWant {
  id               String   @id @default(cuid())

  itemId           String
  item             Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  categoryId       String?
  category         Category? @relation(fields: [categoryId], references: [id])

  brand            String?
  model            String?
  minimumCondition ItemCondition?

  country          String?
  city             String?
  maxDistanceKm    Int?

  keywords         String?
  note             String?

  priority         Int      @default(0)
  isFlexible       Boolean  @default(false)

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([itemId])
  @@index([categoryId])
}
```

Adapt field names if repository conventions suggest a better naming pattern.

Do not create unnecessary tables for brands/models during this sprint unless those structures already exist.

---

# STEP 4 — UPDATE ITEM RELATION

Add:

```prisma
wants ItemWant[]
```

to `Item`.

Do not remove legacy fields yet:

```prisma
targetCategories
targetDescription
```

Keep them temporarily for backward compatibility.

Mark them conceptually as legacy.

---

# STEP 5 — CATEGORY RELATION

`ItemWant.categoryId` should point to a real `Category`.

Do not store category name as the primary relational field.

Use:

```text
Category.id
```

for matching.

Frontend may continue displaying translated category labels.

---

# STEP 6 — CONDITION

Reuse existing:

```prisma
ItemCondition
```

for:

```text
minimumCondition
```

Do not invent another condition enum.

Interpretation:

```text
BRAND_NEW
LIKE_NEW
GOOD
FAIR
```

---

# STEP 7 — FLEXIBLE WANT

Support flexible preferences.

Example:

```text
Category: Camera
Brand: null
Model: null
isFlexible: true
```

Means:

> User is open to items in this category even if brand/model differ.

Do not equate flexibility with "accept absolutely anything."

---

# STEP 8 — PRIORITY

Allow user to rank wants.

Example:

```text
priority 0
Sony A7 III

priority 1
Canon EOS

priority 2
Any mirrorless camera
```

Lower numeric value may represent higher priority.

Document the convention.

---

# STEP 9 — LOCATION PREFERENCES

Support optional fields:

```text
country
city
maxDistanceKm
```

Do not implement geospatial distance calculations during Sprint 3.

These fields are only structured data for future JetMatch use.

Validation:

```text
maxDistanceKm >= 0
```

Suggested upper limit:

```text
1000
```

unless future global behavior requires more.

---

# STEP 10 — KEYWORDS

Allow optional free-text keywords.

Example:

```text
"full frame, mirrorless, sony"
```

This field may later help search and matching.

Do not use AI/NLP matching in Sprint 3.

---

# STEP 11 — NOTE

Allow optional human-readable want note.

Example:

```text
"Temiz durumda Sony A7 III veya benzeri aynasız kamera düşünüyorum."
```

This is for display.

Do not use it as the sole source of structured matching.

---

# STEP 12 — MIGRATION

Create a Prisma migration.

Suggested:

```bash
npx prisma migrate dev --name add-item-wants
```

Do not reset the database.

Never run:

```bash
prisma migrate reset
```

against production.

Production deployment later should use:

```bash
npx prisma migrate deploy
```

---

# STEP 13 — LEGACY DATA MIGRATION

Existing items may already contain:

```text
targetCategories
targetDescription
```

Create a safe migration/backfill strategy.

Do NOT delete existing data.

For each existing Item:

For every value in:

```text
targetCategories
```

attempt to resolve a matching Category by:

```text
id
slug
```

depending on current stored format.

Create corresponding ItemWant when resolution succeeds.

Example:

```text
targetCategories:
["fotograf-makinesi", "laptop"]
```

becomes:

```text
ItemWant 1:
category = fotograf-makinesi

ItemWant 2:
category = laptop
```

Legacy:

```text
targetDescription
```

may be copied into:

```text
note
```

for at least one generated want, if appropriate.

Do not create duplicate ItemWant rows if backfill runs more than once.

The backfill must be idempotent.

---

# STEP 14 — BACKFILL SCRIPT

Prefer a dedicated script.

Suggested:

```text
scripts/backfill-item-wants.ts
```

The script should:

1. fetch items with legacy WANT data
2. inspect existing ItemWant records
3. avoid duplicates
4. resolve category
5. create structured wants
6. log summary only

Example output:

```text
Processed: 25
Created wants: 42
Skipped existing: 8
Unresolved categories: 2
```

Do not log sensitive user information.

---

# STEP 15 — ITEM CREATE API

Update:

```text
POST /api/items
```

to support structured:

```json
{
  "wants": [
    {
      "categoryId": "...",
      "brand": "Sony",
      "model": "A7 III",
      "minimumCondition": "GOOD",
      "isFlexible": false,
      "priority": 0
    }
  ]
}
```

Create Item + ItemWant records atomically.

Use:

```text
Prisma transaction
```

or nested create.

---

# STEP 16 — BACKWARD COMPATIBILITY

During Sprint 3, support legacy payload if necessary:

```text
targetCategories
targetDescription
```

If old frontend still sends legacy fields:

Convert them server-side into ItemWant records.

Do not maintain two completely separate WANT logic paths.

Structured `wants[]` should become the canonical API representation.

---

# STEP 17 — ITEM UPDATE API

Update:

```text
PATCH /api/items/[id]
```

so the owner can update wants.

Only item owner may do this.

Recommended behavior:

```text
validate user
↓
validate item ownership
↓
validate wants
↓
replace/update ItemWant collection
```

Use transaction.

Do not partially delete current wants if validation fails.

---

# STEP 18 — WANTS API

Create:

```text
GET /api/items/[id]/wants
```

Public read is allowed for public Item WANT data.

Create owner-protected modification APIs only if useful:

```text
POST /api/items/[id]/wants
PATCH /api/items/[id]/wants/[wantId]
DELETE /api/items/[id]/wants/[wantId]
```

If Sprint 3 can stay simpler by updating wants through the main Item PATCH route, that is acceptable.

Do not duplicate business logic.

---

# STEP 19 — VALIDATION

Validate each want.

### categoryId

Optional only if a completely free-form WANT is explicitly supported.

Prefer requiring category for MVP.

### brand

Optional.

Suggested max:

```text
80 chars
```

### model

Optional.

Suggested max:

```text
120 chars
```

### keywords

Optional.

Suggested max:

```text
500 chars
```

### note

Optional.

Suggested max:

```text
1000 chars
```

### priority

Integer.

Suggested:

```text
0–100
```

### minimumCondition

Must be valid ItemCondition.

### maxDistanceKm

Must be a valid non-negative integer.

---

# STEP 20 — MAXIMUM WANT COUNT

Prevent abuse.

Suggested MVP maximum:

```text
10 wants per Item
```

Reject excessive payloads.

---

# STEP 21 — CREATE LISTING UI

Update:

```text
CreateListingModal
```

or the current listing creation UI.

Replace simplistic category-only WANT selection with repeatable WANT cards.

Example:

```text
Ne ile takas etmek istersin?

[ İstek 1 ]

Kategori:
Fotoğraf Makinesi

Marka:
Sony

Model:
A7 III

Minimum Durum:
İyi

☐ Benzer ürünlere de açığım

[ İsteği Sil ]

[ + Başka İstek Ekle ]
```

Do not overwhelm the UI.

Brand/model/location fields may be under:

```text
Gelişmiş tercihler
```

if necessary.

---

# STEP 22 — DEFAULT SIMPLE MODE

Default WANT creation should remain simple.

Minimum user action:

```text
select category
```

Advanced optional fields:

```text
brand
model
condition
location
keywords
```

Do not force users to fill every field.

---

# STEP 23 — "OPEN TO OFFERS"

If current product UX has an open/flexible concept, preserve it.

Preferred implementation:

```text
isFlexible
```

per ItemWant.

Do not create money-based or value-based negotiation logic.

---

# STEP 24 — EDIT ITEM UI

Allow the owner to edit current ItemWant entries.

Existing wants should load into the edit form.

User should be able to:

```text
add
edit
remove
reorder
```

WANT entries.

---

# STEP 25 — ITEM DETAIL PAGE

Update:

```text
/items/[id]
```

Replace or supplement:

```text
targetCategories
targetDescription
```

display with structured wants.

Example:

```text
İlan Sahibi Ne İstiyor?

1. Fotoğraf Makinesi
   Sony A7 III
   En az: İyi durumda

2. Laptop
   Apple MacBook
   Benzer modellere açık
```

Use human-readable labels.

---

# STEP 26 — PRIORITY DISPLAY

Do not necessarily show raw numeric priority.

Display structured order.

Example:

```text
1. tercih
2. tercih
3. tercih
```

---

# STEP 27 — API SERIALIZATION

Item API responses should include:

```json
{
  "wants": [
    {
      "id": "...",
      "category": {
        "id": "...",
        "slug": "...",
        "nameTr": "...",
        "nameEn": "..."
      },
      "brand": "...",
      "model": "...",
      "minimumCondition": "GOOD",
      "country": "TR",
      "city": "İstanbul",
      "maxDistanceKm": 50,
      "keywords": "...",
      "note": "...",
      "priority": 0,
      "isFlexible": false
    }
  ]
}
```

Do not expose unnecessary internal fields.

---

# STEP 28 — PUBLIC LIST API

`GET /api/items` does not need to return every WANT field in full if that bloats the response.

Return a lightweight summary.

Example:

```text
wantCount
topWant
```

Full wants belong to item detail API.

---

# STEP 29 — QUERY PERFORMANCE

Add indexes where useful.

Recommended:

```text
ItemWant.itemId
ItemWant.categoryId
```

Do not over-index optional free-text fields during MVP.

---

# STEP 30 — LEGACY FIELDS

Do NOT remove:

```text
targetCategories
targetDescription
```

in Sprint 3.

Mark them as deprecated in comments/documentation.

Reason:

```text
safe rollout
backward compatibility
existing production records
rollback safety
```

Removal belongs to a later cleanup sprint after production data is migrated and verified.

---

# STEP 31 — LEGACY WRITE POLICY

After Sprint 3:

Structured:

```text
ItemWant[]
```

is canonical.

For temporary compatibility, the app may still populate:

```text
targetCategories
targetDescription
```

from structured wants.

If this is done, keep synchronization in one shared service.

Do not duplicate mapping logic across frontend/API files.

---

# STEP 32 — SHARED WANT SERVICE

Prefer creating reusable domain helpers.

Suggested:

```text
src/lib/wants/
```

Possible files:

```text
validation.ts
normalize.ts
legacy.ts
types.ts
```

Avoid putting all logic into the API route.

---

# STEP 33 — NO JETMATCH YET

Important:

Do not create:

```text
Match model
match score
matching service
recommended users
perfect match
JetMatch UI
```

during this sprint.

This sprint only creates reliable input data.

JetMatch belongs to Sprint 4.

---

# STEP 34 — DATA INTEGRITY TESTS

Test:

### Multiple wants

Item:

```text
iPhone
```

Wants:

```text
Camera
Laptop
PlayStation
```

Expected:

```text
3 ItemWant records
```

---

### Independent wants

Same user:

```text
Item A:
iPhone
Wants Camera

Item B:
Bicycle
Wants PlayStation
```

Expected:

Wants never mix between items.

---

### Ownership

User B attempts to change User A's wants.

Expected:

```text
403
```

---

### Invalid category

Expected:

```text
validation error
```

---

### Excessive want count

More than configured max.

Expected:

```text
400
```

---

# STEP 35 — MIGRATION TESTS

Verify backfill is idempotent.

Run twice.

Expected second run:

```text
0 duplicated records
```

Do not create duplicate wants.

---

# STEP 36 — TRANSACTION TEST

Simulate invalid WANT during Item update.

Expected:

```text
Item core data unchanged
existing wants unchanged
```

No partial write.

---

# STEP 37 — FUNCTIONAL FLOW TEST

Test complete flow:

```text
login
↓
create item
↓
add 2 wants
↓
publish
↓
DB Item exists
↓
DB ItemWant x2 exists
↓
item detail displays both wants
↓
owner edits wants
↓
remove one
↓
add another
↓
reload
↓
updated wants remain correct
```

---

# STEP 38 — BUILD CHECK

Before completion run:

```bash
npm run lint
npm run build
npx tsc --noEmit
npx prisma validate
npx prisma generate
```

If migration was added, also verify it applies successfully in development.

---

# STEP 39 — DO NOT DO

During Sprint 3 DO NOT:

```text
implement JetMatch
calculate match percentages
generate recommendations
implement trade offers
implement messaging
implement reviews
implement JetTrust
implement notifications
implement moderation
implement AI extraction
implement geospatial search
implement swap chains
change Item to Product
upgrade Prisma
change auth architecture
```

---

# STEP 40 — DOCUMENTATION

Create:

```text
docs/sprints/SPRINT_03_REPORT.md
```

Include:

```text
Completed
Modified Files
New Files
Prisma Changes
Migration
Backfill
API Changes
Environment Variables
Tests
Known Limitations
Git Status
```

---

# ACCEPTANCE CRITERIA

Sprint 3 is complete only if:

- `ItemWant` exists as a relational Prisma model
- Item has many ItemWant records
- existing Item data remains intact
- legacy targetCategories remains available
- legacy targetDescription remains available
- existing legacy wants can be backfilled
- backfill is idempotent
- item creation accepts structured wants
- item update supports structured wants
- wants are stored in PostgreSQL
- each item keeps independent wants
- public item detail displays structured wants
- non-owner cannot modify wants
- category relations are valid
- max want count is enforced
- invalid enum values are rejected
- transaction safety exists
- no JetMatch algorithm is implemented
- lint passes
- TypeScript passes
- build passes
- Prisma validate passes
- Prisma generate passes

---

# FINAL REPORT FORMAT

When finished, output:

## Completed

What was implemented.

## Modified Files

List important changed files.

## New Files

List new files.

## Prisma Changes

Explain new model/relation/indexes.

## Migration

Migration name and status.

## Backfill

How legacy WANT data was converted.

## API Changes

Routes and payload changes.

## Environment Variables

New variables, if any.

## Tests

Commands and results.

## Known Limitations

Be explicit.

## Git Status

State whether changes are committed and pushed.

Do not start Sprint 4 automatically.

Wait for explicit instruction.