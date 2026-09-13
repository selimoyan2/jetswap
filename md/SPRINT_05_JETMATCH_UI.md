# JetSwap Sprint 5 — JetMatch User Experience

## AI AGENT TASK

Implement Sprint 5 only.

Sprint 5 converts the existing JetMatch V1 engine and `/api/jetmatch` endpoint into a production-quality authenticated user experience.

Do NOT redesign the JetMatch scoring engine unless an actual blocking bug is discovered.

Do NOT implement TradeOffer creation, messaging, contact reveal, reviews, JetTrust calculation, Swap Chains, AI matching, notifications, or later sprint functionality.

---

# READ FIRST

Inspect these files before changing anything:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/JETMATCH_V1_SCORING.md
docs/sprints/SPRINT_04_REPORT.md

src/lib/jetmatch/
src/app/api/jetmatch/route.ts

src/app/items/
src/app/profile/items/
src/components/

prisma/schema.prisma
```

Also inspect the site's existing:

```text
header
desktop navigation
mobile navigation
card components
buttons
loading states
empty states
layout
responsive conventions
```

Reuse existing JetSwap design language.

Do not create an unrelated visual system.

---

# OBJECTIVE

Build the first real JetMatch user interface.

Core flow:

```text
User logs in
↓
opens JetMatch
↓
sees own AVAILABLE items
↓
selects an item
↓
JetSwap loads matches
↓
results ranked by JetMatch
↓
user understands WHY each match exists
↓
user opens candidate item
↓
future Offer action is visible but not yet implemented
```

The interface must make JetSwap's core promise understandable:

> Senin eşyan + senin istediğin eşya + karşı tarafın istediği eşya = akıllı takas eşleşmesi.

---

# PRIMARY ROUTE

Create:

```text
/jetmatch
```

Authenticated route.

Unauthenticated visitors should be redirected to the existing login flow.

Do not expose personalized JetMatch results publicly.

---

# PAGE STRUCTURE

Recommended desktop layout:

```text
----------------------------------------------------
JETMATCH
Sana uygun takasları bulduk
----------------------------------------------------

[ My Item Selector ]

[ iPhone 15 Pro ] [ Bicycle ] [ PlayStation ]
        ↑ selected

----------------------------------------------------

Best Matches

[ MATCH CARD ]
[ MATCH CARD ]
[ MATCH CARD ]

----------------------------------------------------
```

Mobile:

```text
JetMatch

Your item
[ horizontal item selector ]

Matches
[ result card ]
[ result card ]
[ result card ]
```

Mobile-first behavior is mandatory.

---

# SECTION 1 — PAGE HEADER

Use:

```text
JetMatch
```

Primary supporting text:

```text
Eşyaların için en uygun takas fırsatlarını keşfet.
```

Optional educational line:

```text
JetMatch, senin aradığın ürünlerle karşı tarafın takas tercihlerini karşılaştırır.
```

Do not overwhelm the header.

---

# SECTION 2 — SOURCE ITEM SELECTOR

Show authenticated user's:

```text
AVAILABLE
```

items only.

Each selectable source Item should display:

```text
image
title
category
status
```

Example:

```text
[ image ]
iPhone 15 Pro
Telefon
Takasa Açık
```

Selected item must be visually obvious.

---

# SOURCE ITEM DATA

Prefer using already available JetMatch grouped response if efficient.

Alternatively use existing:

```text
GET /api/items/mine
```

and then:

```text
GET /api/jetmatch?itemId=...
```

Avoid redundant network requests when possible.

Do not duplicate business rules on the frontend.

---

# DEFAULT SELECTED ITEM

On first load:

Prefer the user's first AVAILABLE item.

If URL contains:

```text
/jetmatch?itemId=...
```

select that item if owned by the current user.

This enables deep linking from:

```text
portfolio
item detail
future notifications
```

---

# INVALID ITEMID

If URL `itemId`:

- does not exist
- belongs to another user
- is not AVAILABLE

do not crash.

Fall back gracefully or show:

```text
Bu ilan için JetMatch kullanılamıyor.
```

Do not expose whether another user's private item exists.

---

# SECTION 3 — MATCH SUMMARY

Above result cards show a compact summary.

Example:

```text
12 eşleşme bulundu

3 Karşılıklı Takas
9 Keşfet
```

Do not fabricate counts.

Use actual API result data.

---

# MATCH TYPE VISUALS

Visually distinguish:

```text
MUTUAL
ONE_WAY
```

Recommended Turkish labels:

```text
MUTUAL
Karşılıklı Eşleşme

ONE_WAY
Keşfet
```

Do not show backend enum names prominently to users.

---

# MUTUAL PRIORITY

MUTUAL results must visually appear more valuable than ONE_WAY.

Possible treatment:

```text
Karşılıklı Eşleşme
✓ Sen onun ürününü istiyorsun
✓ O da senin ürün kategorini istiyor
```

Do not misrepresent exact product preference if matching is category-based.

Use wording such as:

```text
Senin ürün kategorin karşı tarafın takas tercihleriyle eşleşiyor.
```

rather than:

```text
Karşı taraf tam olarak senin iPhone'unu istiyor.
```

unless data actually proves that.

---

# MATCH CARD

Create a reusable component.

Suggested:

```text
src/components/jetmatch/match-card.tsx
```

Each card should contain:

```text
candidate image
candidate title
category
condition
location
owner public summary
match score
match label
match type
top reasons
CTA
```

---

# MATCH CARD LAYOUT

Example:

```text
┌─────────────────────────────────┐
│ [Product Image]                 │
│                                 │
│ Sony A7 III                     │
│ Fotoğraf Makinesi               │
│ İstanbul                        │
│                                 │
│ 96%  Mükemmel Takas             │
│ Karşılıklı Eşleşme              │
│                                 │
│ ✓ Aradığın kategori             │
│ ✓ Karşılıklı takas isteği       │
│ ✓ Aynı şehir                    │
│                                 │
│ [İlanı İncele]                  │
│ [Takas Teklifi Gönder →]        │
└─────────────────────────────────┘
```

However the Offer CTA is not active yet.

---

# OFFER CTA

Sprint 5 does NOT create TradeOffer.

Therefore:

Preferred behavior:

```text
Takas Teklifi Gönder
```

may be:

- disabled with "Yakında"
- replaced with "İlanı İncele"
- or routed only to candidate detail

Do NOT create fake offer behavior.

Do NOT show a successful offer message when no offer exists.

Recommended:

Primary button:

```text
İlanı İncele
```

Secondary disabled CTA:

```text
Takas Teklifi Gönder
Yakında
```

Sprint 6 will implement real offers.

---

# SCORE DISPLAY

Display:

```text
score%
```

Example:

```text
96%
```

Do not recalculate score in frontend.

Use score returned by JetMatch API.

---

# SCORE LABELS

Use backend-provided:

```text
Mükemmel Takas
Güçlü Eşleşme
Uygun Takas
Keşfet
```

Do not independently recreate thresholds in React.

Backend remains source of truth.

---

# SCORE EXPLANATION

Users should understand why they received a match.

Create:

```text
Neden eşleştiniz?
```

Show up to 3 primary reasons directly.

Example:

```text
✓ İki tarafın takas tercihleri karşılıklı uyumlu
✓ Aradığın kategoriyle eşleşiyor
✓ Aynı şehirdesiniz
```

If more reasons exist:

```text
+2 neden daha
```

optional expandable area.

---

# DO NOT DISPLAY POINTS

Do not show internals such as:

```text
CATEGORY_MATCH +15
MUTUAL_WANT +40
```

to standard users.

Reason codes are internal.

Human-readable reason messages are user-facing.

---

# MATCH DETAIL EXPANSION

Each card may include:

```text
Neden bu eşleşme?
```

expand/collapse.

Expanded area may show:

```text
Sen arıyorsun:
Fotoğraf Makinesi

Karşı taraf arıyor:
Telefon

Bu nedenle karşılıklı takas ihtimali yüksek.
```

Use actual matched WANT data if API provides it.

Do not infer nonexistent fields.

---

# MATCH SCORE VISUAL

Use a simple:

```text
circular indicator
progress bar
score badge
```

consistent with existing design.

Do not introduce heavy chart libraries.

---

# SOURCE VS CANDIDATE COMPARISON

For MUTUAL matches, consider a simple exchange visualization:

```text
Senin Eşyan
iPhone 15 Pro

        ↕

Onun Eşyası
Sony A7 III
```

This should make the barter concept immediately understandable.

---

# RESPONSIVE UX

Desktop:

2–3 cards per row depending existing container width.

Tablet:

2 cards.

Mobile:

1 card.

Do not shrink cards into unreadable layouts.

---

# IMAGE FALLBACK

If candidate has no image:

Use the project's existing item/image placeholder.

Do not use broken image tags.

Do not generate fake item photos.

---

# OWNER SUMMARY

Display public fields only.

Example:

```text
Ahmet
İstanbul
★ 4.8
```

Do not expose:

```text
email
phone
private contact details
```

Even if accidentally present in an API object, frontend should not display them.

---

# FILTERS

Add lightweight client/UI filters only where useful.

Recommended:

```text
Tümü
Karşılıklı
Keşfet
```

Optional score filter:

```text
En İyi Eşleşmeler
```

Do not build advanced marketplace search inside JetMatch.

---

# SORTING

Default sorting must preserve backend order.

Do NOT resort differently by default.

Backend JetMatch deterministic ranking is canonical.

Optional UI sorting can be limited to:

```text
En Uygun
En Yeni
```

but only if underlying data supports it.

For Sprint 5, default-only sorting is acceptable.

---

# EMPTY STATE — NO ITEMS

If user has no AVAILABLE Item:

Show:

```text
Henüz JetMatch yapabileceğimiz bir eşyan yok.

Takasa bir eşya eklediğinde sana uygun eşleşmeleri burada göstereceğiz.
```

CTA:

```text
Eşya Ekle
```

Open existing listing creation flow.

---

# EMPTY STATE — NO WANTS

If selected Item has no structured wants:

Show:

```text
Bu eşya için henüz ne istediğini belirtmedin.

JetMatch'in eşleşme bulabilmesi için takas tercihlerini ekle.
```

CTA:

```text
Takas Tercihlerini Düzenle
```

Link to existing item editing flow if available.

Do not display random suggestions.

---

# EMPTY STATE — NO MATCHES

If selected Item has wants but no compatible candidates:

Show:

```text
Şimdilik uygun eşleşme bulamadık.

Yeni ilanlar eklendikçe JetMatch sonuçların değişebilir.
```

Optional suggestions:

```text
Takas tercihlerini biraz esnet
Başka kategori ekle
İlan bilgilerini güncelle
```

Do not automatically modify preferences.

---

# LOADING

Create intentional loading state.

Use:

```text
skeleton cards
```

or project's existing loading pattern.

Avoid:

```text
Loading...
```

as the sole production UI if the project already has richer patterns.

---

# API ERROR

If JetMatch API fails:

Show a safe error state:

```text
JetMatch sonuçları şu anda yüklenemedi.
Tekrar deneyebilirsin.
```

CTA:

```text
Tekrar Dene
```

Never show raw Prisma/API stack traces.

---

# NAVIGATION

Add JetMatch to the authenticated navigation.

Preferred label:

```text
JetMatch
```

Possible icon:

```text
spark / arrows / match
```

Use existing icon system.

Do not add another icon library solely for JetMatch.

---

# MOBILE NAVIGATION

If existing mobile bottom navigation exists, evaluate whether JetMatch deserves a primary position.

Preferred priority:

```text
Ana Sayfa
Keşfet
JetMatch
Portföy
Profil
```

Only adapt if compatible with existing nav structure.

Do not break current navigation.

---

# PORTFOLIO INTEGRATION

In:

```text
/profile/items
```

add JetMatch action to AVAILABLE items.

Example:

```text
JetMatch'i Gör
```

route:

```text
/jetmatch?itemId=<item-id>
```

Do not show this action for:

```text
TRADED
ARCHIVED
```

Potentially hide for `PENDING_TRADE`.

---

# ITEM DETAIL INTEGRATION

If authenticated user is viewing their own AVAILABLE Item:

show:

```text
JetMatch Eşleşmelerini Gör
```

link to:

```text
/jetmatch?itemId=...
```

If viewing another person's item:

do not show personalized owner-only JetMatch action.

---

# HOMEPAGE INTEGRATION

Do NOT turn homepage into JetMatch dashboard.

A small authenticated CTA is acceptable:

```text
JetMatch eşleşmelerini gör
```

But keep homepage primarily marketplace/brand oriented.

---

# AUTHENTICATION

`/jetmatch` is authenticated.

Use the current authentication architecture.

Do not create another auth system.

Do not trust browser-provided user IDs.

---

# API CONTRACT

Use current:

```text
GET /api/jetmatch
GET /api/jetmatch?itemId=...
```

Do not create duplicate matching endpoints without need.

If the UI needs a small missing field:

first evaluate adding it safely to the existing endpoint.

Do not duplicate matcher execution.

---

# CLIENT FETCHING

Follow existing Next.js architecture.

Possible patterns:

```text
server component + authenticated session
client component for selected Item
```

or existing application pattern.

Avoid excessive client-side fetching.

Do not add React Query/SWR unless the repository already uses it.

---

# URL STATE

Selected source item should preferably be reflected in URL:

```text
/jetmatch?itemId=abc
```

This enables:

- refresh persistence
- portfolio deep link
- browser back/forward
- future notifications

Use Next.js navigation correctly.

---

# PRIVACY

Never display:

```text
phone
email
contact unlock status
private messages
```

Sprint 5 is discovery only.

---

# ACCESSIBILITY

Ensure:

- cards are keyboard navigable
- buttons have meaningful labels
- images have alt text
- score is not communicated by color alone
- selected Item is visually and semantically identifiable
- expandable explanations support keyboard usage

---

# VISUAL HIERARCHY

Priority order on card:

1. Candidate Item
2. Match quality
3. Mutual/Discovery state
4. Why it matches
5. Location / condition
6. Owner
7. CTA

Do not bury the actual item under trust badges or metadata.

---

# COPY RULES

Prefer product-oriented Turkish wording.

Use:

```text
Karşılıklı Eşleşme
Mükemmel Takas
Güçlü Eşleşme
Uygun Takas
Keşfet
Neden eşleştiniz?
İlanı İncele
JetMatch'i Gör
```

Avoid technical wording such as:

```text
MUTUAL
ONE_WAY
candidate
rawScore
normalizedScore
ItemWant
```

in normal UI.

---

# MATCH COUNTS

Counts must come from current response.

Example:

```text
7 eşleşme

2 Karşılıklı
5 Keşfet
```

Do not calculate site-wide fake numbers.

---

# OPTIONAL EDUCATIONAL BOX

On first JetMatch screen:

```text
JetMatch nasıl çalışır?

1. Eşyana ne istediğini eklersin.
2. JetSwap uygun ilanları tarar.
3. Karşılıklı takas ihtimali olanları öne çıkarır.
```

Keep short.

Do not create a long tutorial.

---

# TESTING

Add UI/component tests if project test architecture supports them.

At minimum manually/automatically verify:

## Authentication

Unauthenticated `/jetmatch`:

```text
login redirect
```

---

## Own Item Selection

User with 3 AVAILABLE items:

```text
all 3 appear
selection changes JetMatch results
URL itemId updates
```

---

## Mutual Match

MUTUAL result:

```text
Karşılıklı Eşleşme
score
label
reasons
candidate
```

display correctly.

---

## ONE_WAY

ONE_WAY:

```text
Keşfet
```

displayed.

Must never be visually represented as a confirmed reciprocal match.

---

## No Items

Correct empty state.

---

## No Wants

Correct empty state.

---

## No Matches

Correct empty state.

---

## API Error

Retry UI works.

---

## Mobile

Verify at least:

```text
375px
768px
desktop
```

No horizontal overflow.

---

# PERFORMANCE

Do not execute JetMatch separately for every card.

One selected Item:

```text
one JetMatch request
```

should produce all candidates.

Avoid unnecessary refetch loops.

---

# NO OFFER IMPLEMENTATION

Do not create:

```text
POST /api/offers
TradeOffer
accept
reject
counter offer
```

during Sprint 5.

That belongs to Sprint 6.

---

# NO JETTRUST ENGINE

Existing public:

```text
rating
reviewCount
```

may be displayed if already real.

Do not calculate new JetTrust score.

Do not label generic rating as JetTrust.

---

# NO NOTIFICATIONS

Do not implement:

```text
new match notification
email
push
bell counter
```

during Sprint 5.

---

# NO AI

Do not introduce:

```text
LLM
embeddings
vector search
AI recommendations
```

---

# NO DATABASE REDESIGN

Sprint 5 should normally require:

```text
0 Prisma schema changes
0 migrations
```

If a DB change seems necessary, stop and evaluate whether the requirement truly belongs in UI sprint.

---

# FILE ORGANIZATION

Preferred:

```text
src/app/jetmatch/page.tsx

src/components/jetmatch/
  jetmatch-dashboard.tsx
  source-item-selector.tsx
  match-card.tsx
  match-reasons.tsx
  match-summary.tsx
  jetmatch-empty-state.tsx
  jetmatch-loading.tsx
```

Adapt to repository conventions.

Do not create unnecessary micro-components.

---

# ACCEPTANCE CRITERIA

Sprint 5 is complete only if:

- `/jetmatch` exists
- route requires authentication
- authenticated user's AVAILABLE items can be selected
- URL `itemId` deep linking works
- JetMatch API results are rendered
- backend ordering is preserved
- score is displayed
- backend label is displayed
- MUTUAL is visually distinct
- ONE_WAY is shown as discovery, not reciprocity
- human-readable match reasons are displayed
- candidate Item links work
- no private contact information is exposed
- portfolio has JetMatch deep link
- own item detail has JetMatch deep link where appropriate
- no-items empty state works
- no-wants empty state works
- no-matches empty state works
- API-error state works
- retry works
- loading state exists
- mobile layout works
- accessibility basics are satisfied
- no TradeOffer creation exists
- no JetTrust calculation exists
- no AI exists
- no unnecessary Prisma changes exist
- TypeScript passes
- lint passes
- production build passes

---

# FINAL VALIDATION

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
npx prisma validate
```

Also rerun:

```bash
npx tsx tests/jetmatch.test.ts
```

Sprint 5 UI must not break Sprint 4 matcher behavior.

---

# REPORT

Create:

```text
docs/sprints/SPRINT_05_REPORT.md
```

Include:

```text
Completed
UX Architecture
Modified Files
New Files
Routes
JetMatch API Integration
Responsive Behavior
Accessibility
Tests
Database Changes
Known Limitations
Git Status
```

---

# FINAL RULE

Do not start Sprint 6.

Do not implement offers.

Do not commit or push unless explicitly instructed by the user.

When Sprint 5 is complete:

report results and stop.