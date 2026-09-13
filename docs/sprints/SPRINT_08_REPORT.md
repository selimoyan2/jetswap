# JetSwap Sprint 8 — Structured Counter Offers Raporu

Bu rapor, **Sprint 8 (Structured Counter Offers)** kapsamında tamamlanan revizyon tabanlı yapılandırılmış karşı teklif mimarisi, lineer teklif geçmişi (Revision Chain), DB-seviyesi concurrency güvenliği, durum geçişleri, arayüz bileşenleri, Prisma şema güncellemesi, API rotaları ve doğrulama testlerini belgelemektedir.

---

## 1. Completed

1. **Prisma Şema ve Migration Güncellemesi (DB Seviyesinde Concurrency Güvenliği):**
   - Mevcut `TradeOffer` tablosuna `parentOfferId` (String, nullable, `@unique`) ve `revision` (Int, default 1) alanları eklendi.
   - `TradeOffer` modeli üzerinde self-relation kuruldu: `parentOffer TradeOffer? @relation("OfferRevisions", fields: [parentOfferId], references: [id], onDelete: SetNull)` ve `counterOffers TradeOffer[] @relation("OfferRevisions")`.
   - `parentOfferId` alanına nullable unique (`@unique`) kuralı eklendi. PostgreSQL'de birden çok `NULL` (root offer) kaydı desteklenirken, aynı parent için birden fazla child revision oluşması veritabanı seviyesinde kesin olarak engellendi.
   - Gereksiz hale gelen normal index kaldırıldı; unique constraint index'i (`TradeOffer_parentOfferId_key`) kullanıldı.
   - Production için `migrate deploy` ile çalıştırılabilir migration dosyası oluşturuldu: `prisma/migrations/20260913190000_add_unique_parent_offer_revision/migration.sql`.
   - `npx prisma validate` ve `npx prisma generate` ile Prisma Client (v6.4.1) güncellendi.

2. **Revizyon Tabanlı Karşı Teklif Mimarisi & Concurrency Koruması:**
   - Mevcut teklif kaydı yerinde değiştirilmez (mutate edilmez).
   - Karşı teklif her zaman bağımsız yeni bir `TradeOffer` revizyonu olarak oluşturulur (`revision = parent.revision + 1`).
   - Orijinal (parent) teklif durumu `COUNTER_OFFERED` yapılır ve salt-okunur (immutable) geçmişe dönüşür.
   - Yeni (child) teklif `PENDING` durumunda başlar.
   - Zincir katı bir şekilde lineerdir (ağaç dallanması engellenmiştir).
   - Eşzamanlı (concurrent) iki istek geldiğinde:
     - İlki başarılı bir şekilde child revizyon oluşturur.
     - İkincisi DB unique constraint (`P2002`) seviyesinde yakalanır ve kullanıcıya `409 OFFER_ALREADY_REVISED` olarak döner.
     - Hızlı ve kullanıcı dostu olan application-level `freshParent.counterOffers.length > 0` kontrolü ilk bariyer olarak korunmuştur.

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
   - Prisma `P2002` hatası yakalanarak temiz HTTP 409 `OFFER_ALREADY_REVISED` cevabına çevrilir.
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
          │   (DB @unique constraint ile çatallanma imkansız hale getirildi)
          ▼
[Revizyon Zinciri: Linear Chain]
  Rev 1 (COUNTER_OFFERED) ──▶ Rev 2 (COUNTER_OFFERED) ──▶ Rev 3 (PENDING)
       [Geçmiş / Salt-Okunur]       [Geçmiş / Salt-Okunur]      [Güncel / Kabul Edilebilir]
```

---

## 3. Modified Files

- `prisma/schema.prisma`: `parentOfferId` nullable `@unique` yapıldı, gereksiz index kaldırıldı.
- `src/lib/offers/service.ts`: `createCounterOffer` içine Prisma `P2002` unique constraint yakalama mantığı eklendi (HTTP 409 `OFFER_ALREADY_REVISED`).
- `tests/counter-offers.test.ts`: DB unique constraint, P2002 yakalama, concurrent race condition ve birden fazla null parentOfferId root senaryosu testleri eklendi.
- `docs/sprints/SPRINT_08_REPORT.md`: Bu doküman güncellendi.

---

## 4. New Files

- `prisma/migrations/20260913190000_add_unique_parent_offer_revision/migration.sql`: `TradeOffer.parentOfferId` unique constraint migration SQL dosyası.

---

## 5. Test Suite & Validation Results

Tüm zorunlu test ve derleme komutları başarıyla çalıştırıldı:

| Test / Komut | Sonuç | Açıklama |
|---|---|---|
| `npx tsx tests/counter-offers.test.ts` | **38/38 PASS** | DB unique constraint, concurrency race condition, lineer zincir, P2002 -> 409, null parentOfferId root uyumu |
| `npx tsx tests/messages.test.ts` | **67/67 PASS** | Sprint 7 mesajlaşma ve iletişim filtresi testleri |
| `npx tsx tests/offers.test.ts` | **49/49 PASS** | Sprint 6 teklif motoru ve durum geçişi testleri |
| `npx tsx tests/jetmatch.test.ts` | **45/45 PASS** | JetMatch V1 eşleştirme testleri |
| `npx tsc --noEmit` | **0 Hata** | TypeScript tür denetimi eksiksiz geçti |
| `npm run lint` / `npx eslint` | **0 Hata** | Temiz ESLint doğrulaması |
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

