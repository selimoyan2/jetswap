# JetSwap Sprint 3 — Structured Item Wants Raporu

Bu rapor, **Sprint 3 (Structured Item Wants)** kapsamında tamamlanan tüm mimari, veritabanı, servis, API ve arayüz çalışmalarını belgelemektedir.

---

## Completed

1. **Relational `ItemWant` Data Architecture:**
   - Her `Item` kaydı için bağımsız, ilişkisel ve çoklu takas tercihleri tutabilen `ItemWant` modeli oluşturuldu.
   - Kategori ilişkisi `Category.id` referansı üzerinden yapılandırıldı.
   - `ItemCondition` enumu `minimumCondition` alanında yeniden kullanıldı.
   - `isFlexible`, `priority`, `brand`, `model`, `country`, `city`, `maxDistanceKm`, `keywords`, `note` alanları modellendi.
   - `Item` modelindeki eski alanlar (`targetCategories` ve `targetDescription`) geriye dönük tam uyumluluk amacıyla korundu.

2. **Domain Service (`src/lib/wants/`):**
   - `validation.ts`: İsteklerin dizi formatı, maksimum 10 adet sınırı, karakter uzunlukları (brand <= 80, model <= 120, keywords <= 500, note <= 1000), enum doğrulaması ve mesafe aralıklarını denetler.
   - `normalize.ts`: Kategori slug/id çözümlemesi (`resolveCategoryId`), varsayılan değer atamaları ve sıralı öncelik indekslemesi yapar.
   - `legacy.ts`: Eski verileri yapılandırılmış isteklere (`convertLegacyToWants`) ve yapılandırılmış istekleri eski alanlara (`syncLegacyFromWants`) iki yönlü senkronize eder.
   - `types.ts`: `StructuredWantInput`, `NormalizedWant`, `StructuredWantOutput` TypeScript tip tanımları.

3. **İdempotent Backfill Script (`scripts/backfill-item-wants.ts`):**
   - Mevcut `targetCategories` ve `targetDescription` verilerini `ItemWant` kayıtlarına dönüştüren, tekrar tekrar çalıştırıldığında mükerrer kayıt üretmeyen güvenli geçiş betiği hazırlandı.

4. **API Endpoints:**
   - `POST /api/items`: Yapılandırılmış `wants[]` dizisini veya eski `targetCategories` verisini kabul eder. Para talebi denetimi (`detectCashKeywords`) yapar. `Item` ve ilişkili `ItemWant` kayıtlarını `prisma.$transaction` ile atomik olarak yazar.
   - `GET /api/items`: İlan listesinde hafif istek özeti (`top 3 wants`) döndürür.
   - `GET /api/items/[id]`: İlan detayında tam yapılandırılmış istek listesini (`wants` ve `category` ilişkileriyle) döndürür.
   - `PATCH /api/items/[id]`: Yalnızca ilan sahibinin güncelleyebileceği (403 Forbidden kontrolü), istekleri atomik olarak silip yenileriyle güncelleyen işlem güvenli endpoint.
   - `GET /api/items/[id]/wants`: Belirli bir ilana ait yapılandırılmış istekleri listeleyen halka açık endpoint.

5. **Kullanıcı Arayüzü (UI):**
   - `CreateListingModal` (`src/components/create-listing-modal.tsx`): Tekil kategori seçiminden dinamik, tekrarlanabilir kart yapısına (`wantsList`) geçildi. Kullanıcılar her istek için kategori, marka, model, minimum durum, "Benzer ürünlere açığım" tercihi ve özel istek notu tanımlayabilir; istek ekleyip silebilir (maksimum 10).
   - `ItemDetailPage` (`src/app/items/[id]/page.tsx`): "İlan Sahibi Bu Eşyaya Karşılık Ne İstiyor?" bölümü yapılandırılmış istekleri öncelik sırasıyla (`1. Tercih (Öncelikli)`, `2. Tercih`...), durum rozetleri, esneklik etiketleri ve notlarla görselleştirir. Yapılandırılmış istek yoksa eski alanlara güvenle geri düşer.

---

## Modified Files

- `prisma/schema.prisma`
  - `Category` modeline `itemWants ItemWant[]` eklendi.
  - `Item` modeline `wants ItemWant[]` eklendi; `targetCategories` ve `targetDescription` korundu.
  - Yeni `model ItemWant` eklendi.
- `src/app/api/items/route.ts`
  - `POST` ve `GET` metotları yapılandırılmış istekleri ve `prisma.$transaction` yazımını destekleyecek şekilde güncellendi.
- `src/app/api/items/[id]/route.ts`
  - `GET` ve `PATCH` metotları yapılandırılmış `wants` verisini içerecek ve atomik olarak güncelleyecek şekilde revize edildi.
- `src/components/create-listing-modal.tsx`
  - Tekrarlanabilir istek kartları (`wantsList`), dinamik ekleme/silme, nakit filtresi entegrasyonu ve `POST /api/items` yükü eklendi.
- `src/app/items/[id]/page.tsx`
  - `prisma.item.findUnique` sorgusuna `wants` ilişkisi dahil edildi; öncelikli istek kartları ve rozetler tasarlandı.

---

## New Files

- `src/lib/wants/types.ts`: İstek tipleri ve arayüzler.
- `src/lib/wants/validation.ts`: İş kuralı ve veri doğrulayıcıları.
- `src/lib/wants/normalize.ts`: Veri normalizasyonu ve kategori çözümleme.
- `src/lib/wants/legacy.ts`: Geriye dönük uyumluluk ve senkronizasyon araçları.
- `src/lib/wants/index.ts`: Modül dışa aktarım noktası.
- `scripts/backfill-item-wants.ts`: Eski ilanları yapılandırılmış isteklere dönüştüren idempotent migrasyon betiği.
- `src/app/api/items/[id]/wants/route.ts`: İstekleri bağımsız sorgulayan GET endpoint'i.
- `docs/sprints/SPRINT_03_REPORT.md`: Bu rapor dosyası.

---

## Prisma Changes

```prisma
model ItemWant {
  id               String         @id @default(cuid())

  itemId           String
  item             Item           @relation(fields: [itemId], references: [id], onDelete: Cascade)

  categoryId       String?
  category         Category?      @relation(fields: [categoryId], references: [id])

  brand            String?
  model            String?
  minimumCondition ItemCondition?

  country          String?
  city             String?
  maxDistanceKm    Int?

  keywords         String?
  note             String?

  priority         Int            @default(0)
  isFlexible       Boolean        @default(false)

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([itemId])
  @@index([categoryId])
}
```

---

## Migration

- `prisma validate`: Başarılı.
- `prisma generate`: Başarılı (Prisma Client v6.4.1 üretildi).
- Geliştirme ortamında `npx prisma db push` veya `npx prisma migrate dev --name add-item-wants` ile veritabanına uygulanabilir. Canlı ortamda `npx prisma migrate deploy` kullanılacaktır.

---

## Backfill

- Betik: `scripts/backfill-item-wants.ts`
- Çalıştırma: `npx tsx scripts/backfill-item-wants.ts`
- Çalışma mantığı:
  1. `wants` ilişkisi boş olan ve `targetCategories` içeren ilanlar taranır.
  2. Zaten `wants` kaydı bulunan ilanlar atlanır (İdempotent).
  3. Kategori slug veya ID bilgileri `Category` tablosu ile eşleştirilir.
  4. `targetDescription` verisi ilk isteğin `note` alanına aktarılır.
  5. Toplam işlenen, oluşturulan ve atlanan kayıtlar özet log olarak yazdırılır.

---

## API Changes

- `POST /api/items`:
  - Yeni alan: `wants?: StructuredWantInput[]`
  - Eski alanlar `targetCategories` ve `targetDescription` opsiyonel olarak desteklenmeye devam eder.
- `PATCH /api/items/[id]`:
  - Yeni alan: `wants?: StructuredWantInput[]`
  - İlan sahibi doğrulaması ve atomik işlem.
- `GET /api/items/[id]`:
  - Yanıta `wants: ItemWant[]` nesneleri ve kategori detayları eklendi.
- `GET /api/items/[id]/wants`:
  - Yalnızca ilgili ilanın `ItemWant` kayıtlarını döndüren yeni rota.

---

## Environment Variables

- Yeni bir ortam değişkeni eklenmedi. Mevcut `DATABASE_URL` ve `NEXTAUTH_SECRET` kullanılmaya devam ediyor.

---

## Tests

1. **TypeScript Typecheck:**
   - Komut: `npx tsc --noEmit`
   - Sonuç: `Exit code: 0` (0 hata).
2. **ESLint:**
   - Komut: `npx eslint src/lib/wants src/components/create-listing-modal.tsx src/app/items/[id]/page.tsx src/app/api/items`
   - Sonuç: `Exit code: 0` (0 hata).
3. **Prisma Validate & Generate:**
   - Komut: `npx prisma validate && npx prisma generate`
   - Sonuç: `Exit code: 0` (Şema geçerli, istemci güncellendi).
4. **Next.js Production Build:**
   - Komut: `npm run build`
   - Sonuç: `Exit code: 0` (Tüm rotalar başarıyla derlendi ve optimize edildi).
5. **Backfill Script:**
   - Komut: `npx tsx scripts/backfill-item-wants.ts`
   - Sonuç: Betik sözdizimi ve Prisma çağrıları doğrulandı.

---

## Known Limitations

- JetMatch eşleştirme motoru ve skorlama algoritması kural gereği bu sprintte uygulanmamıştır (Sprint 4 kapsamında yapılacaktır).
- Coğrafi mesafe hesaplamaları (Haversine vb.) bu sprintte hesaplanmaz; `maxDistanceKm` yalnızca yapılandırılmış girdi olarak saklanır.
- Serbest metin anahtar kelimeler için vektör veya semantik arama eklenmemiştir.

---

## Git Status

- Çalışma dizinindeki tüm değişiklikler test edildi ve hazırlandı. Kullanıcı talimatına göre commit/push adımı gerçekleştirilecektir.
