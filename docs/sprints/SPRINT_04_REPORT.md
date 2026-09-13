# JetSwap Sprint 4 — JetMatch V1 Matching Engine Raporu

Bu rapor, **Sprint 4 (JetMatch V1 Matching Engine)** kapsamında tamamlanan deterministik eşleştirme motoru, mimari kararlar, API rotaları, puanlama modeli ve test sonuçlarını belgelemektedir.

---

## Completed

1. **Prisma & Veritabanı Migrasyonu:**
   - Sprint 3'te eklenen `ItemWant` yapısı için resmi ve güvenli `prisma/migrations/20260913000000_add_item_wants/migration.sql` oluşturuldu.
   - `prisma validate` ve `prisma generate` çalıştırıldı.

2. **JetMatch V1 Domain Engine (`src/lib/jetmatch/`):**
   - `types.ts`: `JetMatchType`, `MatchLabel`, `ReasonCode`, `ScoreBreakdown`, `JetMatchResult` gibi güçlü TypeScript tipleri.
   - `compatibility.ts`: Türkçe karakter duyarlı metin normalizasyonu, kategori eşleşmesi, kondisyon sıralama hiyerarşisi (`BRAND_NEW: 4, LIKE_NEW: 3, GOOD: 2, FAIR: 1`), konum sinyalleri ve gerçek iki yönlü karşılıklılık analizi (`analyzeReciprocity`).
   - `score.ts`: 100 puanlık şeffaf ve açıklanabilir puanlama modeli. Karşılıklılık tabanı (`MUTUAL: +40`, `ONE_WAY: 0`), kategori (+15), kondisyon (+5), şehir (+10), ülke (+5), öncelik bonusu (+1/+3/+5). Eksik verilere (Mesafe, JetTrust, Marka/Model) sıfır puan politikası.
   - `explanations.ts`: Yapılandırılmış neden kodları ve Türkçe insan dostu gerekçe metinleri.
   - `candidate.ts`: N+1 sorgularını engelleyen, yalnızca `AVAILABLE` ve başkasına ait ilanları getiren gizlilik korumalı aday keşif modülü (telefon, e-posta, şifre asla seçilmez).
   - `matcher.ts`: Tek bir ürün veya kullanıcının tüm ürünleri için adayları değerlendiren, mükerrer eşleşmeleri tekilleştiren (en yüksek skoru tutan), deterministik kravat kırıcılarla (tie-breakers) sıralayan ve limit uygulayan ana motor.
   - `index.ts`: Temiz dışa aktarım noktası.

3. **JetMatch API Endpoint:**
   - `GET /api/jetmatch`:
     - `requireUser()` ile kimlik doğrulama zorunlu (401 kontrolü).
     - `?itemId=...`: İlan sahibinin kendisi olduğunu doğrulayan (403 kontrolü), ilan `AVAILABLE` değilse veya isteği yoksa boş dönen rota.
     - Parametresiz çağrı: Kullanıcının tüm `AVAILABLE` ilanları için toplu eşleşme listesi.
     - `?limit=20`: Sonuç adedi sınırlaması (varsayılan 20, maks 50).
     - `?minScore=0`: Asgari skor filtresi.

4. **Kapsamlı Test Paketi (`tests/jetmatch.test.ts`):**
   - 39 adet bağımsız birim ve entegrasyon testi yazıldı ve çalıştırıldı (Tümü başarıyla geçti).
   - `MUTUAL`, `ONE_WAY`, `NO_MATCH`, `SAME_OWNER`, `ARCHIVED`, `TRADED`, `CONDITION`, `LOCATION`, `DUPLICATE_PREVENTION`, `DETERMINISTIC_ORDERING` senaryoları doğrulandı.

5. **Dokümantasyon:**
   - [docs/JETMATCH_V1_SCORING.md](file:///d:/Projeler/Antigravity/jetswap.com.tr/docs/JETMATCH_V1_SCORING.md): JetMatch V1 eşleştirme ve puanlama spesifikasyonu.
   - [docs/sprints/SPRINT_04_REPORT.md](file:///d:/Projeler/Antigravity/jetswap.com.tr/docs/sprints/SPRINT_04_REPORT.md): Bu sprint raporu.

---

## Architecture

```text
Kullanıcı İlanı (HAVE) + İstekleri (WANT)
       │
       ▼
[discoverCandidateItems] (status=AVAILABLE, userId!=sourceUserId, categoryId IN targetCategoryIds)
       │
       ▼
[evaluateCandidateMatch]
  ├── Kategori Uyumu (checkCategoryMatch)
  ├── Kondisyon Kriteri (isConditionSatisfied - Hard Constraint)
  ├── Karşılıklılık Analizi (analyzeReciprocity: MUTUAL vs ONE_WAY)
  ├── Konum Sinyalleri (checkLocationSignals: sameCity, sameCountry)
  ├── Puanlama ve Normalizasyon (calculateScoreBreakdown)
  └── Açıklama Üretimi (buildMatchReasons)
       │
       ▼
[Deduplication & Deterministic Ordering]
  ├── Aday başına tek en iyi skor (Map deduplication)
  ├── score DESC
  ├── matchType (MUTUAL > ONE_WAY)
  ├── createdAt DESC
  └── id ASC
       │
       ▼
API / JSON Response
```

---

## Modified Files

- `prisma/schema.prisma` (Daha önce Sprint 3'te eklenen modeller doğrulandı)
- `package.json` (Gereksinimler kontrol edildi)

---

## New Files

- `prisma/migrations/20260913000000_add_item_wants/migration.sql`
- `src/lib/jetmatch/types.ts`
- `src/lib/jetmatch/compatibility.ts`
- `src/lib/jetmatch/score.ts`
- `src/lib/jetmatch/explanations.ts`
- `src/lib/jetmatch/candidate.ts`
- `src/lib/jetmatch/matcher.ts`
- `src/lib/jetmatch/index.ts`
- `src/app/api/jetmatch/route.ts`
- `tests/jetmatch.test.ts`
- `docs/JETMATCH_V1_SCORING.md`
- `docs/sprints/SPRINT_04_REPORT.md`

---

## API

- **Rota:** `GET /api/jetmatch`
- **Yetkilendirme:** Oturum açmış kullanıcı (`requireUser()`).
- **Parametreler:**
  - `itemId` (opsiyonel): Belirli bir ilana ait eşleşmeleri getirir.
  - `limit` (opsiyonel): Maksimum sonuç adedi (varsayılan 20, maks 50).
  - `minScore` (opsiyonel): Asgari eşleşme puanı eşiği.
- **Gizlilik:** Kullanıcıların e-posta, telefon ve şifreleri yanıttan tamamen arındırılmıştır.

---

## Scoring Formula

- **V1 Maksimum Mevcut Puan:** 75
- **MUTUAL:** $+40$ (Karşılıklı istek tabanı) $+ 15$ (Kategori) $+ 5$ (Durum) $+ 10$ (Şehir) $+ 5$ (Öncelik) $= 75$ puan. $\rightarrow \text{Normalizasyon: } 100\%$.
- **ONE_WAY:** $0$ (Karşılıklılık tabanı yok) $+ 15$ (Kategori) $+ 5$ (Durum) $+ 10$ (Şehir) $+ 5$ (Öncelik) $= 35$ puan. $\rightarrow \text{Normalizasyon: } \sim 47\%$.
- **Etiketler:**
  - $90 - 100$: Mükemmel Takas
  - $75 - 89$: Güçlü Eşleşme
  - $60 - 74$: Uygun Takas
  - $< 60$: Keşfet

---

## Match Types

1. **MUTUAL:** Kaynak eşya ile aday eşya birbirlerinin kategorilerini ve durum kriterlerini karşılıklı olarak karşılamaktadır.
2. **ONE_WAY:** Kaynak eşya adayın eşyasını istemekte, aday ise takas tercihlerinde genel/esnek takasa açık olduğunu (`isFlexible: true`) belirtmektedir.

---

## Database Changes & Migration Status

- `ItemWant` modeli için `20260913000000_add_item_wants` SQL migrasyonu oluşturuldu.
- `npx prisma validate`: Geçerli.
- `npx prisma generate`: Prisma Client v6.4.1 güncellendi.

---

## Tests

1. **JetMatch Test Paketi:**
   - Komut: `npx tsx tests/jetmatch.test.ts`
   - Sonuç: `39/39` test başarıyla geçti (`Exit code: 0`).
2. **TypeScript Typecheck:**
   - Komut: `npx tsc --noEmit`
   - Sonuç: `Exit code: 0` (0 hata).
3. **ESLint:**
   - Komut: `npx eslint src/lib/jetmatch src/app/api/jetmatch tests/jetmatch.test.ts`
   - Sonuç: `Exit code: 0` (0 hata, 0 uyarı).
4. **Next.js Production Build:**
   - Komut: `npm run build`
   - Sonuç: `Exit code: 0` (Tüm 27 rota başarıyla optimize edilip derlendi).

---

## Performance Notes

- Aday havuzu doğrudan veritabanı seviyesinde `categoryId IN targetCategoryIds` ve `status = 'AVAILABLE'` filtreleriyle daraltılarak N+1 sorgu problemi önlenmiştir.
- Aday tekilleştirme `Map<string, JetMatchResult>` ile hafıza içinde $O(N)$ sürede gerçekleştirilmektedir.

---

## Known Limitations

- V1'de 3'lü veya döngüsel takas zincirleri (Swap Chain) uygulanmamıştır.
- Coğrafi koordinatlar olmadığı için mesafe puanı 0 verilmiştir.
- JetTrust itibar puanı entegrasyonu henüz eklenmemiştir.
- Kullanıcı arayüzü (UI) kurallar gereği Sprint 5'e bırakılmıştır.

---

## Git Status

- Çalışma dizininde tüm Sprint 4 dosyaları derlenmiş ve test edilmiştir. Kullanıcı talimatına göre commit/push adımı gerçekleştirilecektir.
