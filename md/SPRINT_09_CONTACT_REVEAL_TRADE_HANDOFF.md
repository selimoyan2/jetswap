# JetSwap Sprint 9 — Contact Reveal & Trade Handoff

## AI AGENT TASK

Implement Sprint 9 only.

Sprint 9 introduces controlled mutual contact reveal after a trade offer has been ACCEPTED.

Core principle:

```text id="u7xx1q"
ACCEPTED
does NOT automatically mean
CONTACT REVEALED
```

Both participants must explicitly approve contact sharing.

Only after:

```text id="3fwygx"
sender approved
+
receiver approved
```

may:

```text id="p1v4uw"
contactRevealed = true
contactRevealedAt = now()
```

be set.

Do NOT implement trade completion, reviews, JetTrust, notifications, payments, AI, shipping integrations, escrow, or Swap Chains.

---

# READ FIRST

Completely inspect:

```text id="qk2uxm"
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/sprints/SPRINT_06_REPORT.md
docs/sprints/SPRINT_07_REPORT.md
docs/sprints/SPRINT_08_REPORT.md

prisma/schema.prisma

src/lib/offers/
src/lib/messages/

src/app/api/offers/
src/app/offers/

src/components/offers/
src/components/messages/

src/lib/contactFilter.ts
src/lib/cashFilter.ts

tests/offers.test.ts
tests/messages.test.ts
tests/counter-offers.test.ts
```

Also inspect the Sprint 8.1 concurrency hotfix currently on `main`.

Use actual repository state as source of truth.

---

# OBJECTIVE

Implement:

```text id="d4r0jy"
Offer
↓
Negotiation
↓
Counter offers
↓
Final revision ACCEPTED
↓
Trade Handoff
↓
Participant A approves contact sharing
↓
Participant B approves contact sharing
↓
Contact information unlocked
↓
Users arrange meeting / shipping
```

Sprint 9 stops here.

---

# IMPORTANT SECURITY PRINCIPLE

Never automatically reveal contact details when:

```text id="c4uvx8"
TradeOffer.status = ACCEPTED
```

Acceptance means:

```text id="w98nff"
Takas şartları kabul edildi.
```

Contact reveal means:

```text id="y06pkl"
Her iki taraf da iletişim bilgilerinin paylaşılmasını ayrıca onayladı.
```

These are separate actions.

---

# CURRENT SCHEMA

Existing `TradeOffer` already contains:

```text id="kwwf10"
contactRevealed
contactRevealedAt
```

These fields represent final contact unlock state.

However, mutual approval requires tracking each participant's approval separately.

---

# SCHEMA CHANGE

Add explicit approval timestamps.

Recommended:

```prisma id="ppf8rv"
senderContactApprovedAt   DateTime?
receiverContactApprovedAt DateTime?
```

to:

```text id="blfyxp"
TradeOffer
```

Do NOT store this only in frontend/local state.

Database is source of truth.

---

# WHY TIMESTAMPS

Prefer:

```text id="xrm9pq"
DateTime?
```

instead of simple booleans because timestamps provide:

```text id="d0wif8"
auditability
when approval happened
whether approval exists
future moderation evidence
```

Approval exists when timestamp is non-null.

---

# MIGRATION

Create proper Prisma migration.

Suggested name:

```text id="ecy95h"
add_contact_reveal_approvals
```

Do NOT use `prisma db push` as production migration strategy.

Run:

```bash id="yewfkn"
npx prisma validate
npx prisma generate
```

---

# ELIGIBLE OFFER

Contact sharing may only be requested/approved when:

```text id="wuw6hb"
TradeOffer.status === ACCEPTED
```

Do NOT allow contact approval on:

```text id="8n99ab"
PENDING
COUNTER_OFFERED
REJECTED
CANCELLED
COMPLETED
```

---

# REVISION RULE

Only the actual:

```text id="mkggqo"
ACCEPTED revision
```

of a counter-offer chain may unlock contacts.

Historical:

```text id="q31q7v"
COUNTER_OFFERED
```

revisions must never expose contact details.

---

# PARTICIPANT RULE

Only:

```text id="90xuv4"
TradeOffer.senderId
TradeOffer.receiverId
```

may approve contact sharing.

Other users:

```text id="kbtxa1"
403 FORBIDDEN
```

Unauthenticated:

```text id="ujyc8x"
401 UNAUTHORIZED
```

---

# APPROVAL API

Create:

```text id="9n23dx"
POST /api/offers/[id]/contact-approval
```

No participant ID is accepted from frontend.

Authenticated session determines who is approving.

Suggested body:

```json id="zns99r"
{
  "approved": true
}
```

For Sprint 9, approval can be irreversible.

Therefore an even simpler endpoint without body is acceptable:

```text id="zg7wd4"
POST /api/offers/[id]/contact-approval
```

Preferred: one-way explicit approval.

Do not implement withdrawal unless there is a strong existing product requirement.

---

# APPROVAL LOGIC

Inside transaction:

1. load offer
2. verify authenticated participant
3. verify `status === ACCEPTED`
4. determine whether user is sender or receiver
5. set appropriate approval timestamp if null
6. check both approval timestamps
7. if both exist:
   - `contactRevealed = true`
   - `contactRevealedAt = now()`
8. return updated safe state

---

# IDEMPOTENCY

Repeated approval from same participant must be safe.

Example:

```text id="i95hse"
senderContactApprovedAt already exists
```

Calling endpoint again:

```text id="b63h2f"
must not create error
must not reset timestamp
must not duplicate anything
```

Return current state.

---

# MUTUAL APPROVAL

Example:

Initial:

```text id="lshl43"
senderApproved = false
receiverApproved = false
contactRevealed = false
```

Sender approves:

```text id="d39tsb"
senderApproved = true
receiverApproved = false
contactRevealed = false
```

Receiver approves:

```text id="mz3qwj"
senderApproved = true
receiverApproved = true
contactRevealed = true
```

---

# CONTACTREVEALEDAT

Set:

```text id="06fjg6"
contactRevealedAt
```

only once.

Do not update it on repeated requests.

---

# CONTACT INFORMATION SOURCE

User currently has:

```text id="drg1k0"
phone
email
```

Potentially other public/profile information may exist.

Sprint 9 reveal only explicitly approved contact fields.

Preferred initial fields:

```text id="t43exn"
phone
email
```

Do not automatically expose:

```text id="73zb1a"
password
private metadata
admin fields
internal IDs beyond necessary API use
```

---

# CONTACT DATA AVAILABILITY

A user may not have a phone number.

The UI must gracefully handle:

```text id="ob37ag"
phone = null
```

Example:

```text id="9gzbys"
Telefon bilgisi eklenmemiş.
```

Email may still be available.

---

# PRIVACY SERIALIZATION

Before:

```text id="scy3ya"
contactRevealed === true
```

API response:

```json id="h8hlyh"
{
  "contact": null
}
```

or no contact object.

After reveal:

```json id="tq72kq"
{
  "contact": {
    "name": "Ahmet",
    "phone": "05...",
    "email": "..."
  }
}
```

Only show the OTHER participant's contact details.

Do not unnecessarily echo current user's private data.

---

# CRITICAL — SERVER-SIDE PRIVACY

Do not rely on:

```text id="1xb5em"
CSS hiding
React conditionals
disabled UI
```

to protect contact details.

Before reveal, contact data must not be included in API/server serialized payload at all.

This is mandatory.

---

# EXISTING SERIALIZER

Update:

```text id="f6ewwu"
serializeTradeOffer
```

or appropriate offer serializer.

It should receive viewer context if necessary.

Example concept:

```ts id="ueum9f"
serializeTradeOffer(offer, viewerId)
```

and decide whether contact data is allowed.

Do not create multiple inconsistent privacy implementations.

---

# MESSAGE CONTACT FILTER

Sprint 7 currently blocks contact information.

Update behavior:

```text id="hffvja"
if contactRevealed === false
    detectContactInfo applies

if contactRevealed === true
    contact information may be shared
```

Zero-cash rule remains active regardless.

---

# IMPORTANT

After contact reveal:

Allowed:

```text id="pr3s5k"
Telefonum 0532...
WhatsApp'tan yazabilirsin.
mail adresim ...
```

Still blocked:

```text id="tvrk2l"
500 TL fark veririm
nakit ekleyelim
IBAN'a para göndereyim
```

Contact reveal does NOT disable Zero-Cash policy.

---

# MESSAGE SERVICE UPDATE

Modify existing Sprint 7 message validation.

Conceptually:

```text id="a3yl38"
cash filter:
ALWAYS ON

contact filter:
ON only when contactRevealed === false
```

Add regression tests.

---

# TRADE HANDOFF UI

On:

```text id="ff4lgc"
/offers/[id]
```

when:

```text id="xf8iqm"
status === ACCEPTED
```

show a new section:

```text id="jfrt9r"
Takas Teslim Aşaması
```

---

# BEFORE ANY APPROVAL

Show:

```text id="vwqka2"
Takas şartları kabul edildi.

Buluşma veya gönderim detaylarını planlamak için iletişim bilgilerinizi karşılıklı olarak paylaşabilirsiniz.

İletişim bilgileri yalnızca iki taraf da onay verdiğinde açılır.
```

CTA:

```text id="7fpt02"
İletişim Bilgilerimi Paylaşmayı Onaylıyorum
```

---

# EXPLICIT CONSENT

Do not use vague button text like:

```text id="ez5vh3"
Devam
Tamam
İleri
```

Use explicit:

```text id="3nmkvb"
İletişim Bilgilerimi Paylaşmayı Onaylıyorum
```

User must understand what action does.

---

# CONFIRMATION DIALOG

Before approval:

```text id="e8g3r4"
İletişim bilgilerini paylaşmayı onaylıyor musun?

Karşı taraf da onay verdiğinde telefon ve e-posta bilgileriniz birbirinize gösterilecektir.
```

Buttons:

```text id="e6fszv"
Vazgeç
Paylaşmayı Onayla
```

---

# ONE PARTY APPROVED

If current user approved but other user has not:

```text id="g5qzdl"
Onayın alındı.

İletişim bilgileri, karşı taraf da paylaşımı onayladığında açılacak.
```

Do not expose contacts.

---

# OTHER PARTY APPROVED FIRST

If other party approved but current user has not:

```text id="kv2n0e"
Karşı taraf iletişim bilgilerini paylaşmayı onayladı.

Bilgilerin açılması için senin de onay vermen gerekiyor.
```

CTA remains.

---

# BOTH APPROVED

Display:

```text id="rl4qx8"
İletişim Bilgileri Açıldı
```

Then show other participant:

```text id="m2ol7g"
Ahmet Yılmaz

Telefon
05xx xxx xx xx

E-posta
example@example.com
```

Optional actions:

```text id="wh8b6m"
Ara
E-posta Gönder
```

For phone:

```text id="olrg4q"
tel:
```

For email:

```text id="as1lrk"
mailto:
```

Do not automatically create WhatsApp deep link unless a valid phone exists and existing product design calls for it.

---

# PRIVACY COPY

Display small notice:

```text id="8d7xys"
Bu bilgiler yalnızca kabul edilmiş takasın taraflarına gösterilir.
```

---

# DELIVERY METHOD

Existing Item has:

```text id="d0gz1d"
TradeMethod
HAND_TO_HAND
CARGO_ONLY
BOTH
```

Use this information in handoff UI.

Do NOT create shipping integration.

---

# HAND-TO-HAND

If relevant items support:

```text id="xgpm1k"
HAND_TO_HAND
```

show guidance:

```text id="6kmd9e"
Elden Takas

Buluşma yerini ve zamanı karşılıklı olarak belirleyin.
```

Safety copy:

```text id="ptcbyh"
Mümkünse halka açık ve güvenli bir buluşma noktası tercih edin.
```

Do not claim JetSwap guarantees physical safety.

---

# CARGO

If relevant:

```text id="hwqx2n"
CARGO_ONLY
```

or:

```text id="a95pvj"
BOTH
```

show:

```text id="pzbvrx"
Kargo ile Takas

Gönderim detaylarını karşılıklı olarak netleştirin.
```

Do not implement:

```text id="v39xg1"
cargo API
tracking
shipping labels
payments
escrow
```

in Sprint 9.

---

# ADDRESS PRIVACY

Do NOT introduce permanent address storage in Sprint 9.

Do not request home address through profile.

Users may arrange logistics after mutual contact reveal.

---

# OFFER STATUS

Contact reveal must NOT change:

```text id="12ckka"
TradeOffer.status
```

Offer remains:

```text id="0wfsob"
ACCEPTED
```

until future completion workflow.

---

# ITEM STATUS

Items remain:

```text id="b9o2hx"
PENDING_TRADE
```

after contact reveal.

Do not set:

```text id="qxqg07"
TRADED
```

yet.

---

# COUNTER OFFER

Once offer is:

```text id="krad8a"
ACCEPTED
```

counter offer is no longer allowed.

Existing Sprint 8 rules should already enforce this.

Do not change.

---

# MESSAGE UX AFTER REVEAL

Conversation remains available.

Optional banner:

```text id="uyd6sn"
İletişim bilgileriniz karşılıklı onayla açıldı.
```

Do not force users outside JetSwap.

They may continue using internal messages.

---

# CONTACT APPROVAL STATE

API should expose safe booleans relative to viewer.

Example:

```json id="q0fhr8"
{
  "contactReveal": {
    "available": true,
    "myApproval": true,
    "otherApproval": false,
    "revealed": false,
    "revealedAt": null
  }
}
```

Do not expose unnecessary internal timestamp details before needed.

---

# SECURITY — OTHER USERS

If User C requests:

```text id="9rf8gm"
/api/offers/<accepted-offer>
```

they must still receive:

```text id="rgl6fe"
403
```

No contact data.

---

# HISTORICAL REVISION PRIVACY

A historical:

```text id="9p87x3"
COUNTER_OFFERED
```

offer must not reveal contact data even if its chain eventually resulted in another ACCEPTED revision.

Contact reveal belongs only to accepted revision.

---

# APPROVAL RACE CONDITION

Both users may approve nearly simultaneously.

Use transaction-safe logic.

Expected:

```text id="17fefj"
A approval
B approval
```

regardless of ordering results in exactly:

```text id="p9f44g"
senderContactApprovedAt != null
receiverContactApprovedAt != null
contactRevealed = true
contactRevealedAt != null
```

No partial inconsistent final state.

---

# IDEMPOTENT REVEAL

Once:

```text id="4uwhm1"
contactRevealed = true
```

future approval requests must not alter:

```text id="mq71hx"
contactRevealedAt
```

---

# CONTACT CHANGE AFTER REVEAL

If user later changes their profile phone/email:

Preferred Sprint 9 behavior:

display current profile contact data.

Do not snapshot contact information into TradeOffer.

Document this behavior.

Future audit requirements may introduce snapshots later.

---

# MISSING CONTACT INFORMATION

If current user has neither usable phone nor email:

Before approval, optionally warn:

```text id="h0vfbp"
Profilinde paylaşılabilir iletişim bilgisi bulunmuyor.
```

CTA:

```text id="fp0b92"
Profili Düzenle
```

Do not block the other participant unnecessarily.

But do not claim contact sharing will provide a phone number if none exists.

---

# TESTS

Create:

```text id="5b0ukl"
tests/contact-reveal.test.ts
```

Minimum tests:

```text id="wq4rmr"
PENDING_CANNOT_APPROVE
COUNTER_OFFERED_CANNOT_APPROVE
REJECTED_CANNOT_APPROVE
CANCELLED_CANNOT_APPROVE

ACCEPTED_SENDER_APPROVE
ACCEPTED_RECEIVER_APPROVE

FIRST_APPROVAL_DOES_NOT_REVEAL
SECOND_APPROVAL_REVEALS

SENDER_APPROVAL_IDEMPOTENT
RECEIVER_APPROVAL_IDEMPOTENT

CONTACT_REVEALED_AT_SET_ONCE

NON_PARTICIPANT_FORBIDDEN
UNAUTHENTICATED

CONTACT_HIDDEN_BEFORE_REVEAL
PHONE_HIDDEN_BEFORE_REVEAL
EMAIL_HIDDEN_BEFORE_REVEAL

OTHER_PARTICIPANT_CONTACT_VISIBLE_AFTER_REVEAL

PASSWORD_NEVER_VISIBLE

HISTORICAL_REVISION_CANNOT_REVEAL

ITEM_REMAINS_PENDING_TRADE

OFFER_REMAINS_ACCEPTED

MESSAGE_CONTACT_FILTER_BEFORE_REVEAL
MESSAGE_CONTACT_ALLOWED_AFTER_REVEAL

MESSAGE_CASH_BLOCKED_AFTER_REVEAL

SIMULTANEOUS_APPROVAL_SAFETY
```

---

# REGRESSION TESTS

Run:

```text id="2cuw5n"
tests/counter-offers.test.ts
tests/messages.test.ts
tests/offers.test.ts
tests/jetmatch.test.ts
```

No regressions.

---

# DATABASE EXPECTATION

Expected schema change:

```text id="eznr0p"
senderContactApprovedAt
receiverContactApprovedAt
```

plus migration.

Do not redesign `TradeOffer`.

---

# NO COMPLETION

Do NOT implement:

```text id="7k1bcr"
COMPLETED
completedAt
Item.status = TRADED
```

Sprint 10.

---

# NO REVIEWS

Do not implement Review flow.

Sprint 10 or later.

---

# NO JETTRUST

Do not calculate JetTrust.

---

# NO NOTIFICATIONS

Do not implement:

```text id="en2cqk"
email notifications
push
in-app notification center
```

---

# NO SHIPPING INTEGRATION

Do not add:

```text id="8zqwts"
Yurtiçi API
Aras API
MNG API
DHL
UPS
FedEx
shipping label generation
tracking API
```

---

# NO PAYMENT

JetSwap remains zero-cash.

Do not add:

```text id="4n41yg"
payment gateway
escrow
credit card
wallet
```

---

# FILE ORGANIZATION

Recommended:

```text id="lx1lgo"
src/lib/contact-reveal/
  types.ts
  service.ts
  serialization.ts
  index.ts

src/app/api/offers/[id]/contact-approval/route.ts

src/components/offers/
  contact-reveal-panel.tsx
  trade-handoff-panel.tsx
```

Reuse existing offer architecture where more appropriate.

Avoid unnecessary micro-modules.

---

# API ERRORS

Recommended:

```text id="1y3clm"
OFFER_NOT_ACCEPTED
FORBIDDEN
UNAUTHORIZED
CONTACT_ALREADY_REVEALED
```

Repeated approval should preferably remain idempotent rather than error.

---

# ACCESSIBILITY

Consent action must be accessible.

Use:

```text id="4qg8xn"
clear labels
keyboard accessible confirmation
focus management
status text
```

Do not communicate approval only through color.

---

# MOBILE

Verify:

```text id="i33x9o"
375px
768px
desktop
```

Contact panel and handoff guidance must not overflow.

Phone/email should wrap safely.

---

# FINAL VALIDATION

Run:

```bash id="6c7b19"
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

---

# ACCEPTANCE CRITERIA

Sprint 9 is complete only if:

- contact reveal requires ACCEPTED offer
- sender approval is stored
- receiver approval is stored
- one-sided approval reveals nothing
- mutual approval reveals contacts
- approval is explicit
- approval is idempotent
- reveal timestamp is set exactly once
- only participants can approve
- historical revisions cannot reveal contacts
- phone/email absent from payload before reveal
- password is never serialized
- other participant contact appears only after reveal
- message contact filter remains active before reveal
- message contact sharing becomes allowed after reveal
- Zero-Cash filter remains active after reveal
- offer remains ACCEPTED
- items remain PENDING_TRADE
- TradeMethod handoff guidance is displayed
- no address storage added
- no shipping API added
- no payment added
- no completion added
- no reviews added
- migration exists
- contact reveal tests pass
- counter offer tests still pass
- message tests still pass
- offer tests still pass
- JetMatch tests still pass
- TypeScript passes
- lint passes
- build passes
- Prisma validates

---

# REPORT

Create:

```text id="xrlvzu"
docs/sprints/SPRINT_09_REPORT.md
```

Include:

```text id="q71vj8"
Completed
Architecture
Schema Changes
Migration
Contact Consent State Machine
Privacy Serialization
Message Filter Integration
Trade Handoff UI
TradeMethod Handling
Security
Modified Files
New Files
API Routes
Tests
Known Limitations
Git Status
```

---

# FINAL RULE

Do not start Sprint 10.

Do not complete trades.

Do not mark Items TRADED.

Do not implement reviews.

Do not commit/push unless explicitly instructed by user.

Report results and stop.