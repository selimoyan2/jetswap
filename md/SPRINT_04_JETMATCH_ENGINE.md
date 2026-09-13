# JetSwap Sprint 4 — JetMatch V1 Matching Engine

## AI AGENT TASK

Implement Sprint 4 only.

Sprint 4 builds the first real JetMatch matching engine.

Do NOT build the full JetMatch user interface, trade offers, messaging, notifications, reviews, JetTrust scoring, AI matching, or swap chains.

Read first:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md
docs/sprints/SPRINT_03_REPORT.md
prisma/schema.prisma

src/lib/wants/
src/lib/categories.ts
src/lib/prisma.ts
src/lib/require-user.ts

src/app/api/items/
src/app/items/
src/app/profile/items/
```

Inspect the actual repository before modifying anything.

Do not assume the documentation is more current than the source code.

---

# OBJECTIVE

Implement JetMatch V1.

JetMatch must answer:

> "Bu kullanıcının takasa açık eşyası için, diğer kullanıcıların hangi eşyaları uygun takas adayıdır?"

Core flow:

```text
HAVE
↓
WANT
↓
CANDIDATES
↓
RECIPROCAL ANALYSIS
↓
SCORE
↓
EXPLANATIONS
↓
MATCH
```

JetMatch V1 must be:

- deterministic
- explainable
- secure
- queryable
- testable

Do NOT use AI or embeddings yet.

---

# CRITICAL PRECONDITION — SPRINT 3 DATABASE

Before JetMatch implementation, verify that the Sprint 3 `ItemWant` schema exists in the actual development database.

Run:

```bash
npx prisma validate
npx prisma generate
```

Inspect migration state.

If the Sprint 3 migration has not been created yet, create a proper migration.

Preferred development command:

```bash
npx prisma migrate dev --name add-item-wants
```

Do NOT use:

```bash
prisma migrate reset
```

Do not destroy existing data.

If the database schema is already synchronized through another safe method, document the state.

Production must later use:

```bash
npx prisma migrate deploy
```

Do not run destructive production commands.

JetMatch must not be marked complete if the required `ItemWant` table does not exist in the tested database.

---

# CORE DEFINITIONS

## HAVE

An `Item` owned by a user.

Only:

```text
Item.status = AVAILABLE
```

items participate in JetMatch.

---

## WANT

Structured exchange preference:

```text
ItemWant
```

Example:

```text
User A owns:
iPhone 15 Pro

A wants:
Camera
Sony
A7 III
```

---

## CANDIDATE

Another user's AVAILABLE Item that satisfies at least part of an ItemWant.

---

# MATCH TYPES

JetMatch V1 must support two types:

```text
MUTUAL
ONE_WAY
```

Do NOT implement CHAIN during Sprint 4.

---

# MUTUAL MATCH

Example:

```text
User A
HAS: iPhone 15 Pro
WANTS: Camera

User B
HAS: Sony A7 III
WANTS: iPhone
```

This is:

```text
MUTUAL
```

because both sides' WANT preferences can be satisfied.

This is JetSwap's highest-value match.

---

# ONE_WAY MATCH

Example:

```text
User A
HAS: iPhone
WANTS: Camera

User B
HAS: Camera
```

but User B does not specifically request an iPhone.

If B has a sufficiently flexible compatible WANT/open-offer condition, this may become:

```text
ONE_WAY
```

Do not label an arbitrary unrelated item as ONE_WAY.

There must be a defensible compatibility reason.

---

# NEVER MATCH

Never match:

```text
User A Item
↔
another Item owned by User A
```

A user cannot match with themselves.

Also exclude candidates whose status is:

```text
PENDING_TRADE
TRADED
ARCHIVED
```

---

# MATCHING ARCHITECTURE

Create a dedicated domain module.

Recommended:

```text
src/lib/jetmatch/
```

Suggested files:

```text
types.ts
candidate.ts
compatibility.ts
score.ts
explanations.ts
matcher.ts
index.ts
```

Exact file organization may be adapted to existing repository conventions.

Do not put the entire algorithm inside an API route.

---

# STEP 1 — TYPES

Create explicit types.

Conceptually:

```ts
type JetMatchType =
  | "MUTUAL"
  | "ONE_WAY"
```

Create result types containing:

```text
sourceItem
candidateItem
matchType
score
reasons
matchedWant
reciprocalWant
```

Avoid excessive `any`.

---

# STEP 2 — SOURCE ITEM VALIDATION

JetMatch should run only when source Item:

```text
exists
belongs to appropriate context
status = AVAILABLE
has structured wants
```

If the source item has zero `ItemWant` records:

return no structured matches.

Do not fabricate matches from nothing.

Legacy fields may be used only as a documented fallback if structured data is unavailable.

---

# STEP 3 — CANDIDATE DISCOVERY

For each ItemWant belonging to the source Item:

Find candidate items where:

```text
candidate.status = AVAILABLE
candidate.userId != source.userId
```

Primary candidate discovery should begin with:

```text
ItemWant.categoryId
↔
candidate.categoryId
```

This gives a defensible base match.

Do not initially load the entire marketplace into JavaScript if a Prisma query can narrow candidates first.

---

# STEP 4 — CATEGORY COMPATIBILITY

Category is the primary V1 matching signal.

If:

```text
want.categoryId === candidate.categoryId
```

category matches.

If no category relation exists:

do not award category points.

Do not infer category similarity using AI.

---

# STEP 5 — BRAND COMPATIBILITY

If ItemWant has:

```text
brand
```

compare against the candidate Item's actual available brand representation.

IMPORTANT:

Inspect the current Item schema first.

If Item does not currently have a structured `brand` field:

do NOT invent a fake exact brand match.

You may use clearly documented normalized textual comparison against existing structured/text fields only when defensible.

Prefer adding no brand score over pretending a match occurred.

If the existing Item architecture lacks reliable brand/model fields, document this limitation.

---

# STEP 6 — MODEL COMPATIBILITY

Same rule as brand.

If reliable structured model data exists:

normalize and compare.

If it does not exist:

do not award exact model points.

Never claim:

```text
"Model eşleşti"
```

unless the system actually compared reliable model information.

---

# STEP 7 — CONDITION COMPATIBILITY

Use:

```text
ItemWant.minimumCondition
```

and:

```text
Item.condition
```

Define an explicit condition ranking.

Recommended:

```text
BRAND_NEW = 4
LIKE_NEW  = 3
GOOD      = 2
FAIR      = 1
```

Candidate satisfies condition when:

```text
candidateConditionRank >= minimumConditionRank
```

---

# STEP 8 — LOCATION COMPATIBILITY

JetMatch V1 may use structured:

```text
country
city
```

data.

Possible signals:

```text
same city
same country
```

Normalize case and whitespace.

Do not claim actual kilometer distance unless coordinates/geospatial data exist.

---

# STEP 9 — MAX DISTANCE

`ItemWant.maxDistanceKm` exists.

However, Sprint 3 did not implement geospatial coordinates.

Therefore:

Do NOT fake distance calculations.

If reliable coordinates do not exist:

```text
maxDistanceKm
```

must not influence score.

Document this limitation.

Future sprint can add Haversine/geospatial logic.

---

# STEP 10 — FLEXIBILITY

`ItemWant.isFlexible` means:

> The user may consider compatible alternatives within this WANT context.

It does NOT mean:

> The user accepts any random product.

Use flexibility as a modest compatibility signal, not a universal match override.

---

# STEP 11 — RECIPROCAL ANALYSIS

This is the most important part of JetMatch.

After candidate Item B satisfies Item A's WANT:

inspect B's `ItemWant[]`.

Determine whether any WANT belonging to B is compatible with A's source Item.

Conceptually:

```text
A wants B
+
B wants A
=
MUTUAL
```

Otherwise:

```text
A wants B
+
B has defensible flexible compatibility
=
ONE_WAY
```

Do not call it MUTUAL unless both directions are actually evaluated.

---

# STEP 12 — INITIAL SCORING MODEL

Use an explainable 100-point model.

Target scoring architecture:

```text
Reciprocal WANT       40
Category              15
Brand                 10
Model                 10
Condition              5
Location              10
Distance               5
Trust                   5
-------------------------
Maximum               100
```

However, only award points for signals that are actually implemented and backed by reliable data.

---

# STEP 13 — MISSING SIGNALS

Important:

Current data may not support every 100-point component.

Do NOT automatically award missing points.

Example:

If geospatial distance is unavailable:

```text
Distance = 0
```

If JetTrust engine does not exist:

```text
Trust = 0
```

If Item has no reliable brand field:

```text
Brand = 0
```

This may temporarily make scores lower.

That is acceptable.

Accuracy is more important than inflated percentages.

---

# STEP 14 — SCORE NORMALIZATION

Because some V1 signals may be unavailable, implement score calculation so it can expose both:

```text
rawScore
maxAvailableScore
normalizedScore
```

Example:

Available signals total:

```text
80
```

Candidate earns:

```text
70
```

Then:

```text
normalizedScore = round(70 / 80 * 100)
```

This prevents unavailable future signals from unfairly suppressing every result.

BUT:

Do not normalize away the importance of reciprocity.

Mutual matches must remain meaningfully stronger than one-way matches.

Document the exact formula.

---

# STEP 15 — RECIPROCITY FLOOR

A true MUTUAL match should receive a strong score advantage.

Recommended:

```text
reciprocal WANT = +40
```

ONE_WAY must never receive these 40 points.

This is central to JetSwap.

---

# STEP 16 — WANT PRIORITY

Use:

```text
ItemWant.priority
```

as a modest ranking modifier.

Example:

```text
priority 0
highest

priority 1
second

priority 2
third
```

Do not let priority overpower reciprocal compatibility.

Suggested modifier:

```text
priority 0 → +5 ranking bonus
priority 1 → +3
priority 2 → +1
```

If used, clearly separate this from the core compatibility score or document how it affects ranking.

---

# STEP 17 — MATCH LABELS

Produce human-readable labels.

Recommended:

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

Do not hide the numeric score.

---

# STEP 18 — EXPLANATIONS

Every match must include human-readable reasons.

Example MUTUAL:

```json
[
  "Sen fotoğraf makinesi arıyorsun.",
  "Karşı taraf senin ürün kategorinde bir eşya arıyor.",
  "İki tarafın takas tercihleri karşılıklı uyumlu.",
  "Aynı şehirdesiniz.",
  "Ürün durumu minimum beklentiyi karşılıyor."
]
```

Example ONE_WAY:

```json
[
  "Bu ürün aradığın kategoriyle eşleşiyor.",
  "Karşı taraf benzer tekliflere açık.",
  "Ürün durumu beklentini karşılıyor."
]
```

Do not expose internal scoring implementation unnecessarily.

---

# STEP 19 — STRUCTURED REASONS

Internally prefer structured reasons.

Example:

```ts
{
  code: "MUTUAL_WANT",
  points: 40,
  message: "İki tarafın takas tercihleri karşılıklı uyumlu."
}
```

Possible codes:

```text
MUTUAL_WANT
CATEGORY_MATCH
BRAND_MATCH
MODEL_MATCH
CONDITION_MATCH
SAME_CITY
SAME_COUNTRY
FLEXIBLE_WANT
PRIORITY_WANT
```

This will make future UI and analytics easier.

---

# STEP 20 — DETERMINISM

Given the same database state:

JetMatch must produce the same:

```text
candidate order
scores
match types
reasons
```

Do not introduce random ranking.

Use deterministic tie-breakers.

Suggested:

```text
score DESC
matchType priority
createdAt DESC
id ASC
```

---

# STEP 21 — DUPLICATES

A candidate Item may satisfy multiple wants.

Do not return the same:

```text
sourceItem ↔ candidateItem
```

pair multiple times.

Merge compatible signals.

Use the best matching WANT as primary and optionally retain additional matched WANT IDs.

---

# STEP 22 — MATCH PERSISTENCE

Inspect whether a `Match` model already exists.

If the current real JetSwap schema does NOT contain a suitable Match model:

Do not blindly copy one from an older repository.

For Sprint 4, computed-on-demand JetMatch results are acceptable.

Preferred V1:

```text
request
↓
query
↓
compute
↓
return
```

Persistence can be added later when scale/notifications require it.

If an appropriate existing Match model exists, evaluate whether using it adds value without unnecessary complexity.

Document the decision.

---

# STEP 23 — JETMATCH SERVICE API

Create:

```text
GET /api/jetmatch
```

Authenticated only.

Default behavior:

return matches for the authenticated user's AVAILABLE items.

Optional query:

```text
?itemId=...
```

to calculate matches for one owned item.

---

# STEP 24 — OWNERSHIP

If:

```text
GET /api/jetmatch?itemId=X
```

then:

```text
X.userId
```

must equal:

```text
session.user.id
```

Otherwise:

```text
403
```

Do not allow users to run private personalized JetMatch as another user.

---

# STEP 25 — API RESPONSE

Suggested response:

```json
{
  "success": true,
  "data": {
    "sourceItem": {
      "id": "...",
      "title": "iPhone 15 Pro"
    },
    "matches": [
      {
        "candidateItem": {
          "id": "...",
          "title": "Sony A7 III",
          "images": [],
          "condition": "GOOD",
          "city": "İstanbul"
        },
        "matchType": "MUTUAL",
        "score": 94,
        "label": "Mükemmel Takas",
        "reasons": [
          {
            "code": "MUTUAL_WANT",
            "message": "İki tarafın takas tercihleri karşılıklı uyumlu."
          }
        ]
      }
    ]
  }
}
```

Adapt to existing API response conventions.

---

# STEP 26 — MULTIPLE SOURCE ITEMS

When no `itemId` is supplied:

JetMatch may return grouped results:

```json
{
  "items": [
    {
      "sourceItem": {},
      "matches": []
    }
  ]
}
```

Only include authenticated user's:

```text
AVAILABLE
```

items.

---

# STEP 27 — RESULT LIMIT

Prevent unbounded responses.

Suggested:

```text
20 matches per source item
```

Optional:

```text
?limit=20
```

Maximum:

```text
50
```

---

# STEP 28 — PRIVACY

Candidate response may include public information such as:

```text
user id
display name
avatar
city
public reputation summary if already public
```

Never expose:

```text
password
email
phone
private contact details
```

Contact information remains locked until later trade workflow.

---

# STEP 29 — CASH RULE

JetMatch should only operate on valid marketplace items.

Do not add monetary values to matching.

Do not introduce:

```text
price similarity
cash difference
price balancing
```

JetSwap remains:

```text
Para Yok. Takas Var.
```

---

# STEP 30 — VALUE TIER

Current Item may contain:

```text
valueTier
```

Do not make this the dominant matching signal.

If used in V1:

use only as a small compatibility/tie-break signal.

Do not expose monetary interpretation.

Example:

```text
LOW
MEDIUM
HIGH
PREMIUM
```

represents broad exchange tier, not price.

Do not convert tiers into currency.

---

# STEP 31 — PERFORMANCE

Avoid N+1 query explosions.

Do not query the database separately for every candidate WANT if avoidable.

Prefer:

```text
Prisma include/select
category filtering
batched candidate queries
Map-based in-memory indexing
```

for the candidate set.

JetMatch V1 should remain understandable.

Do not prematurely introduce:

```text
Redis
Elasticsearch
Kafka
background workers
vector database
```

---

# STEP 32 — NORMALIZATION

Create reusable text normalization for fields such as:

```text
brand
model
city
country
```

At minimum:

```text
trim
lowercase
locale-safe comparison
```

For Turkish strings, ensure comparisons do not break on common:

```text
I / İ / ı / i
```

cases.

Do not implement fuzzy AI matching yet.

---

# STEP 33 — TEST DATA

Create deterministic development fixtures or test builders if needed.

Minimum scenarios:

### Scenario A — Perfect reciprocal category match

```text
A:
HAS Phone
WANTS Camera

B:
HAS Camera
WANTS Phone
```

Expected:

```text
MUTUAL
```

---

### Scenario B — One-way compatible match

```text
A:
HAS Phone
WANTS Camera

B:
HAS Camera
WANT compatible/flexible alternative
```

Expected:

```text
ONE_WAY
```

only if B's structured WANT legitimately allows it.

---

### Scenario C — No compatibility

```text
A:
WANTS Camera

B:
HAS Sofa
```

Expected:

```text
no match
```

---

### Scenario D — Same owner

```text
A owns Phone
A owns Camera
```

Expected:

```text
no match between them
```

---

### Scenario E — Archived

Candidate:

```text
ARCHIVED
```

Expected:

```text
excluded
```

---

### Scenario F — Traded

Candidate:

```text
TRADED
```

Expected:

```text
excluded
```

---

# STEP 34 — RECIPROCAL TEST

Critical test:

```text
A ItemWant.categoryId = CAMERA
B Item.categoryId = CAMERA

B ItemWant.categoryId = PHONE
A Item.categoryId = PHONE
```

Expected:

```text
matchType = MUTUAL
MUTUAL_WANT reason exists
reciprocity points awarded
```

---

# STEP 35 — CONDITION TEST

Want:

```text
minimumCondition = GOOD
```

Candidate:

```text
LIKE_NEW
```

Expected:

```text
condition match
```

Candidate:

```text
FAIR
```

Expected:

```text
condition does not satisfy minimum
```

Decide whether failing minimum condition:

```text
removes candidate
```

or:

```text
removes condition points
```

Recommended:

If minimumCondition is explicitly set, treat it as a hard constraint.

Document this decision.

---

# STEP 36 — LOCATION TEST

Want:

```text
country = TR
city = İstanbul
```

Candidate:

```text
TR / İstanbul
```

Expected:

```text
same city signal
```

Candidate:

```text
TR / Ankara
```

Expected:

```text
same country may score
same city must not score
```

---

# STEP 37 — SECURITY TEST

Unauthenticated:

```text
GET /api/jetmatch
```

Expected:

```text
401
```

Authenticated user requesting another user's item:

```text
GET /api/jetmatch?itemId=OTHER_USER_ITEM
```

Expected:

```text
403
```

---

# STEP 38 — EMPTY STATES

If user has no AVAILABLE items:

Return:

```text
success = true
items = []
```

Do not return server error.

If Item has no wants:

Return:

```text
matches = []
```

with optional reason:

```text
NO_WANTS
```

---

# STEP 39 — ERROR HANDLING

Handle:

```text
invalid itemId
item not found
unauthenticated
forbidden
invalid limit
database error
```

Do not expose raw Prisma errors.

---

# STEP 40 — OPTIONAL MINIMAL DEBUG PAGE

A full JetMatch UI belongs to Sprint 5.

However, if necessary for development verification, a minimal authenticated diagnostic page may be created:

```text
/dev/jetmatch
```

or equivalent.

It must NOT become the final product UI.

If API tests are sufficient, skip this page.

---

# STEP 41 — ANALYTICS READINESS

Do not integrate GA4 yet.

But keep service outputs capable of later generating:

```text
jetmatch_generated
jetmatch_viewed
```

events.

Do not couple matcher logic to analytics.

---

# STEP 42 — UNIT TESTABLE FUNCTIONS

Core scoring logic should be pure where practical.

Example:

```text
calculateConditionCompatibility()
calculateLocationCompatibility()
calculateReciprocity()
calculateMatchScore()
buildMatchReasons()
```

This allows reliable testing without HTTP requests.

---

# STEP 43 — NO AI

Do NOT call:

```text
OpenAI
Gemini
Claude
embeddings
LLM
vector search
```

for matching in Sprint 4.

JetMatch V1 is deterministic.

AI may later improve:

```text
brand/model extraction
semantic category similarity
description understanding
```

but not now.

---

# STEP 44 — NO SWAP CHAIN

Do not implement:

```text
A → B → C → A
```

Do not create:

```text
SwapChain
ChainParticipant
graph traversal
```

during Sprint 4.

---

# STEP 45 — NO TRADE OFFERS

Do not implement:

```text
TradeOffer creation
counteroffer
accept/reject
```

in this sprint.

The JetMatch API may return future CTA metadata such as:

```text
canOffer: true
```

but must not create an offer.

---

# STEP 46 — MATCH QUALITY SAFETY

Do not prioritize number of results over relevance.

Better:

```text
3 defensible matches
```

than:

```text
50 random products
```

Never return arbitrary products simply to avoid an empty result.

---

# STEP 47 — DOCUMENT SCORING

Create:

```text
docs/JETMATCH_V1_SCORING.md
```

Document:

- candidate rules
- mutual definition
- one-way definition
- hard constraints
- score weights
- normalization
- unavailable signals
- tie-breaking
- limitations

This document becomes the canonical V1 matching specification.

---

# STEP 48 — SPRINT REPORT

Create:

```text
docs/sprints/SPRINT_04_REPORT.md
```

Include:

```text
Completed
Architecture
Modified Files
New Files
API
Scoring
Match Types
Database Changes
Migration Status
Tests
Performance Notes
Known Limitations
Git Status
```

---

# ACCEPTANCE CRITERIA

Sprint 4 is complete only if:

- Sprint 3 ItemWant DB schema is actually usable
- JetMatch exists as a dedicated domain service
- candidate discovery uses structured ItemWant data
- only AVAILABLE items participate
- same-owner items are excluded
- MUTUAL matching works
- ONE_WAY matching has defensible rules
- condition constraints work
- category matching works
- location signals work without fake distance
- unavailable signals do not receive fake points
- scoring is deterministic
- scores are explainable
- structured reason codes exist
- duplicate candidate pairs are removed
- `/api/jetmatch` exists
- API requires authentication
- `itemId` ownership is enforced
- response does not expose private contact information
- result limits exist
- no AI matching is implemented
- no trade offer logic is implemented
- no Swap Chain is implemented
- `docs/JETMATCH_V1_SCORING.md` exists
- lint passes
- TypeScript passes
- build passes
- Prisma validate passes
- Prisma generate passes

---

# FINAL VALIDATION

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate
npx prisma generate
```

Run JetMatch tests covering at minimum:

```text
MUTUAL
ONE_WAY
NO_MATCH
SAME_OWNER
ARCHIVED
TRADED
CONDITION
LOCATION
UNAUTHORIZED
FORBIDDEN
DUPLICATE_PREVENTION
DETERMINISTIC_ORDERING
```

---

# FINAL REPORT FORMAT

When finished report:

## Completed

## Architecture

## Modified Files

## New Files

## API

## Scoring Formula

## Match Types

## Database / Migration Status

## Tests

## Known Limitations

## Git Status

Do not start Sprint 5 automatically.

Do not commit/push unless explicitly instructed by the user.

Wait for the next instruction.