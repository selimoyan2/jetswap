# JetSwap Sprint 7 — Offer Messaging & Negotiation

## AI AGENT TASK

Implement Sprint 7 only.

Sprint 7 adds secure, offer-scoped messaging between the sender and receiver of a `TradeOffer`.

Use the existing Prisma model:

```text
TradeMessage
```

Do NOT create a second chat/message architecture.

Do NOT implement contact reveal, trade completion, reviews, JetTrust, notifications, real-time WebSocket infrastructure, payments, AI, or Swap Chains.

---

# READ FIRST

Inspect completely:

```text
md/AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md

docs/sprints/SPRINT_06_REPORT.md

prisma/schema.prisma

src/lib/offers/
src/app/api/offers/
src/app/offers/
src/components/offers/

src/lib/cashFilter.ts
src/lib/require-user.ts
src/lib/prisma.ts
```

Search repository for:

```text
TradeMessage
contactRevealed
contactRevealedAt
detectCashKeywords
TradeOfferStatus
```

The actual repository source is authoritative.

---

# OBJECTIVE

Implement:

```text
Offer created
↓
Sender and receiver can discuss the barter
↓
Messages remain attached to TradeOffer
↓
No money negotiation
↓
No phone/email/social contact bypass
↓
Offer actions remain controlled by Sprint 6 state machine
```

Core principle:

> Müzakere JetSwap içinde yapılır. İletişim bilgileri henüz paylaşılmaz.

---

# EXISTING MODEL

Use:

```prisma
model TradeMessage {
  id        String     @id @default(cuid())
  offerId   String
  offer     TradeOffer @relation(fields: [offerId], references: [id], onDelete: Cascade)

  senderId  String
  sender    User       @relation(fields: [senderId], references: [id], onDelete: Cascade)

  content   String
  createdAt DateTime   @default(now())
}
```

Do NOT add:

```text
receiverId
conversationId
chatId
```

`offerId` already defines the conversation.

---

# PARTICIPANTS

Only these users may access the conversation:

```text
TradeOffer.senderId
TradeOffer.receiverId
```

Nobody else.

Unauthorized:

```text
403
```

Unauthenticated:

```text
401
```

---

# MESSAGE AVAILABILITY BY OFFER STATUS

Allow messaging while:

```text
PENDING
ACCEPTED
```

Do NOT allow new messages when:

```text
REJECTED
CANCELLED
COMPLETED
```

For `COUNTER_OFFERED`, do not implement new counter-offer logic in Sprint 7.

If that status somehow exists in old/demo data, treat it conservatively and document behavior.

Recommended V1:

```text
PENDING       → messaging allowed
ACCEPTED      → messaging allowed
REJECTED      → read-only
CANCELLED     → read-only
COMPLETED     → read-only
```

Existing messages remain readable after closure.

---

# API

Create:

```text
GET  /api/offers/[id]/messages
POST /api/offers/[id]/messages
```

Both authenticated.

---

# GET MESSAGES

Return messages only if viewer is sender or receiver.

Order:

```text
createdAt ASC
id ASC
```

for deterministic conversation order.

Response fields:

```json
{
  "messages": [
    {
      "id": "...",
      "content": "...",
      "createdAt": "...",
      "isMine": true,
      "sender": {
        "id": "...",
        "name": "...",
        "avatar": "..."
      }
    }
  ]
}
```

Never expose:

```text
email
phone
password
```

---

# POST MESSAGE

Suggested request:

```json
{
  "content": "Ürünün kutusu ve faturası duruyor mu?"
}
```

Server derives:

```text
senderId
```

from authenticated session.

Do not accept senderId from browser.

---

# VALIDATION

Message:

```text
required
trimmed
minimum 1 meaningful character
maximum 2000 characters
```

Whitespace-only:

```text
400
```

---

# ZERO CASH RULE

Every message must pass existing:

```text
detectCashKeywords
```

Reject money negotiation.

Examples:

```text
500 TL eklerim
üzerine 1000 lira
nakit fark veririm
IBAN'a yollarım
para ekleyelim
```

Use existing project conventions for validation response.

Preferred:

```text
422
```

User-facing:

```text
JetSwap'ta nakit veya para farkı içeren teklifler kullanılamaz.
```

Do not duplicate cash-filter implementation.

---

# CRITICAL — CONTACT PRIVACY FILTER

This is mandatory.

Users must not bypass `contactRevealed = false` by typing:

```text
telefon number
WhatsApp number
email
Instagram username
Telegram username/link
external chat links
```

Before the platform intentionally reveals contact information.

Create reusable protection, e.g.:

```text
src/lib/contactFilter.ts
```

or an appropriate existing security module.

---

# CONTACT FILTER — MINIMUM DETECTION

Detect obvious:

### Phone numbers

Examples:

```text
0532 123 45 67
+90 532 123 4567
5321234567
0090 532...
```

Avoid blocking innocent short numeric sequences.

Use a reasonable normalized digit threshold.

---

### Email

Examples:

```text
name@example.com
selim @ gmail.com
selim(at)gmail.com
```

Basic obfuscation support is desirable.

---

### WhatsApp

Examples:

```text
whatsapp
wa.me
api.whatsapp.com
wp'den yaz
wp den yaz
```

---

### Telegram

Examples:

```text
telegram
t.me/
```

---

### Social handles/contact transfer

Examples:

```text
instagramdan yaz
insta:
@username
facebooktan yaz
```

Do not indiscriminately block every `@` if false positives become excessive.

Use defensible patterns.

---

# CONTACT FILTER RESULT

Prefer structured result:

```ts
{
  blocked: boolean
  reason:
    | "PHONE"
    | "EMAIL"
    | "WHATSAPP"
    | "TELEGRAM"
    | "SOCIAL_CONTACT"
    | null
}
```

Do not store blocked message.

---

# USER-FACING PRIVACY ERROR

Use copy such as:

```text
İletişim bilgilerini bu aşamada paylaşamazsın.

Güvenli takas süreci tamamlandığında iletişim bilgileri kontrollü şekilde açılacaktır.
```

Do not disclose exact regex/security internals.

---

# CONTACTREVEALED RULE

Sprint 7 MUST NOT set:

```text
contactRevealed = true
```

Do not modify:

```text
contactRevealedAt
```

Even when offer is `ACCEPTED`.

Contact reveal remains a later explicit workflow.

---

# MESSAGE SERVICE

Create dedicated domain logic.

Recommended:

```text
src/lib/messages/
  types.ts
  validation.ts
  service.ts
  serialization.ts
  index.ts
```

Responsibilities:

```text
authorize participant
validate offer state
validate content
zero-cash validation
contact-leak validation
create message
list messages
safe serialization
```

Do not place everything in route files.

---

# TRANSACTION REQUIREMENT

A simple message insert does not require complex multi-record transaction.

But before write, re-check:

```text
offer exists
viewer is participant
offer status is messageable
```

Server-side.

Do not trust UI state.

---

# OFFER DETAIL UI

Update:

```text
/offers/[id]
```

Add conversation area.

Recommended order:

```text
Offer summary
Exchange view
Offer status/actions
Conversation
```

or equivalent existing UX-compatible arrangement.

---

# CHAT COMPONENT

Create reusable:

```text
src/components/messages/offer-chat.tsx
```

or repository-consistent location.

Display:

```text
sender bubbles
receiver bubbles
timestamp
avatar/name where useful
```

Current user's messages aligned distinctly from the other participant.

Do not rely on color alone.

---

# MESSAGE COMPOSER

Include:

```text
textarea
character count optional
Send button
```

States:

```text
idle
submitting
success
validation error
API error
```

Prevent double submit.

---

# PENDING OFFER UX

Conversation header:

```text
Takas hakkında konuşun
```

Helper:

```text
Ürün durumu, teslimat şekli ve takas detaylarını burada konuşabilirsiniz.
```

Do not encourage external contact exchange.

---

# ACCEPTED OFFER UX

Offer may be `ACCEPTED`, but contact is still hidden.

Use:

```text
Teklif kabul edildi. Takas detaylarını JetSwap içinde netleştirebilirsiniz.
```

Do not say:

```text
Telefon numaraları açıldı
```

because Sprint 7 does not reveal them.

---

# CLOSED OFFER UX

For:

```text
REJECTED
CANCELLED
COMPLETED
```

show message history.

Composer disabled.

Copy:

```text
Bu teklif kapandığı için yeni mesaj gönderilemez.
```

---

# AUTO REFRESH

Sprint 7 does NOT require WebSockets.

Use simple, maintainable approach.

Preferred options:

1. manual refresh / refetch after send
2. modest polling if appropriate

If polling:

```text
10–15 seconds
```

is enough.

Do not implement:

```text
Socket.IO
WebSocket server
Redis pub/sub
Pusher
Ably
```

unless already part of repository.

---

# NO FAKE REAL-TIME CLAIM

If using polling:

do not market UI as:

```text
anlık mesajlaşma
```

Use simply:

```text
Mesajlar
```

---

# SCROLL BEHAVIOR

After loading or sending:

scroll conversation to latest message where reasonable.

Do not constantly steal scroll position if user is reading older messages.

---

# EMPTY CHAT

If no messages:

```text
Henüz mesaj yok.

Takasla ilgili bir soru sorarak konuşmayı başlatabilirsin.
```

---

# MESSAGE DATE DISPLAY

Human-friendly:

```text
18:42
Bugün 18:42
13 Eyl 18:42
```

Use existing date utilities if present.

Do not add heavyweight date library unless already installed.

---

# OFFER NOTE VS MESSAGES

Sprint 6 `TradeOffer.note` remains initial offer note.

Do not convert the note into a `TradeMessage`.

Display it separately as:

```text
Teklif Notu
```

Conversation starts independently.

---

# MESSAGE IMMUTABILITY

Sprint 7:

Do NOT implement:

```text
edit message
delete message
reactions
attachments
images
voice messages
```

Messages are immutable.

---

# ATTACHMENTS

Do not support file uploads in Sprint 7.

Text only.

---

# HTML / XSS

Treat message content as plain text.

Do not render:

```text
dangerouslySetInnerHTML
raw HTML
Markdown HTML
```

Escape naturally through React text rendering.

---

# URL HANDLING

Do not automatically make arbitrary external URLs clickable if doing so weakens privacy barrier.

Plain text is preferable.

---

# RATE LIMIT / SPAM GUARD

Implement lightweight anti-spam protection if possible without new infrastructure.

Minimum server-side protection:

prevent duplicate identical message from same user within a very short interval.

Example:

```text
same offer
same sender
same normalized content
within 3 seconds
```

→ reject or return idempotently.

Do not add Redis solely for this.

Document exact behavior.

---

# MESSAGE PAGINATION

Avoid unbounded conversation reads.

Recommended:

```text
limit 50
```

with pagination.

Possible:

```text
?before=<messageId>
```

or cursor-based pagination.

If conversation architecture would become unnecessarily complex, initial Sprint 7 may return most recent 50.

But:

sort them chronologically for display.

Document limitation.

---

# API RESPONSE PRIVACY

Never return:

```text
offer.sender.email
offer.sender.phone
offer.receiver.email
offer.receiver.phone
message.sender.email
message.sender.phone
```

---

# OFFER LIST PAGE

Do not fetch full message history for every card.

At most optionally return:

```text
lastMessageAt
messageCount
```

only if easy and query-efficient.

This is optional for Sprint 7.

Do not introduce N+1 problems.

---

# NAVIGATION

No new top-level navigation required.

Messages live inside:

```text
Teklifler → Teklif Detayı
```

---

# COUNTER OFFERS

Do NOT implement real counteroffer in Sprint 7.

Users can discuss changes via messages, but database offer items remain unchanged.

Do not set:

```text
COUNTER_OFFERED
```

based merely on text.

Counteroffer should be a later structured feature.

---

# COMPLETION

Do NOT implement:

```text
COMPLETED
TRADED
completedAt
```

in Sprint 7.

---

# CONTACT REVEAL

Do NOT implement contact unlock in Sprint 7.

However architecture should make it obvious that privacy filters can later be relaxed or disabled only after:

```text
contactRevealed === true
```

Future behavior:

```text
if contactRevealed === false
  block contact information

if contactRevealed === true
  allow
```

But in Sprint 7 actual system should remain:

```text
contactRevealed = false
```

for all normal flows.

---

# TESTS

Create:

```text
tests/messages.test.ts
```

Minimum cases:

```text
MESSAGE_CREATE_VALID
MESSAGE_LIST
UNAUTHENTICATED
NON_PARTICIPANT_FORBIDDEN
PENDING_ALLOWED
ACCEPTED_ALLOWED
REJECTED_READ_ONLY
CANCELLED_READ_ONLY
COMPLETED_READ_ONLY
EMPTY_MESSAGE
MAX_LENGTH
CASH_BLOCK
PHONE_BLOCK
EMAIL_BLOCK
WHATSAPP_BLOCK
TELEGRAM_BLOCK
SOCIAL_CONTACT_BLOCK
SAFE_NORMAL_TEXT
SAFE_PRODUCT_NUMBERS
DUPLICATE_SPAM_GUARD
PRIVACY_SERIALIZATION
ORDERING
LIMIT
XSS_AS_TEXT
```

---

# PRIVACY FILTER TEST EXAMPLES

Must block:

```text
0532 123 45 67
+90 532 123 4567
5321234567

test@example.com
test @ gmail.com

WhatsApp'tan yaz
wa.me/90532...
api.whatsapp.com

Telegram: @example
t.me/example

Instagram'dan yaz
insta @example
```

---

# SAFE EXAMPLES

Should NOT be blocked unnecessarily:

```text
Ürün 2024 model mi?
128 GB olan model mi?
Kutu seri numarasının son 4 hanesi 1234 mü?
Saat 15:30 uygun mu?
```

Tune rules to avoid obvious false positives.

---

# CASH FILTER TESTS

Must block:

```text
500 TL eklerim
1000 lira fark verebilirim
nakit tamamlayalım
havale yaparım
```

Safe:

```text
Kargoyu ben karşılayabilirim
```

unless existing zero-cash policy explicitly blocks shipping discussion.

Do not expand cash policy unintentionally.

---

# REGRESSION TESTS

Run existing:

```text
tests/offers.test.ts
tests/jetmatch.test.ts
```

Sprint 7 must not break Sprint 4 or Sprint 6.

---

# DATABASE CHANGES

Prefer:

```text
0 schema changes
0 migrations
```

Existing `TradeMessage` model is sufficient.

If an index is needed, only add with clear justification.

Do not redesign schema.

---

# PERFORMANCE

Message reads should use focused `select`.

Avoid fetching:

```text
full User
full Offer items
all messages forever
```

when unnecessary.

---

# ACCESSIBILITY

Message composer:

```text
labelled textarea
keyboard accessible
visible disabled states
error message associated with input
send button accessible
```

Do not use color alone to identify sender.

---

# MOBILE

Verify:

```text
375px
768px
desktop
```

Conversation must not overflow horizontally.

Input should remain usable with mobile keyboard.

---

# FINAL VALIDATION

Run:

```bash
npx tsx tests/messages.test.ts
npx tsx tests/offers.test.ts
npx tsx tests/jetmatch.test.ts

npx tsc --noEmit
npm run lint
npm run build
npx prisma validate
```

---

# ACCEPTANCE CRITERIA

Sprint 7 is complete only if:

- existing `TradeMessage` model is used
- sender/receiver can list messages
- sender/receiver can send messages
- unrelated users receive 403
- sender identity comes from session
- message ordering is deterministic
- empty messages are rejected
- oversized messages are rejected
- money negotiations are blocked
- phone sharing is blocked
- email sharing is blocked
- WhatsApp sharing is blocked
- Telegram sharing is blocked
- obvious social-contact bypass is blocked
- normal product discussion still works
- PENDING offers allow messages
- ACCEPTED offers allow messages
- closed offers are read-only
- contactRevealed remains false
- phone/email are never serialized
- messages render as plain text
- no WebSocket infrastructure added
- no counteroffer logic added
- no completion logic added
- no contact reveal added
- `/offers/[id]` contains conversation UI
- mobile layout works
- Message tests pass
- Offer tests still pass
- JetMatch tests still pass
- TypeScript passes
- lint passes
- build passes
- Prisma validates

---

# REPORT

Create:

```text
docs/sprints/SPRINT_07_REPORT.md
```

Include:

```text
Completed
Architecture
Modified Files
New Files
API Routes
Message State Rules
Privacy / Contact Filter
Zero Cash Protection
UI
Performance
Database Changes
Tests
Known Limitations
Git Status
```

---

# FINAL RULE

Do not start Sprint 8.

Do not reveal contact details.

Do not implement trade completion.

Do not commit/push unless explicitly instructed by the user.

Report results and stop.