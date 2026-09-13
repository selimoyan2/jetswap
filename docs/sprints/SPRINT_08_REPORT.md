# JetSwap Sprint 8 — Structured Counter Offers Raporu

Bu rapor, **Sprint 8 (Structured Counter Offers)** kapsamında tamamlanan revizyon tabanlı yapılandırılmış karşı teklif mimarisi, lineer teklif geçmişi (Revision Chain), durum geçişleri, arayüz bileşenleri, Prisma şema güncellemesi, API rotaları ve doğrulama testlerini belgelemektedir.

---

## 1. Completed

1. **Prisma Şema ve Migration Güncellemesi:**
   - Mevcut `TradeOffer` tablosuna `parentOfferId` (String, nullable) ve `revision` (Int, default 1) alanları eklendi.
   - `TradeOffer` modeli üzerinde self-relation kuruldu: `parentOffer TradeOffer? @relation("OfferRevisions", fields: [parentOfferId], references: [id])` ve `counterOffers TradeOffer[] @relation("OfferRevisions")`.
   - Performans için `@@index([parentOfferId])` indeksi tanımlandı.
   - Migration SQL oluşturuldu: `prisma/migrations/20260913180000_add_trade_offer_revision_chain/migration.sql`.
   - `npx prisma validate` ve `npx prisma generate` ile Prisma Client (v6.4.1) güncellendi.

2. **Revizyon Tabanlı Karşı Teklif Mimarisi (Non-Destructive Revisioning):**
   - Mevcut teklif kaydı yerinde değiştirilmez (mutate edilmez).
   - Karşı teklif her zaman bağımsız yeni bir `TradeOffer` revizyonu olarak oluşturulur (`revision = parent.revision + 1`).
   - Orijinal (parent) teklif durumu `COUNTER_OFFERED` yapılır ve salt-okunur (immutable) geçmişe dönüşür.
   - Yeni (child) teklif `PENDING` durumunda başlar.
   - Zincir katı bir şekilde lineerdir (ağaç dallanması engellenmiştir); bir parent teklif için yalnızca tek bir child revizyon oluşturulabilir (ikinci bir counter denemesi HTTP 409 `OFFER_ALREADY_REVISED` döner).

3. **Yetkilendirme ve Taraf Rolleri (Sender/Receiver Derivation):**
   - Yalnızca teklifin tarafları (`senderId` veya `receiverId`) karşı teklif yapabilir; 3. şahıslar HTTP 403 (`FORBIDDEN`) ile engellenir.
   - Karşı teklifi oluşturan kullanıcı yeni teklifin `senderId`si olur.
   - Karşı taraf otomatik olarak yeni teklifin `receiverId`si olur (kullanıcı manipülasyonu engellenir).

4. **Ürün Sahipliği ve Müsaitlik Doğrulamaları:**
   - `OFFERED` ürünler karşı teklif oluşturan kullanıcıya ait olmak zorundadır.
   - `REQUESTED` ürünler karşı tarafa ait olmak zorundadır.
   - Tüm ürünlerin durumu `AVAILABLE` olmalıdır; `PENDING_TRADE` veya başka durumda olan ürünler HTTP 400 ile reddedilir.
   - Eşyalar karşı teklif oluşturulduğunda kilitlenmez; kabul (`ACCEPTED`) edilene kadar `AVAILABLE` kalır.

5. **Güvenlik ve Gizlilik Filtreleri:**
   - Karşı teklif notunda mevcut `detectCashKeywords` sıfır-nakit kuralı uygulandı (HTTP 422 `CASH_NEGOTIATION_BLOCKED`).
   - Karşı teklif notunda `detectContactInfo` iletişim gizliliği filtresi uygulandı (HTTP 422 `CONTACT_INFO_BLOCKED`).
   - `contactRevealed` değeri kesinlikle `false` olarak korundu (Zero Contact Reveal).

6. **API Uç Noktası (`POST /api/offers/[id]/counter`):**
   - Sunucu oturumundan (`requireUser()`) authenticated kullanıcı alınır.
   - `prisma.$transaction` ile atomik olarak parent kontrolü, durum güncellemesi ve child oluşturulması sağlanır.
   - Sonuç güvenli `serializeTradeOffer` fonksiyonuyla formatlanıp döner.

7. **Kullanıcı Arayüzü Bileşenleri:**
   - **`OfferHistoryTimeline` (`src/components/offers/offer-history-timeline.tsx`):**
     - Revizyon geçmişini (Rev 1, Rev 2...) kronolojik ve görsel bir zaman çizelgesi olarak sunar.
     - Her revizyonun teklif vereni, tarihi ve durumu gösterilir.
     - Eski/geçersiz kalmış (superseded) bir revizyon incelenirken kullanıcıyı uyaran ve doğrudan en güncel revizyona yönlendiren bildirim çubuğu içerir.
   - **`CounterOfferModal` (`src/components/offers/counter-offer-modal.tsx`):**
     - Kullanıcının kendi aktif ürünleri ile karşı tarafın aktif ürünlerini listeler.
     - Kolay seçim arayüzü (checkbox/seçim kartları) ve teklif notu alanı sunar.
     - Canlı nakit ve iletişim bilgisi uyarısı gösterir.
     - Gönderim tamamlandığında yeni revizyona yönlendirir.
   - **`/offers/[id]` Entegrasyonu:**
     - Bekleyen tekliflerde (`offer.canCounter && offer.status === 'PENDING'`) "Karşı Teklif Yap" butonu aksiyon barına yerleştirildi.
     - Teklif geçmişi ve modal detay sayfasına bağlandı.
   - **`/offers` Liste Filtresi:**
     - Eski `COUNTER_OFFERED` parent tekliflerinin listeyi kirletmesi engellendi (`counterOffers: { none: {} }`). Yalnızca zincirin en güncel revizyonu listelenir.

---

## 2. Architecture & State Machine

```text
[Orijinal Teklif: Rev 1 (PENDING)]
          │
          │ POST /api/offers/[id]/counter (Bob proposes counter)
          ▼
[İşlem: prisma.$transaction]
  ├── 1. Parent kontrolü (PENDING mi? Child var mı?)
  ├── 2. Eşyaların sahiplik ve AVAILABLE doğrulaması
  ├── 3. Sıfır-nakit & İletişim filtreleri denetimi
  ├── 4. Parent güncelleme -> status: COUNTER_OFFERED
  └── 5. Child oluşturma -> parentOfferId: Rev1, revision: 2, status: PENDING
          │
          ▼
[Revizyon Zinciri: Linear Chain]
  Rev 1 (COUNTER_OFFERED) ──▶ Rev 2 (COUNTER_OFFERED) ──▶ Rev 3 (PENDING)
       [Geçmiş / Salt-Okunur]       [Geçmiş / Salt-Okunur]      [Güncel / Kabul Edilebilir]
```

---

## 3. Modified Files

- `prisma/schema.prisma`: `parentOfferId`, self-relation `parentOffer` / `counterOffers`, `revision`, ve index eklendi.
- `src/lib/offers/types.ts`: `CreateCounterOfferInput`, `OfferRevisionSummary`, `SerializedTradeOffer` revizyon alanları eklendi.
- `src/lib/offers/validation.ts`: `validateCounterOffer` doğrulama fonksiyonu eklendi.
- `src/lib/offers/service.ts`: `getOfferRevisionChain`, `createCounterOffer`, `listUserOffers` filtre güncellemesi eklendi.
- `src/lib/offers/serialization.ts`: `canCounter`, `revision`, `parentOfferId`, `history` alanları eklendi.
- `src/lib/offers/index.ts`: Barrel exports güncellendi.
- `src/app/api/items/route.ts`: Karşı tarafın ürünlerini çekebilmek için `userId` sorgu filtresi eklendi.
- `src/components/offers/index.ts`: Yeni modal ve timeline bileşenleri export edildi.
- `src/app/offers/[id]/offer-detail-client.tsx`: "Karşı Teklif Yap" butonu, timeline ve modal entegre edildi.

---

## 4. New Files

- `prisma/migrations/20260913180000_add_trade_offer_revision_chain/migration.sql`: Şema veritabanı migration SQL dosyası.
- `src/app/api/offers/[id]/counter/route.ts`: Karşı teklif oluşturma API rotası (`POST`).
- `src/components/offers/offer-history-timeline.tsx`: Revizyon geçmişi zaman çizelgesi bileşeni.
- `src/components/offers/counter-offer-modal.tsx`: Karşı teklif oluşturma modal bileşeni.
- `tests/counter-offers.test.ts`: Sprint 8 test paketi (24 senaryo, 34 assertion).
- `docs/sprints/SPRINT_08_REPORT.md`: Bu doküman.

---

## 5. Test Suite & Validation Results

Tüm zorunlu test ve derleme komutları başarıyla çalıştırıldı:

| Test / Komut | Sonuç | Açıklama |
|---|---|---|
| `npx tsx tests/counter-offers.test.ts` | **34/34 PASS** | Karşı teklif, lineer zincir, sahiplik, nakit/iletişim engeli, filtreleme |
| `npx tsx tests/messages.test.ts` | **67/67 PASS** | Sprint 7 mesajlaşma ve iletişim filtresi testleri |
| `npx tsx tests/offers.test.ts` | **49/49 PASS** | Sprint 6 teklif motoru ve durum geçişi testleri |
| `npx tsx tests/jetmatch.test.ts` | **45/45 PASS** | JetMatch V1 eşleştirme testleri |
| `npx tsc --noEmit` | **0 Hata** | TypeScript tür denetimi eksiksiz geçti |
| `npx eslint (Sprint 8 dosyaları)` | **0 Hata** | Temiz ESLint doğrulaması |
| `npm run build` | **BAŞARILI** | Next.js 16 üretim derlemesi eksiksiz tamamlandı |
| `npx prisma validate` | **BAŞARILI** | Prisma şema doğrulaması hatasız |
| `npx prisma generate` | **BAŞARILI** | Prisma Client (v6.4.1) başarıyla oluşturuldu |

---

## 6. Commitments & Constraints Preserved

- `contactRevealed` değeri daima `false` olarak tutuldu, hiçbir aşamada iletişim bilgisi ifşa edilmedi.
- `COMPLETED` / `TRADED` takas tamamlama durumlarına geçilmedi.
- İnceleme, puanlama (reviews) ve bildirim sistemleri eklenmedi.
- Sprint 9 kapsamına geçilmedi.
- Kullanıcı izni olmadan git commit veya push işlemi yapılmadı.
