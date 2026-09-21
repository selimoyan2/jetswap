# JETSWAP — HOMEPAGE MARKETPLACE REAL DATA MIGRATION & MOCK DATA REMOVAL REPORT

**Repository**: `selimoyan2/jetswap`  
**Author**: Antigravity Assistant  
**Date**: September 21, 2026  
**Status**: Completed & Verified  

---

## Executive Summary

The homepage marketplace section (*Canlı Takas Pazarı / Güncel Takas İlanları*) has been fully migrated from hardcoded demo inventory (`mockItems`, Caner Demir, Fender Stratocaster, static 96/100 JetTrust, 18 completed swaps, fake 1840/1420 category counts) to the PostgreSQL database via Prisma ORM.

All marketplace listings, category tallies, JetTrust scores, and time-based filtering now originate exclusively from authentic database models (`Item`, `Category`, `User`, `ItemWant`). In accordance with the Zero-Mock-Fallback invariant, whenever zero records match or a query yields no items, the platform displays a localized, truthful empty state rather than injecting synthetic demo content.

---

## 1. Forensic Audit & Root Cause Analysis

During the forensic audit, five distinct leakage points of demo/mock data were identified:

1. **`src/app/page.tsx` Initial State**:
   - `const [items, setItems] = useState<TradeItem[]>(mockItems)`: The component was initialized directly with `mockItems`.
   - The fetch logic in `useEffect` only updated state if `data.data.length > 0`. If the database was empty or returned zero rows, `items` remained stuck on `mockItems`.
   - The item mapping within `page.tsx` contained hardcoded placeholders (`matchScore: 90`, `jetTrust: 75`, `daysAgo: 0`).
2. **`src/app/api/categories/route.ts` Mock Fallback**:
   - Imported `categories as defaultCategories from '@/data/mockData'` and returned `defaultCategories` containing fake static counts (`Telefon: 1840`, `Bilgisayar: 1420`, `Kamera: 680`, `Oyun: 890`).
3. **`src/components/category-bar.tsx` Direct Import**:
   - Imported `categories` directly from `@/data/mockData` instead of receiving dynamic database records.
4. **`src/components/smart-match-alert.tsx` Hardcoded Mock Entities**:
   - Rendered `mockItems[0]` (Fender Stratocaster) and `mockMyPortfolio[0]` with Caner Demir.
5. **`src/components/hero.tsx` Category Select**:
   - Populated the category dropdown by importing `categories` from `mockData.ts`.

---

## 2. Data Model Alignment: `Item` vs `Product`

- **Single Model of Truth**: The Prisma schema defines `model Item`, which represents all trade listings on JetSwap. There is **no** `Product` model.
- **Relational Integrity**:
  - `Item` belongs to `User` (`userId -> User.id`) and `Category` (`categoryId -> Category.id`).
  - Structured trade desires are normalized in `ItemWant` (`itemId -> Item.id`).
  - Legacy barter preferences remain backward-compatible through `targetCategories: String[]` and `targetDescription: String`.
- **Zero Schema Drift**: No duplicate listing tables were introduced; the existing `Item` model serves as the canonical source for both individual item pages and marketplace feeds.

---

## 3. Database Query & Count Architecture

In `src/app/api/categories/route.ts`:
```ts
const dbCategories = await prisma.category.findMany({
  include: {
    _count: {
      select: {
        items: {
          where: { status: 'AVAILABLE' }
        }
      }
    }
  },
  orderBy: { nameTr: 'asc' }
})
```
- **Active Only**: Items with status `PENDING_TRADE`, `TRADED`, or `ARCHIVED` are strictly excluded from category counts.
- **Zero Hardcoded Numbers**: If a category has zero available items, it displays `0`, eliminating numbers like 1840, 1420, etc.

---

## 4. Production Users: Selim Oyan & Ali Burak Oyan

- Active listings created by real users (including Selim Oyan, Ali Burak Oyan, and system users) now render dynamically in the homepage marketplace feed through `GET /api/items`.
- Listings are sorted with `orderBy: { createdAt: 'desc' }`, ensuring that recently posted listings appear at the top.
- No user accounts or item IDs are hardcoded; all user metadata (name, avatar, location, rating) is resolved directly from `User`.

---

## 5. Authentic JetTrust Resolution & Scoring

- **Engine Integration**: Each item's seller trust score is resolved via `getJetTrustForUser(userId)` from `src/lib/jettrust/service.ts`.
- **Batch Resolution**: To eliminate N+1 query bottlenecks, `GET /api/items` extracts the distinct `userId` set from the returned batch and computes scores in parallel.
- **Dynamic Signals**: Scores (0–100) are synthesized from:
  1. Account Foundation (age in days).
  2. Profile Completeness (name, email, phone, avatar, bio, location).
  3. Completed Swaps (deduplicated trade revision chains).
  4. Real Review Reputation.
  5. Trade Reliability (completion vs. cancellation ratio).
- **No Hardcoding**: Synthetic ratings (such as Caner Demir's 96/100 or default 75) have been replaced with real database signals.

---

## 6. JetMatch Calculation vs. Suppression Rules

- **Strict Visibility Rule**: The `% JetMatch` badge on `ItemCard` is rendered **only** when a valid, positive compatibility score exists:
  ```tsx
  {typeof item.matchScore === 'number' && item.matchScore > 0 && (
    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-white flex items-center gap-1 shadow-xs">
      <Sparkles className="w-2.5 h-2.5" />
      %{item.matchScore} JetMatch
    </span>
  )}
  ```
- **SmartMatch Alert**: When a user is not logged in or has no mutual trade match in the database, `SmartMatchAlert` returns `null` (clean hide), removing fake demo pairs.

---

## 7. Category Count Accuracy

- Categories are dynamically retrieved from PostgreSQL and passed from `page.tsx` down to `<CategoryBar>` and `<Hero>`.
- Counts reflect only available inventory:
  - Phone & Mobile: 0 (or real active count)
  - Computers & Tech: 0 (or real active count)
  - Cameras & Drones: 0 (or real active count)
  - Gaming & Consoles: 0 (or real active count)

---

## 8. Filtering Behavior

- **Status Filter**: Enforces `where: { status: 'AVAILABLE' }`. Inactive, traded, and archived items never appear in the public feed.
- **Location Filter**: Handled at the city level (`Item.city` / `User.city`). Searches use case-insensitive substring matching without inventing fake GPS coordinates.
- **Time Filter (`timeScope`)**:
  - `today`: `createdAt >= startOfToday`
  - `yesterday`: `createdAt >= startOfYesterday && createdAt < startOfToday`
  - `7days`: `createdAt >= now - 7 days`
  - `30days`: `createdAt >= now - 30 days`
  - `all`: Unrestricted timestamp range
- **Search Query**: Multi-field case-insensitive search across `title`, `description`, `targetDescription`, `wants.brand`, `wants.model`, and `wants.keywords`.

---

## 9. Sponsored Layout Preservation

- `AdBanner` slots (`slot_top_leaderboard` and `slot_grid_infeed`) remain layout containers for Google Ads / sponsorship banners.
- Ad slots are rendered as independent layout elements and are **never** counted as trade items in `scopeCounts` or `filteredItems.length`.

---

## 10. Truthful Localized Empty State

When 0 items match active filters:
- **Turkish (`tr`)**:
  - Title: *"Aktif Takas İlanı Bulunamadı"*
  - Description: *"Bu filtrelere uygun aktif takas ilanı bulunamadı."*
- **English (`en`)**:
  - Title: *"No Active Swap Listings Found"*
  - Description: *"No active swap listings match these filters."*
- Includes a reset button (*"Tüm Filtreleri Temizle"* / *"Reset All Filters"*) that resets all filters.

---

## 11. Security & Sensitive Data Protection

- Contact information (`User.phone`, `User.email`, `password`) is never exposed in `/api/items`, `/api/categories`, or the public feed.
- User objects returned to the frontend select only public-safe fields: `id`, `name`, `avatar`, `rating`, `reviewCount`, `city`, `country`, `createdAt`, `jetTrust`, `completedSwaps`, `verifiedSwapper`.

---

## 12. Performance & Latency Optimizations

- **Indexed Queries**: Relies on Prisma foreign-key indexes on `userId`, `categoryId`, `status`, and `createdAt`.
- **Parallel Promise Execution**: Counts, item listing queries, and category summaries are fetched concurrently with `Promise.all`.
- **User Trust Deduplication**: JetTrust scores are batched per unique `userId` to avoid duplicate database lookups.
- **Pagination**: Default limit capped at 50 with `skip` and `take` support.

---

## 13. Image & Avatar Fallback Mechanisms

- **Image Fallback**: If an item has empty or missing images, `ItemCard` renders a styled placeholder box featuring the Lucide `Package` icon and localized text (*"Görsel Yok"* / *"No Image"*).
- **Avatar Fallback**: If a user lacks an avatar URL, `ItemCard` renders an avatar circle containing the user's initial (e.g., "S", "A") with emerald styling.

---

## 14. Zero Mock Fallback Policy in Production

- The entire public marketplace feed, category counts, and SmartMatch surfaces operate on a strict Zero-Mock policy.
- No network error, empty query, or database exception will fall back to `mockItems` or `defaultCategories`.
- All fallback code paths return `[]` and present the truthful empty state.

---

## 15. Automated Test Suite Results

A dedicated automated test suite (`tests/marketplace.test.ts`) was created and executed alongside existing suites:

| Test Suite | Commands | Status | Details |
|---|---|---|---|
| **Marketplace Real Data & Integrity** | `npx tsx tests/marketplace.test.ts` | **35 / 35 PASS** | Zero mockItems in components, real DB categories, active status filtering, real JetTrust, date boundaries, empty state i18n |
| **Theme Foundation** | `npx tsx tests/theme.test.ts` | **29 / 29 PASS** | Light default, Dark toggle, cookie contract, SSR FOUC prevention |
| **Internationalization (i18n)** | `npx tsx tests/i18n.test.ts` | **67 / 67 PASS** | 752 translation keys with 1:1 parity between TR & EN |
| **Trade Offers Lifecycle** | `npx tsx tests/offers.test.ts` | **49 / 49 PASS** | Barter offers, zero-cash check, contact reveal, conflict resolution |
| **TypeScript Validation** | `npx tsc --noEmit` | **0 Errors** | Strict type safety across all modified files |
| **Next.js Production Build** | `npm run build` | **SUCCESS** | All 38 routes compiled and optimized cleanly |

---

## 16. Verification Checklist & Sign-Off

- [x] Zero occurrences of `mockItems` in `src/app/page.tsx`
- [x] Zero occurrences of `mockItems` in `src/components/item-card.tsx`
- [x] Zero occurrences of `categories` mock in `src/components/category-bar.tsx`
- [x] Zero occurrences of `categories` mock in `src/components/hero.tsx`
- [x] `src/components/smart-match-alert.tsx` clean-hides for guests or when no mutual match exists
- [x] Real category item counts count only `status: 'AVAILABLE'` items
- [x] Real JetTrust score and completed swaps are mapped dynamically via `getJetTrustForUser`
- [x] Localized empty states match requirements in both Turkish and English
- [x] Next.js production build (`npm run build`) succeeds with zero errors
- [x] Zero destructive database operations (`migrate reset`, `db push`, `DROP`, `TRUNCATE`)
