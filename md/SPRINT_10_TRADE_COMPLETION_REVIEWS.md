# JetSwap Sprint 10 — Trade Completion & Mutual Reviews

## AI AGENT TASK

Implement Sprint 10 only.

Sprint 10 completes the real barter lifecycle:

```text
JetMatch
→ Offer
→ Negotiation
→ Counter Offer
→ ACCEPTED
→ Mutual Contact Reveal
→ Physical Handoff
→ Mutual Completion Confirmation
→ COMPLETED
→ Items TRADED
→ Mutual Reviews
```

This sprint has two major responsibilities:

1. Mutual Trade Completion
2. Mutual Reviews

Do NOT implement JetTrust scoring engine, notifications, disputes, payments, escrow, shipping APIs, AI, badges, gamification, or Swap Chains.

---

# READ FIRST

Completely inspect the actual repository.

Read:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/sprints/SPRINT_06_REPORT.md
docs/sprints/SPRINT_07_REPORT.md
docs/sprints/SPRINT_08_REPORT.md
docs/sprints/SPRINT_09_REPORT.md

prisma/schema.prisma

src/lib/offers/
src/lib/messages/

src/app/api/offers/
src/app/offers/

src/components/offers/

tests/offers.test.ts
tests/messages.test.ts
tests/counter-offers.test.ts
tests/contact-reveal.test.ts
```

Also inspect all Sprint 8.1 concurrency changes currently present on `main`.

Search repository for:

```text
COMPLETED
completedAt
TRADED
Review
review
rating
reviewCount
contactRevealed
senderContactApprovedAt
receiverContactApprovedAt
```

The actual repository is source of truth.

Do not blindly follow assumptions in this document if the current code differs.

Adapt safely.

---

# OBJECTIVE

Implement:

```text
ACCEPTED
+
contactRevealed === true
↓
Trade physically happens
↓
Participant A confirms completion
↓
Participant B confirms completion
↓
TradeOffer = COMPLETED
↓
completedAt = now()
↓
All participating Items = TRADED
↓
Both participants may independently review each other
```

---

# CORE SECURITY PRINCIPLE

One participant must NEVER be able to unilaterally mark the entire trade as completed.

Therefore:

```text
one completion confirmation
≠
COMPLETED
```

Only:

```text
sender confirmed
+
receiver confirmed
=
COMPLETED
```

---

# CONTACT REVEAL REQUIREMENT

Completion confirmation is only available after:

```text
status === ACCEPTED
AND
contactRevealed === true
```

Reason:

The handoff stage must have been reached before completion confirmation.

Do not allow completion directly from:

```text
PENDING
COUNTER_OFFERED
REJECTED
CANCELLED
```

Do not allow completion confirmation on historical revisions.

---

# SCHEMA — COMPLETION CONFIRMATIONS

Existing TradeOffer already contains:

```text
completedAt
```

but does not independently track both parties' completion confirmations.

Add:

```prisma
senderCompletionConfirmedAt   DateTime?
receiverCompletionConfirmedAt DateTime?
```

to `TradeOffer`.

Use timestamps instead of booleans.

Benefits:

```text
auditability
idempotency
future dispute analysis
exact confirmation time
```

---

# REVIEW MODEL — CRITICAL EXISTING PROBLEM

Inspect the actual current Review model.

Historically JetSwap used:

```prisma
model Review {
  id           String      @id @default(cuid())
  offerId      String      @unique
  offer        TradeOffer  @relation(fields: [offerId], references: [id], onDelete: Cascade)

  authorId     String
  author       User        @relation("GivenReviews", fields: [authorId], references: [id], onDelete: Cascade)

  targetUserId String
  targetUser   User        @relation("ReceivedReviews", fields: [targetUserId], references: [id], onDelete: Cascade)

  rating       Int         @default(5)
  comment      String?

  createdAt    DateTime    @default(now())
}
```

`offerId @unique` permits only ONE review per trade.

That is incompatible with mutual reviews.

Both participants must independently be able to review the other.

---

# REVIEW SCHEMA FIX

Remove single-column uniqueness:

```text
offerId @unique
```

and replace it with compound uniqueness:

```prisma
@@unique([offerId, authorId])
```

This means:

```text
same offer + sender review → allowed once
same offer + receiver review → allowed once
third review by same author → blocked
```

Also add useful indexes if necessary:

```prisma
@@index([targetUserId])
@@index([authorId])
```

Do not add unnecessary indexes if equivalent ones already exist.

---

# TRADEOFFER REVIEW RELATION

Because an offer can now contain up to two reviews, inspect the current relation.

If current `TradeOffer` has:

```prisma
review Review?
```

change it to:

```prisma
reviews Review[]
```

Update all affected Prisma queries and TypeScript references.

Search entire repository before changing.

Do not leave stale `review` references.

---

# MIGRATION

Create a real Prisma migration covering:

1. completion confirmation timestamps
2. Review unique constraint change
3. TradeOffer/Review relation-compatible schema updates

Suggested migration name:

```text
add_mutual_trade_completion_and_reviews
```

Do NOT use `prisma db push` as production deployment strategy.

The migration must be compatible with:

```bash
npx prisma migrate deploy
```

---

# MIGRATION DATA SAFETY

Be careful when removing the existing Review uniqueness constraint.

Existing review data, if any, must remain intact.

Do NOT:

```text
drop Review table
truncate Review
delete reviews
reset database
```

Migration should alter constraints safely.

---

# COMPLETION API

Create:

```text
POST /api/offers/[id]/completion-confirmation
```

No participant ID should come from client.

Authenticated session determines who confirms.

Prefer no request body.

---

# COMPLETION AUTHORIZATION

Only:

```text
TradeOffer.senderId
TradeOffer.receiverId
```

may confirm.

Unauthenticated:

```text
401 UNAUTHORIZED
```

Non-participant:

```text
403 FORBIDDEN
```

---

# COMPLETION ELIGIBILITY

Require:

```text
offer.status === ACCEPTED
contactRevealed === true
```

Also verify:

```text
senderContactApprovedAt != null
receiverContactApprovedAt != null
```

if this matches current Sprint 9 architecture.

Do not rely only on client UI.

---

# FIRST COMPLETION CONFIRMATION

Example:

```text
senderCompletionConfirmedAt = now()
receiverCompletionConfirmedAt = null

status = ACCEPTED
completedAt = null
Items = PENDING_TRADE
```

Nothing becomes TRADED yet.

---

# SECOND COMPLETION CONFIRMATION

When second participant confirms, transaction must atomically:

```text
set second confirmation timestamp
set TradeOffer.status = COMPLETED
set TradeOffer.completedAt = now()
set every TradeOfferItem.item.status = TRADED
```

All in one transaction.

---

# CRITICAL ITEM RULE

Only items attached to the accepted final revision are changed to:

```text
TRADED
```

Do not modify items from historical counter-offer revisions unless they are also actually part of the final accepted revision.

Use:

```text
TradeOfferItem
```

of the accepted offer as source of truth.

---

# COMPLETION TRANSACTION

Inside transaction:

1. reload offer
2. verify participant
3. verify ACCEPTED
4. verify contact reveal
5. identify participant role
6. preserve existing confirmation timestamp
7. set missing confirmation timestamp
8. determine whether both confirmations now exist
9. if both exist:
   - verify participating items are still `PENDING_TRADE`
   - set offer `COMPLETED`
   - set `completedAt`
   - set participating items `TRADED`
10. return updated state

---

# IDEMPOTENCY

If participant already confirmed:

calling endpoint again must:

```text
not replace timestamp
not duplicate anything
not error unnecessarily
```

Return current state.

If trade is already `COMPLETED`, participant re-request should return current completed state safely.

Do not change:

```text
completedAt
```

again.

---

# RACE CONDITION

Both users may confirm almost simultaneously.

The final state must always be:

```text
senderCompletionConfirmedAt != null
receiverCompletionConfirmedAt != null
status = COMPLETED
completedAt != null
all final offer items = TRADED
```

No lost update.

Use transaction-safe implementation.

If current Prisma/PostgreSQL transaction strategy requires stronger handling, implement it using repository conventions.

---

# COMPLETION SERIALIZATION

Expose safe viewer-relative state.

Example:

```json
{
  "completion": {
    "available": true,
    "myConfirmation": true,
    "otherConfirmation": false,
    "completed": false,
    "completedAt": null
  }
}
```

After completion:

```json
{
  "completion": {
    "available": true,
    "myConfirmation": true,
    "otherConfirmation": true,
    "completed": true,
    "completedAt": "..."
  }
}
```

Do not expose unnecessary internal timestamps unless required.

---

# UI — TRADE COMPLETION PANEL

Update `/offers/[id]`.

After:

```text
status === ACCEPTED
contactRevealed === true
```

show:

```text
Takası Tamamlama
```

Explanation:

```text
Takas gerçekten gerçekleştikten sonra tamamlandığını onayla.

Takas, yalnızca iki taraf da tamamlandığını onayladığında kapatılır.
```

---

# COMPLETION BUTTON

Use explicit CTA:

```text
Takasın Gerçekleştiğini Onaylıyorum
```

Do NOT use vague:

```text
Tamam
Bitir
Devam
```

---

# COMPLETION CONFIRMATION MODAL

Before action:

```text
Takasın gerçekten gerçekleştiğini onaylıyor musun?

Bu onay, karşı taraf da takası tamamladığını doğruladığında işlemin tamamlanması için kullanılacaktır.
```

Buttons:

```text
Vazgeç
Takas Gerçekleşti
```

---

# FIRST PARTY CONFIRMED UX

If current user confirmed:

```text
Onayın alındı.

Takas, karşı taraf da tamamlandığını onayladığında tamamlanacak.
```

---

# OTHER PARTY CONFIRMED FIRST

If other participant confirmed:

```text
Karşı taraf takasın gerçekleştiğini onayladı.

Takasın tamamlanması için senin onayın bekleniyor.
```

CTA remains available.

---

# COMPLETED UX

When both confirmed:

```text
Takas Tamamlandı
```

Show:

```text
Bu takas her iki taraf tarafından tamamlandı olarak onaylandı.
```

Optionally show:

```text
Tamamlanma tarihi
```

using `completedAt`.

---

# ITEM UI AFTER COMPLETION

Participating items should naturally display:

```text
Takaslandı
```

or existing Turkish equivalent for:

```text
TRADED
```

They must no longer appear as AVAILABLE.

They must not appear in:

```text
JetMatch source selector
CreateOfferModal AVAILABLE list
CounterOfferModal AVAILABLE list
```

Existing status filtering should already enforce this.

Verify via regression tests.

---

# REVIEWS — ELIGIBILITY

Reviews are available only when:

```text
TradeOffer.status === COMPLETED
```

Do not allow reviews on:

```text
PENDING
COUNTER_OFFERED
ACCEPTED
REJECTED
CANCELLED
```

---

# REVIEW PARTICIPANTS

Only sender and receiver of completed offer may review.

Author reviews:

```text
the OTHER participant
```

Server derives:

```text
authorId = authenticated user
targetUserId = other participant
```

Do not accept `authorId` or `targetUserId` from frontend.

---

# REVIEW API

Create:

```text
POST /api/offers/[id]/reviews
```

Suggested body:

```json
{
  "rating": 5,
  "comment": "Ürün anlatıldığı gibiydi, iletişim sorunsuzdu."
}
```

---

# RATING VALIDATION

Require integer:

```text
1
2
3
4
5
```

Reject:

```text
0
6
1.5
NaN
string values
```

unless existing API parser safely converts expected JSON numbers.

Prefer strict validation.

---

# REVIEW COMMENT

Rules:

```text
optional
trimmed
max 1000 characters
```

Empty/whitespace comment becomes:

```text
null
```

or equivalent normalized value.

---

# ZERO CASH IN REVIEWS

Reviews are not a negotiation surface.

Still run:

```text
detectCashKeywords
```

on review comments.

This prevents reviews being used to advertise/request money.

---

# CONTACT FILTER IN REVIEWS

Do not allow reviews to become public contact-sharing surfaces.

Run:

```text
detectContactInfo
```

on review comment regardless of `contactRevealed`.

Reason:

Reviews may eventually be publicly visible on profiles.

Therefore block:

```text
phone
email
WhatsApp
Telegram
social contact solicitation
```

even though the trade participants already exchanged contact information.

---

# ONE REVIEW PER AUTHOR PER OFFER

Enforce with database:

```text
@@unique([offerId, authorId])
```

If duplicate submission occurs:

```text
409 REVIEW_ALREADY_EXISTS
```

Handle Prisma unique constraint cleanly.

---

# REVIEW IMMUTABILITY

Sprint 10 reviews are immutable.

Do NOT implement:

```text
edit review
delete review
reply to review
report review
```

Those may be later moderation features.

---

# REVIEW SERIALIZATION

Safe review fields:

```json
{
  "id": "...",
  "rating": 5,
  "comment": "...",
  "createdAt": "...",
  "author": {
    "id": "...",
    "name": "...",
    "avatar": "..."
  }
}
```

Never expose:

```text
email
phone
password
```

---

# GET REVIEWS

If useful for clean architecture, implement:

```text
GET /api/offers/[id]/reviews
```

It should return reviews for that completed offer to participants.

However profile-level public review exposure is NOT required in Sprint 10.

Primary requirement is completed-offer review display.

---

# REVIEW UI

On `/offers/[id]` after COMPLETED:

If current user has not reviewed:

```text
Deneyimini Değerlendir
```

Explain:

```text
Takas deneyimini değerlendirerek JetSwap topluluğunun daha güvenli hale gelmesine yardımcı ol.
```

---

# REVIEW FORM

Fields:

```text
1–5 star rating
optional comment
submit
```

CTA:

```text
Değerlendirmeyi Gönder
```

---

# REVIEW SUCCESS

After submission:

```text
Değerlendirmen kaydedildi.
```

Display submitted review.

Do not allow second submission.

---

# OTHER PARTICIPANT REVIEW

If the other participant has submitted their review, it may be displayed after completion.

Do NOT reveal whether they have submitted a review before the trade is completed.

---

# REVIEW RETALIATION / BIAS

Preferred UX:

If easy within existing architecture, do not show the other participant's review to the current user until current user has submitted their own review OR a future review window closes.

However this introduces review-window logic.

Therefore Sprint 10 V1 may simply display reviews after submission/completion.

Document this as a known limitation.

Do not build review deadlines in this sprint.

---

# USER RATING AGGREGATES

Current User historically contains:

```text
rating Float
reviewCount Int
```

These values must not become stale.

After successful review creation, update target user's aggregate values transactionally.

---

# AGGREGATE STRATEGY

Do NOT trust frontend values.

After creating review, calculate from database.

Preferred correctness-first approach:

```text
AVG Review.rating
COUNT Review
```

for:

```text
targetUserId
```

Then update:

```text
User.rating
User.reviewCount
```

within the same logical operation/transaction.

Do not calculate:

```text
oldRating + newRating
```

with unsafe floating point shortcuts unless mathematically correct.

Database reviews are source of truth.

---

# INITIAL RATING ISSUE

Current User may default:

```text
rating = 5.0
reviewCount = 0
```

When first real review is submitted:

```text
rating
```

must become actual average.

Example:

First review = 3

Result:

```text
rating = 3.0
reviewCount = 1
```

NOT:

```text
4.0
```

or an average involving the default placeholder 5.

---

# REVIEW TRANSACTION

Review creation should transactionally:

1. load completed offer
2. verify participant
3. derive target user
4. verify no existing review by author
5. validate rating/comment
6. create Review
7. aggregate target user's reviews
8. update User.rating
9. update User.reviewCount
10. return safe review

---

# REVIEW CONCURRENCY

Both users may submit reviews simultaneously.

That is valid.

They target different users.

The architecture must allow:

```text
Review A → B
Review B → A
```

for same offer.

This is the reason `offerId @unique` must be removed.

---

# TRADE COMPLETION AND REVIEW RELATIONSHIP

Review creation must NEVER trigger trade completion.

Completion happens first.

Then reviews.

Correct:

```text
COMPLETED
→ review
```

Wrong:

```text
review
→ COMPLETED
```

---

# CONTACT DATA AFTER COMPLETION

Existing mutually revealed contact information may remain visible to participants on the completed offer.

Do not reset:

```text
contactRevealed
contactRevealedAt
```

when trade completes.

---

# MESSAGE BEHAVIOR AFTER COMPLETION

Sprint 7 currently treats:

```text
COMPLETED
```

as read-only.

Keep that rule.

After completion:

```text
old messages readable
new messages disabled
```

Do not reopen messaging.

---

# ITEM STATUS AFTER COMPLETION

Final accepted offer items:

```text
PENDING_TRADE → TRADED
```

Do not:

```text
ARCHIVED
AVAILABLE
```

them automatically.

---

# FAILED / ABANDONED ACCEPTED TRADE

Do not implement cancellation/dispute after ACCEPTED in Sprint 10 unless current repository already has explicit safe behavior.

This is a future dispute/cancellation workflow.

Do not improvise item rollback.

---

# HISTORICAL REVISIONS

Historical `COUNTER_OFFERED` revisions:

```text
cannot confirm completion
cannot be reviewed
cannot become COMPLETED
```

Only final accepted revision.

---

# COMPLETION STATE SERIALIZATION

Recommended:

```ts
type TradeCompletionState = {
  available: boolean;
  myConfirmation: boolean;
  otherConfirmation: boolean;
  completed: boolean;
  completedAt: string | null;
};
```

Adapt to existing conventions.

---

# REVIEW STATE SERIALIZATION

Recommended viewer-relative state:

```ts
type ReviewState = {
  available: boolean;
  myReview: SerializedReview | null;
  otherReview: SerializedReview | null;
};
```

Do not leak private user data.

---

# DOMAIN ORGANIZATION

Prefer extending existing offer domain rather than creating excessive fragmentation.

Possible:

```text
src/lib/trade-completion/
src/lib/reviews/
```

or repository-consistent equivalent.

Suggested:

```text
src/lib/reviews/
  types.ts
  validation.ts
  serialization.ts
  service.ts
  index.ts
```

Completion may reasonably stay in:

```text
src/lib/offers/
```

if that matches current architecture.

---

# API ROUTES

Expected:

```text
POST /api/offers/[id]/completion-confirmation

GET  /api/offers/[id]/reviews
POST /api/offers/[id]/reviews
```

GET review route may be combined with offer detail serialization if architecture makes separate GET unnecessary.

Do not duplicate data fetching unnecessarily.

---

# API ERROR CODES

Recommended:

```text
UNAUTHORIZED
FORBIDDEN

OFFER_NOT_ACCEPTED
CONTACT_NOT_REVEALED
TRADE_ALREADY_COMPLETED

ITEM_STATE_CONFLICT

OFFER_NOT_COMPLETED

INVALID_RATING
REVIEW_TOO_LONG
REVIEW_ALREADY_EXISTS

CASH_CONTENT_BLOCKED
CONTACT_INFO_BLOCKED
```

Follow existing API response conventions.

---

# COMPLETION ITEM CONFLICT

Before final completion, verify all final offer items are still:

```text
PENDING_TRADE
```

If not:

do not partially complete.

Return conflict such as:

```text
409 ITEM_STATE_CONFLICT
```

The transaction must roll back.

---

# PRIVACY

Review serialization must never expose:

```text
phone
email
password
```

Contact reveal remains restricted to actual trade participants.

Do not make revealed contact information public through review components.

---

# XSS

Review comments render as plain text.

Do not use:

```text
dangerouslySetInnerHTML
```

Do not interpret user HTML.

---

# TESTS — COMPLETION

Create:

```text
tests/trade-completion.test.ts
```

Minimum coverage:

```text
UNAUTHENTICATED
NON_PARTICIPANT_FORBIDDEN

PENDING_CANNOT_CONFIRM
COUNTER_OFFERED_CANNOT_CONFIRM
REJECTED_CANNOT_CONFIRM
CANCELLED_CANNOT_CONFIRM

ACCEPTED_WITHOUT_CONTACT_REVEAL_BLOCKED

SENDER_FIRST_CONFIRMATION
RECEIVER_FIRST_CONFIRMATION

FIRST_CONFIRMATION_DOES_NOT_COMPLETE
FIRST_CONFIRMATION_DOES_NOT_TRADE_ITEMS

SECOND_CONFIRMATION_COMPLETES
COMPLETED_AT_SET
ITEMS_BECOME_TRADED

ONLY_FINAL_REVISION_ITEMS_TRADED

SENDER_IDEMPOTENT
RECEIVER_IDEMPOTENT
COMPLETED_IDEMPOTENT
COMPLETED_AT_NOT_REPLACED

SIMULTANEOUS_CONFIRMATION_SAFE

ITEM_STATE_CONFLICT_ROLLBACK

HISTORICAL_REVISION_BLOCKED

CONTACT_REVEAL_REMAINS_TRUE
MESSAGES_READ_ONLY_AFTER_COMPLETION
```

---

# TESTS — REVIEWS

Create:

```text
tests/reviews.test.ts
```

Minimum coverage:

```text
UNAUTHENTICATED
NON_PARTICIPANT_FORBIDDEN

PENDING_CANNOT_REVIEW
ACCEPTED_CANNOT_REVIEW
COUNTER_OFFERED_CANNOT_REVIEW
REJECTED_CANNOT_REVIEW
CANCELLED_CANNOT_REVIEW

COMPLETED_SENDER_CAN_REVIEW_RECEIVER
COMPLETED_RECEIVER_CAN_REVIEW_SENDER

TWO_REVIEWS_SAME_OFFER_ALLOWED

SAME_AUTHOR_SECOND_REVIEW_BLOCKED

TARGET_DERIVED_SERVER_SIDE

RATING_1_ALLOWED
RATING_5_ALLOWED
RATING_0_BLOCKED
RATING_6_BLOCKED
DECIMAL_RATING_BLOCKED
STRING_RATING_BLOCKED

EMPTY_COMMENT_NORMALIZED
COMMENT_MAX_LENGTH
COMMENT_TOO_LONG_BLOCKED

CASH_CONTENT_BLOCKED
PHONE_BLOCKED
EMAIL_BLOCKED
WHATSAPP_BLOCKED
TELEGRAM_BLOCKED
SOCIAL_CONTACT_BLOCKED

REVIEW_PLAIN_TEXT
PASSWORD_NOT_SERIALIZED
PHONE_NOT_SERIALIZED
EMAIL_NOT_SERIALIZED

FIRST_REVIEW_UPDATES_RATING
SECOND_REVIEW_RECALCULATES_AVERAGE
REVIEW_COUNT_UPDATED

DEFAULT_5_NOT_INCLUDED_IN_REAL_AVERAGE

REVIEW_IMMUTABLE
```

---

# REGRESSION TESTS

Run all existing suites:

```text
tests/contact-reveal.test.ts
tests/counter-offers.test.ts
tests/messages.test.ts
tests/offers.test.ts
tests/jetmatch.test.ts
```

No regressions.

---

# IMPORTANT REVIEW MIGRATION TEST

Verify Prisma permits:

```text
offer X:
  review author A
  review author B
```

but rejects:

```text
offer X:
  review author A
  second review author A
```

This is a critical Sprint 10 acceptance criterion.

---

# UI — MOBILE

Verify:

```text
375px
768px
desktop
```

Completion panel and review form must not overflow.

Star controls must be usable on touch devices.

---

# ACCESSIBILITY

Star rating must not be visual-only.

Use accessible controls with labels such as:

```text
1 yıldız
2 yıldız
3 yıldız
4 yıldız
5 yıldız
```

Keyboard users must be able to select rating.

Completion confirmation must use explicit accessible button text.

---

# NO JETTRUST ENGINE

Do NOT implement:

```text
JetTrust score calculation
trust badges
trust levels
fraud weighting
verification weighting
cancellation penalties
```

The only rating-related update allowed is existing:

```text
User.rating
User.reviewCount
```

based on real reviews.

JetTrust is Sprint 11.

---

# NO NOTIFICATIONS

Do not implement:

```text
push
email
SMS
notification center
```

---

# NO DISPUTE SYSTEM

Do not implement:

```text
dispute
complaint workflow
moderator arbitration
item rollback
```

---

# NO PAYMENT

Zero-cash rule remains.

No:

```text
wallet
escrow
payment
deposit
commission payment
```

---

# NO SHIPPING API

No carrier integration.

---

# NO REVIEW MODERATION

No:

```text
review edit
review delete
review report
admin moderation
```

unless absolutely required to keep existing admin functionality compiling.

---

# FINAL VALIDATION

Run:

```bash
npx tsx tests/trade-completion.test.ts
npx tsx tests/reviews.test.ts

npx tsx tests/contact-reveal.test.ts
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

If a migration validation command already exists in repository, run it as well.

Do not run destructive reset against production data.

---

# ACCEPTANCE CRITERIA

Sprint 10 is complete only if:

- completion requires ACCEPTED offer
- completion requires contact reveal
- sender completion confirmation stored separately
- receiver completion confirmation stored separately
- one confirmation does not complete trade
- one confirmation does not mark items TRADED
- mutual confirmation completes trade
- completedAt set exactly once
- final accepted revision becomes COMPLETED
- only final accepted revision items become TRADED
- completion is transaction-safe
- simultaneous confirmation is safe
- completion is idempotent
- historical revisions cannot complete

- Review `offerId @unique` limitation removed
- compound uniqueness prevents duplicate author review
- two participants can review same offer
- reviews only allowed after COMPLETED
- author derived from session
- target derived server-side
- rating strictly 1–5 integer
- comment optional and bounded
- cash content blocked in reviews
- contact information blocked in reviews
- reviews render as plain text
- no private user fields serialized
- target User.rating updated from actual DB average
- target User.reviewCount updated
- default placeholder rating does not pollute average
- reviews immutable in Sprint 10

- completed items disappear from AVAILABLE flows
- messages become/remain read-only after COMPLETED
- contact reveal remains intact
- completion UI exists
- mutual completion state visible
- review UI exists
- both participants can independently review

- proper migration exists
- completion tests pass
- review tests pass
- Sprint 9 tests pass
- Sprint 8 tests pass
- Sprint 7 tests pass
- Sprint 6 tests pass
- JetMatch tests pass
- TypeScript passes
- lint passes
- production build passes
- Prisma validates

---

# REPORT

Create:

```text
docs/sprints/SPRINT_10_REPORT.md
```

Report:

```text
Completed
Architecture

Schema Changes
Migration

Completion State Machine
Completion Transaction
Concurrency / Idempotency

Item Status Transition

Review Model Changes
Review Uniqueness
Review Validation
Rating Aggregation

Privacy
Zero Cash
Contact Filter

API Routes

UI Components
Mobile / Accessibility

Modified Files
New Files

Tests
Regression Results

Known Limitations

Git Status
```

Explicitly state whether:

```text
Review.offerId @unique
```

was successfully replaced by:

```text
@@unique([offerId, authorId])
```

and whether two reviews on one completed offer were verified.

---

# FINAL RULE

Do not start Sprint 11.

Do not implement JetTrust.

Do not implement notifications.

Do not implement disputes.

Do not implement payment or shipping integrations.

Do not commit/push unless explicitly instructed by the user.

Report results and stop.