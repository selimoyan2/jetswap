# JetSwap Sprint 11 — JetTrust V1 Raporu

Bu rapor, **Sprint 11 (JetTrust V1)** kapsamında tamamlanan deterministik itibar motoru mimarisini, veri kaynaklarını, puanlama formüllerini, revizyon zinciri tekilleştirme algoritmasını, API uç noktasını, kullanıcı arayüzü bileşenlerini, güvenlik kısıtlarını ve doğrulama testlerini belgelemektedir.

---

## 1. Completed (Tamamlananlar)

1. **JetTrust V1 Deterministik Skor Motoru (`src/lib/jettrust/score.ts`):**
   - 0–100 arası tamsayı olarak sınırlandırılmış (`Math.max(0, Math.min(100, score))`), tamamen deterministik ve sunucu taraflı hesaplanan itibar puanı.
   - Puanlama motoru veri toplama katmanından tamamen izole edilmiş, bağımsız ve saf (pure) bir fonksiyon olarak kurgulandı (`calculateJetTrust(signals)`).
   - Yapay zeka / LLM tabanlı puanlama kesinlikle kullanılmamıştır.
   - Frontend'den rastgele güven puanı atanması veya manipülasyon engellenmiştir.

2. **Veri Toplama & Revizyon Zinciri Tekilleştirme (`src/lib/jettrust/service.ts`):**
   - Kullanıcının `User`, `TradeOffer` ve `Review` veritabanı kayıtları üzerinden güvenli ve optimize sorgularla sinyaller derlenir.
   - `resolveRevisionChainOutcomes` algoritması ile karşı teklif revizyon zincirleri (`parentOfferId`) tekilleştirilerek 1 müzakere zincirinin tam olarak 1 takas yaşam döngüsü teşebbüsü sayılması garanti altına alındı.
   - Ara revizyonlardaki `COUNTER_OFFERED` teklifler tamamlanma veya iptal sayısını şişirmez.
   - Reddedilen (`REJECTED`) tekliflerin kullanıcı güvenini düşürmesi engellendi (normal pazar davranışı).

3. **Açıklanabilirlik & Düzeyler (`src/lib/jettrust/explanations.ts`):**
   - Skorun nedenini şeffaf kılan insan tarafından okunabilir Türkçe sinyal açıklamaları.
   - Düşük puanlı/yeni hesaplar için suçlayıcı olmayan, yapıcı ve nötr dil kullanımı ("Hesap henüz yeni", "Henüz tamamlanmış takas geçmişi bulunmuyor").
   - Zorunlu platform yasal sorumluluk reddi metni:
     > *"JetTrust, kullanıcının JetSwap üzerindeki hesap geçmişi, tamamlanan takasları ve değerlendirmeleri gibi platform içi sinyallerden hesaplanan bir güven göstergesidir. Güvenlik garantisi değildir."*

4. **Kamuya Açık JetTrust API Uç Noktası (`src/app/api/users/[id]/jettrust/route.ts`):**
   - `GET /api/users/[id]/jettrust` rotası oluşturuldu.
   - Kullanıcı bulunamazsa `404 USER_NOT_FOUND` döner.
   - Gizlilik garantisi: Asla telefon, e-posta, şifre hash'i, özel mesajlar veya iptal edilen teklif detaylarını dışarı sızdırmaz.

5. **Kullanıcı Arayüzü Bileşenleri (`src/components/jettrust/`):**
   - **`JetTrustBadge` (`src/components/jettrust/jettrust-badge.tsx`):**
     - Skor ve metin rozetini bir arada sunan erişilebilir bileşen (yalnızca renge bağımlı değildir).
     - Tıklandığında detay modalını açar.
   - **`JetTrustDetailModal` (`src/components/jettrust/jettrust-detail-modal.tsx`):**
     - 5 puanlama sütununun ilerleme çubukları ve puan dağılımı.
     - Öne çıkan sinyaller listesi ve yasal uyarı bandı.
     - Tam duyarlı (375px mobil, 768px tablet, masaüstü) tasarım.

6. **Arayüz Entegrasyonları:**
   - **Teklif Detay Sayfası (`src/app/offers/[id]/offer-detail-client.tsx`):** Karşı tarafın kullanıcı başlığında `JetTrustBadge` ve kullanıcı değerlendirme yıldızı yan yana yerleştirildi.
   - **Kullanıcı Panosu (`src/components/user-dashboard-bar.tsx`):** JetTrust butonunun gerçek modal ile entegrasyonu sağlandı.

7. **Test Paketi & Doğrulama:**
   - `tests/jettrust.test.ts` oluşturuldu (81/81 test geçti).
   - Projenin tüm geriye dönük test paketleri hatasız tamamlandı.
   - `npx prisma validate`, `npx tsc --noEmit`, `npx eslint`, `npm run build` sıfır hata ile tamamlandı.

---

## 2. JetTrust Felsefesi: JetTrust vs Review Rating

JetTrust, kullanıcı değerlendirme puanının (`User.rating`) yerini **ALMAZ**. İkisi birbirinden tamamen ayrı kavramlardır:

| Boyut | Değerlendirme Puanı (`User.rating`) | JetTrust (`0–100`) |
| :--- | :--- | :--- |
| **Cevapladığı Soru** | Diğer kullanıcılar bu kişiyle yaptıkları takası nasıl puanladı? | JetSwap üzerindeki doğrulanabilir davranış sinyallerine göre bu hesabın güven profili ne kadar güçlü? |
| **Kaynak Veri** | Karşılıklı tamamlanmış takas sonrası verilen `Review` (1–5 yıldız). | Hesap yaşı, profil tamlığı, tamamlanan takas sayısı, değerlendirmeler ve takas sürekliliği. |
| **Aralık** | 1.0 – 5.0 | 0 – 100 |
| **Yeni Kullanıcı Durumu** | 0 değerlendirme varken varsayılan 5.0 (yer tutucu). | Yeni kullanıcı için 0–29 basamağı (`Yeni` seviyesi). |
| **Kullanım Biçimi** | ★ 4.8 (15 değerlendirme) | JetTrust 82 / 100 · Güvenilir |

---

## 3. JetTrust V1 Puanlama Tablosu

JetTrust V1 puanı aşağıdaki 5 bağımsız sütundan oluşur ve maksimum toplamı **100** puanı geçemez:

```text
Hesap Geçmişi (Account Foundation)     0–15
Profil Tamlığı (Profile Completeness)   0–10
Tamamlanan Takaslar (Completed Trades)  0–35
Değerlendirmeler (Review Reputation)    0–30
Takas Sürekliliği (Trade Reliability)   0–10
--------------------------------------------
TOPLAM                                  0–100
```

### 3.1. Hesap Geçmişi (Account Foundation) — Maksimum 15
Hesabın `User.createdAt` tarihinden itibaren geçen gün sayısı:
* `< 7 gün`: **2 puan**
* `7–29 gün`: **5 puan**
* `30–89 gün`: **8 puan**
* `90–179 gün`: **11 puan**
* `180+ gün`: **15 puan**

### 3.2. Profil Tamlığı (Profile Completeness) — Maksimum 10
Yalnızca doğrulanabilir mevcut profil alanları üzerinden:
* `name` mevcut: **+1 puan**
* `email` mevcut: **+2 puan**
* `phone` mevcut: **+2 puan**
* `avatar` mevcut: **+2 puan**
* `bio` mevcut: **+1 puan**
* `country` mevcut: **+1 puan**
* `city` mevcut: **+1 puan**
* *(Maksimum sınır: 10 puan)*

> *Not: E-posta veya telefonun mevcut olması onların SMS/link ile "onaylandığı" anlamına gelmez. Kod tabanında gerçek bir doğrulama altyapısı bulunmadığı için sahte onay puanı verilmemiştir.*

### 3.3. Tamamlanan Takaslar (Completed Trades) — Maksimum 35
Azalan getiriler eğrisi (Diminishing Returns) uygulanır. Yalnızca durumu `COMPLETED` olan benzersiz takas yaşam döngüleri sayılır:
* `0 takas`: **0 puan**
* `1 takas`: **10 puan**
* `2 takas`: **16 puan**
* `3–4 takas`: **22 puan**
* `5–7 takas`: **27 puan**
* `8–14 takas`: **31 puan**
* `15+ takas`: **35 puan**

### 3.4. Değerlendirme İtibarı (Review Reputation) — Maksimum 30
Tek bir 5 yıldızla 30 puan alınmasını engellemek için iki aşamalı formül uygulanır:
`Değerlendirme Puanı = Kalite Bileşeni (max 22) + Güven Bileşeni (max 8)`

* **Kalite Bileşeni (Maksimum 22):**
  * Değerlendirme yoksa: **0**
  * Ortalama `< 2.0`: **0**
  * `2.0 – 2.49`: **4**
  * `2.5 – 2.99`: **8**
  * `3.0 – 3.49`: **12**
  * `3.5 – 3.99`: **16**
  * `4.0 – 4.49`: **19**
  * `4.5 – 5.0`: **22**

* **Güven / Hacim Bileşeni (Maksimum 8):**
  * 0 değerlendirme: **0**
  * 1 değerlendirme: **2**
  * 2 değerlendirme: **3**
  * 3–4 değerlendirme: **5**
  * 5–9 değerlendirme: **7**
  * 10+ değerlendirme: **8**

* *Örnek: Tek bir 5 yıldızlı değerlendirmesi olan kullanıcı `22 + 2 = 24 / 30` alır (30 alamaz).*
* *Varsayılan 5.0 yer tutucu puanı 0 değerlendirmesi olan hesaplarda yok sayılır.*

### 3.5. Takas Sürekliliği (Trade Reliability) — Maksimum 10
Kullanıcının dahil olduğu takas yaşam döngülerinde tamamlanma oranı:
`completionRatio = completedCount / (completedCount + cancelledCount)`

* Hiç takas geçmişi yoksa (`completed + cancelled === 0`): **5 puan (Nötr Başlangıç)**
* `completionRatio >= 0.90`: **10 puan**
* `completionRatio >= 0.75`: **8 puan**
* `completionRatio >= 0.60`: **6 puan**
* `completionRatio >= 0.40`: **4 puan**
* `completionRatio < 0.40`: **2 puan**

---

## 4. Revizyon Zinciri Tekilleştirme Algoritması

Sprint 8 ile gelen yapılandırılmış karşı tekliflerde bir müzakere:
`Revizyon 1 (COUNTER_OFFERED) → Revizyon 2 (COUNTER_OFFERED) → Revizyon 3 (COMPLETED)`
şeklinde ilerleyebilir. Bu süreç **3 ayrı takas değil, 1 takas yaşam döngüsüdür**.

`resolveRevisionChainOutcomes` algoritması:
1. Tekliflerin `parentOfferId` bağlarını takip ederek her teklifi kök teklife (`rootId`) bağlar.
2. Kök teklif bazında gruplama yapar.
3. Zincir içindeki herhangi bir revizyon `COMPLETED` ise zincirin nihai sonucu `COMPLETED` (+1) sayılır.
4. Zincir `CANCELLED` ile sonuçlanmışsa iptal (+1) sayılır; eski revizyonlardaki `COUNTER_OFFERED` teklifler iptal sayılmaz.
5. Reddedilen (`REJECTED`) teklifler tamamlanma veya iptal sayısını etkilemez.

---

## 5. JetTrust Seviyeleri (Levels)

| Skor Aralığı | Seviye Kodu | Türkçe Etiket | Anlamı |
| :--- | :--- | :--- | :--- |
| **0 – 29** | `NEW` | **Yeni** | Platforma yeni katılmış, henüz takas geçmişi oluşmamış hesap. |
| **30 – 49** | `DEVELOPING` | **Gelişiyor** | İlk takaslarını yapan veya profilini tamamlayan hesap. |
| **50 – 69** | `ESTABLISHED` | **Yerleşik** | Düzenli takas geçmişi ve olumlu değerlendirmeleri bulunan hesap. |
| **70 – 84** | `TRUSTED` | **Güvenilir** | Yüksek tamamlanma oranı ve güçlü kullanıcı memnuniyetine sahip hesap. |
| **85 – 100** | `HIGH_TRUST` | **Yüksek Güven** | Uzun süreli, yüksek hacimli ve kusursuz takas sürekliliği olan hesap. |

> *"Garantili", "Onaylı Satıcı" gibi taahhüt içeren yanıltıcı terimler kullanılmamıştır.*

---

## 6. Veri Toplama & Performans (No N+1)

JetTrust hesaplaması yapılırken N+1 sorgu problemi önlenmiştir:
- `User` tablosundan tek sorgu (`findUnique`).
- `Review` tablosundan `aggregate` ile ortalama ve adet tek seferde çekilir.
- `TradeOffer` tablosundan kullanıcının dahil olduğu tekliflerin yalnızca `id`, `parentOfferId`, `status`, `revision` alanları taranır; mesajlar veya teklif ürünleri gereksiz yere belleğe yüklenmez.

---

## 7. Kamuya Açık API

`GET /api/users/[id]/jettrust`

**Başarılı Yanıt Örneği (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "score": 82,
    "level": "TRUSTED",
    "label": "Güvenilir",
    "components": {
      "accountFoundation": 11,
      "profileCompleteness": 10,
      "completedTrades": 27,
      "reviewReputation": 24,
      "tradeReliability": 10
    },
    "signals": {
      "accountAgeDays": 120,
      "completedTrades": 6,
      "reviewCount": 3,
      "reviewAverage": 4.8,
      "reliabilityRatio": 1.0
    },
    "explanations": [
      "Platformda köklü bir hesap geçmişi bulunuyor.",
      "Profil bilgileri büyük ölçüde tamamlanmış.",
      "6 adet başarılı takas tamamlandı.",
      "Olumlu kullanıcı değerlendirmeleri mevcut.",
      "Takas süreçleri yüksek oranda başarıyla sonuçlanıyor."
    ],
    "disclaimer": "JetTrust, kullanıcının JetSwap üzerindeki hesap geçmişi, tamamlanan takasları ve değerlendirmeleri gibi platform içi sinyallerden hesaplanan bir güven göstergesidir. Güvenlik garantisi değildir."
  }
}
```

---

## 8. JetMatch Entegrasyonu Durumu: Ertelendi (Deferred)

Sprint 4'te `src/lib/jetmatch/score.ts` içinde ayrılan `TRUST: 5` puanının bu sprintte aktif edilmesi değerlendirilmiştir:
- **Karar:** JetMatch +5 güven puanı entegrasyonu **ertelenmiştir** (`TRUST: 5 = 0` korunmuştur).
- **Gerekçe:** JetMatch keşif sorgusu tek seferde 100'e yakın aday eşya getirmektedir. Her aday için veritabanında JetTrust hesaplaması yapmak ciddi bir N+1 gecikmesine yol açacaktır. Aday havuzu için toplu (batched) güven altyapısı kurulmadan JetMatch skorlarının değiştirilmesi hem arama performansını düşürecek hem de 45 adet kapsamlı JetMatch testinin hassas eşiklerini bozacaktır.
- Doğruluk ve performans gereksiz aceleye tercih edilmiştir.

---

## 9. Veritabanı Şeması & Migration

```text
Sprint 11 required no Prisma schema migration.
```
- JetTrust V1, doğrudan kaynak verilerden (`User`, `TradeOffer`, `Review`) türetilmiştir.
- `User.jetTrustScore` gibi senkronizasyonu bozulabilecek bağımsız bir kolon eklenmemiştir.
- `npx prisma validate` çalıştırılmış ve şemanın geçerli olduğu teyit edilmiştir.

---

## 10. Değiştirilen ve Eklenen Dosyalar

| Dosya / Dizin | Tür | Görevi / Rolü |
| :--- | :--- | :--- |
| `src/lib/jettrust/types.ts` | Yeni | JetTrust sinyal, bileşen, seviye ve sonuç tipleri |
| `src/lib/jettrust/score.ts` | Yeni | Deterministik saf puanlama motoru ve seviye belirleme |
| `src/lib/jettrust/explanations.ts` | Yeni | Şeffaf, suçlayıcı olmayan Türkçe güven açıklamaları |
| `src/lib/jettrust/service.ts` | Yeni | DB sinyal derleme ve revizyon zinciri tekilleştirme |
| `src/lib/jettrust/index.ts` | Yeni | Modül dışa aktarım merkezi |
| `src/app/api/users/[id]/jettrust/route.ts` | Yeni | Kamuya açık güven skoru API uç noktası |
| `src/components/jettrust/jettrust-badge.tsx` | Yeni | Erişilebilir JetTrust rozet bileşeni |
| `src/components/jettrust/jettrust-detail-modal.tsx` | Yeni | Puan dökümü ve yasal uyarı modal bileşeni |
| `src/components/jettrust/index.ts` | Yeni | JetTrust bileşen dışa aktarımları |
| `src/app/offers/[id]/offer-detail-client.tsx` | Değiştirildi | Takas partneri başlığına JetTrust rozet ve puan entegrasyonu |
| `src/components/user-dashboard-bar.tsx` | Değiştirildi | Kullanıcı panosundaki JetTrust butonuna modal bağlandı |
| `tests/jettrust.test.ts` | Yeni | 81 testlik kapsamlı JetTrust test paketi |
| `md/SPRINT_11_JETTRUST_V1.md` | Yeni | Sprint 11 yönerge kopyası |
| `docs/sprints/SPRINT_11_REPORT.md` | Yeni | Sprint 11 teknik dokümantasyon raporu |

---

## 11. Test & Regresyon Sonuçları

| Test Paketi / Araç | Kapsam | Sonuç |
| :--- | :--- | :--- |
| `tests/jettrust.test.ts` | Sprint 11 JetTrust Motoru (81 test) | **81/81 PASS** |
| `tests/trade-completion.test.ts` | Sprint 10 Mutual Trade Completion (49 test) | **49/49 PASS** |
| `tests/reviews.test.ts` | Sprint 10 Mutual Reviews (47 test) | **47/47 PASS** |
| `tests/contact-reveal.test.ts` | Sprint 9 Contact Reveal (58 test) | **58/58 PASS** |
| `tests/counter-offers.test.ts` | Sprint 8 Counter Offers (38 test) | **38/38 PASS** |
| `tests/messages.test.ts` | Sprint 7 Messaging (67 test) | **67/67 PASS** |
| `tests/offers.test.ts` | Sprint 6 Trade Offers (49 test) | **49/49 PASS** |
| `tests/jetmatch.test.ts` | Sprint 4 JetMatch Engine (45 test) | **45/45 PASS** |
| `npx prisma validate` | Veritabanı şema doğrulama | **Geçerli** |
| `npx tsc --noEmit` | TypeScript statik tip denetimi | **0 Hata** |
| `npx eslint` | Kod kalite analizi (Sprint 11 dosyaları) | **0 Hata, 0 Uyarı** |
| `npm run build` | Next.js 16.3.4 (Turbopack) Production Build | **Başarılı (Exit 0)** |

---

## 12. Bilinen V1 Sınırlılıkları (Known Limitations)

1. **Telefon / E-posta Varlığı Onay Anlamına Gelmez:** Profilde telefon veya e-posta girilmiş olması bunların SMS veya aktivasyon linkiyle doğrulandığı anlamına gelmez.
2. **İptal Sorumlusu Belirlenemez:** Mevcut `CANCELLED` verisi iptalin hangi tarafın kusurundan kaynaklandığını ispatlayamaz; bu nedenle bileşen "Kullanıcı İptal Oranı" değil "Takas Sürekliliği" olarak adlandırılmıştır.
3. **JetTrust Kimlik Doğrulaması Değildir:** Kimlik fotokopisi veya e-Devlet doğrulaması içermez.
4. **JetTrust Dolandırıcılık Tespit Motoru Değildir:** Anomali veya fraud sınıflandırıcısı değildir; yalnızca platform içi davranış metrikleridir.
5. **Uyuşmazlık (Dispute) Sinyali Yoktur:** Henüz sistemde resmi bir itiraz/dispute altyapısı bulunmadığı için puanlamada yer almaz.
6. **Rozet/Seviye Doğrulama Sinyali Yoktur:** JetTrust haricinde harici bir kurumsal doğrulama seviyesi bulunmamaktadır.
7. **Manuel Moderasyon Müdahalesi Yoktur:** Admin panelinden puana elle müdahale edilemez; skor bütünüyle deterministiktir.
8. **Önbellek (Caching) Uygulanmamıştır:** Veri tazeliği ön planda tutulduğu için Redis veya in-memory cache kullanılmamıştır; ileride yüksek trafikte eklenebilir.
9. **Yeni Dürüst Kullanıcılar:** Platforma yeni katılan dürüst kullanıcılar doğal olarak takas geçmişi olana dek daha düşük puan (`Yeni` seviyesi) ile başlarlar.

---

## 13. Gelecek JetTrust Sinyalleri (Future Signals)

İlerleyen sprintlerde JetTrust motoruna eklenebilecek potansiyel sinyaller:
- SMS veya e-posta OTP doğrulama onayı.
- Başarılı kargo teslimatı sinyalleri.
- Zamanında teslimat / yanıt verme hızı (yanıtlama süresi).
- Çözülmüş şikayet / moderasyon temizlik puanı.
- JetMatch için önceden indekslenmiş toplu güven ağırlığı.

---

## 14. Git Durumu

Kullanıcının açık talimatı olmadan commit ve push işlemi **yapılmamıştır**. Çalışma dizini onayınızı beklemektedir.
