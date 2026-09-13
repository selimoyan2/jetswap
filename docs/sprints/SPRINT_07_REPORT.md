# JetSwap Sprint 7 — Offer Messaging & Negotiation Raporu

Bu rapor, **Sprint 7 (Offer Messaging & Negotiation)** kapsamında tamamlanan güvenli teklif mesajlaşması, iletişim gizliliği bariyeri (Contact Privacy Barrier), sıfır nakit koruması, API rotaları, durum kuralları, arayüz bileşenleri ve test sonuçlarını belgelemektedir.

---

## 1. Completed

1. **Mevcut Prisma Modelinin Doğrudan Kullanımı (`TradeMessage`):**
   - Yeni/paralel chat tablosu veya ayrı conversation modeli oluşturulmadı.
   - Mevcut `TradeMessage` (`id`, `offerId`, `senderId`, `content`, `createdAt`) modeli source of truth olarak kullanıldı.
   - İletişim kapsamı doğrudan `offerId` üzerinden teklife bağlandı.

2. **Yetkilendirme ve Katılımcı Güvenliği:**
   - Sadece teklifin `senderId` veya `receiverId` kullanıcısı mesajları görebilir ve mesaj gönderebilir.
   - Yetkisiz 3. taraf kullanıcıların istekleri HTTP 403 (`FORBIDDEN`) ile engellendi.
   - Giriş yapmamış istekler HTTP 401 (`UNAUTHORIZED`) ile reddedildi.
   - Gönderen kimliği (`senderId`) daima sunucu oturumundan (`requireUser()`) alındı, istemciden gelen kimliklere asla güvenilmedi.

3. **Teklif Durumuna Göre Mesajlaşma Kuralları:**
   - `PENDING` ve `ACCEPTED` durumlarındaki tekliflerde iki taraflı aktif mesajlaşmaya izin verildi.
   - `REJECTED`, `CANCELLED` ve `COMPLETED` durumlarındaki tekliflerde geçmiş mesajlar okunabilir ancak yeni mesaj gönderilemez (`canSendMessage: false`, HTTP 400 `OFFER_CLOSED`).

4. **Sıfır Nakit Koruması (Zero-Cash Rule):**
   - Gönderilen her mesaj `src/lib/cashFilter.ts` (`detectCashKeywords`) üzerinden denetlenir.
   - Nakit, para, ücret, havale, EFT, IBAN, lira veya fiyat içeren ifadeler tespit edildiğinde mesaj reddedilir (HTTP 422 `CASH_NEGOTIATION_BLOCKED`).

5. **İletişim Gizliliği Bariyeri (Contact Privacy Filter - `detectContactInfo`):**
   - `contactRevealed === false` ilkesi korundu; Sprint 7'de hiçbir iletişim bilgisi açığa çıkarılmadı (`contactRevealed` kesinlikle `true` yapılmadı).
   - Tekrar kullanılabilir `src/lib/contactFilter.ts` modülü oluşturuldu:
     - **Telefon Numaraları:** Türkiye mobil ve uluslararası formatlar (`05xx`, `+90 5xx`, bitişik/ayrık 10-11 haneli numaralar) engellenir (`PHONE`).
     - **E-posta:** Standart ve gizlenmiş (`test @ gmail.com`, `(at)`, `[at]`) e-posta adresleri engellenir (`EMAIL`).
     - **WhatsApp:** `whatsapp`, `wa.me`, `api.whatsapp.com`, `wp'den yaz`, `wp den` ifadeleri engellenir (`WHATSAPP`).
     - **Telegram:** `telegram`, `t.me/` ifadeleri engellenir (`TELEGRAM`).
     - **Sosyal Medya:** `instagramdan yaz`, `insta:`, `facebooktan yaz`, `özelden yaz` yönlendirmeleri engellenir (`SOCIAL_CONTACT`).
   - **Hatalı Engelleme Koruması (Anti-False-Positive):**
     - Ürün modelleri ve yılları (`2024 model mi?`),
     - Donanım ve kapasite bilgileri (`128 GB`, `16 GB RAM`, `144 Hz`),
     - Saat ifadeleri (`Saat 15:30 uygun mu?`),
     - Kısa seri ve parça numaraları (`son 4 hanesi 1234 mü?`)
     kesinlikle telefon veya iletişim bilgisi sanılmayacak şekilde optimize edildi ve testlerle güvenceye alındı.

6. **Spam ve Mükerrer Mesaj Koruması:**
   - Aynı teklif, aynı gönderen ve aynı mesaj içeriği 3 saniye içinde tekrar gönderilirse sunucu tarafında yakalanıp engellendi (HTTP 429 `SPAM_RATE_LIMITED`).

7. **Teklif Detayında Güvenli Sohbet Arayüzü (`OfferChat`):**
   - `/offers/[id]` detay sayfasına entegre edildi.
   - Gönderen ve alıcı konuşma balonları görsel olarak ayrıldı (Sen: sağda yeşil, Karşı Taraf: solda nötr).
   - XSS koruması: Mesajlar `dangerouslySetInnerHTML` kullanılmadan doğrudan güvenli düz metin (plain text) olarak render edildi (`whitespace-pre-wrap break-words`).
   - Karakter sayacı (maks. 2000 karakter), klavye kısayolu (Enter ile gönder, Shift+Enter ile alt satır) ve çift gönderim koruması eklendi.
   - Teklif durumuna duyarlı başlık ve yardım metinleri ("Takas hakkında konuşun", "Teklif kabul edildi. Detayları JetSwap içinde netleştirebilirsiniz", "Bu teklif kapandığı için yeni mesaj gönderilemez").
   - 10 saniyelik makul arka plan polling mekanizması kuruldu (WebSocket/Redis gibi gereksiz bağımlılıklar eklenmedi).

---

## 2. Architecture

```text
[Kullanıcı Arayüzü /offers/[id]]
              │
              ├── OfferExchangeView (Takas Dengesi)
              ├── Offer Action Buttons (Kabul / Ret / İptal)
              └── OfferChat Component (Güvenli Mesajlaşma)
                       │
                       │ fetch / POST
                       ▼
        [API: /api/offers/[id]/messages]
                       │
              ├── requireUser() (NextAuth Session)
              │
              ▼
    [Domain Service: src/lib/messages/]
              ├── Authorization Guard (senderId === user || receiverId === user)
              ├── Offer State Machine (PENDING | ACCEPTED)
              ├── Validation (1-2000 chars, whitespace check)
              ├── detectCashKeywords() (Zero-Cash Rule -> HTTP 422)
              ├── detectContactInfo() (Privacy Barrier -> HTTP 422)
              ├── checkRecentSpam() (3s Rate Limit -> HTTP 429)
              │
              ▼
      [Prisma: TradeMessage (PostgreSQL)]
              │
              ▼
      [Serialization (Zero Contact Leak)]
              (İsim & Avatar görünür, email/phone/password asla iletilmez)
```

---

## 3. Modified Files

- `src/lib/cashFilter.ts`: `lira`, `para farkı` ve döviz kalıpları eklendi.
- `src/app/offers/[id]/offer-detail-client.tsx`: `<OfferChat />` bileşeni takas detayına bağlandı.
- `src/components/user-sanction-banner.tsx`: ESLint async ve kullanılmayan import temizliği yapıldı.

---

## 4. New Files

- `src/lib/contactFilter.ts`: İletişim gizliliği ve bilgi ifşasını engelleyen regex/filtreleme motoru.
- `src/lib/messages/types.ts`: Mesaj domain tipleri ve hata kodları.
- `src/lib/messages/validation.ts`: Mesaj metni, nakit filtresi, gizlilik filtresi ve spam koruması.
- `src/lib/messages/serialization.ts`: Güvenli mesaj dönüştürücü (sıfır ifşa garantisi).
- `src/lib/messages/service.ts`: `listOfferMessages` ve `createOfferMessage` servis katmanı.
- `src/lib/messages/index.ts`: Modül dışa aktarım noktası.
- `src/app/api/offers/[id]/messages/route.ts`: `GET` ve `POST` mesaj API uç noktaları.
- `src/components/messages/offer-chat.tsx`: İstemci sohbet bileşeni.
- `src/components/messages/index.ts`: Mesaj bileşenleri dışa aktarım noktası.
- `tests/messages.test.ts`: 67 senaryodan oluşan kapsamlı test paketi.
- `docs/sprints/SPRINT_07_REPORT.md`: Sprint 7 rapor dokümanı.

---

## 5. API Routes

### 1. `GET /api/offers/[id]/messages`
- **Yetki:** Oturum açmış kullanıcı (`requireUser`). Yalnızca `senderId` veya `receiverId`.
- **Sıralama:** `createdAt ASC, id ASC` (deterministik akış).
- **Limit:** 50 mesaj.
- **Dönen Veri:**
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "id": "cuid...",
          "offerId": "offer-1",
          "content": "Kutusu ve garantisi duruyor mu?",
          "createdAt": "2026-09-13T16:20:00.000Z",
          "isMine": true,
          "sender": {
            "id": "usr-1",
            "name": "Ahmet Yılmaz",
            "avatar": null
          }
        }
      ],
      "canSendMessage": true,
      "offerStatus": "PENDING"
    }
  }
  ```

### 2. `POST /api/offers/[id]/messages`
- **Yetki:** Oturum açmış kullanıcı (`requireUser`). Yalnızca `senderId` veya `receiverId`.
- **Gövde:** `{"content": "Mesaj metni"}`
- **Durum Kodları:**
  - `201 Created`: Mesaj başarıyla kaydedildi.
  - `400 Bad Request`: Boş/aşırı uzun mesaj veya kapalı teklif (`REJECTED`, `CANCELLED`, `COMPLETED`).
  - `401 Unauthorized`: Oturum açılmamış.
  - `403 Forbidden`: Teklifin tarafı olmayan kullanıcı.
  - `422 Unprocessable Entity`: Nakit para teklifi (`CASH_NEGOTIATION_BLOCKED`) veya erken iletişim bilgisi (`CONTACT_INFO_BLOCKED`).
  - `429 Too Many Requests`: 3 saniye içinde aynı mesajın gönderilmesi (`SPAM_RATE_LIMITED`).

---

## 6. Message State Rules

| Teklif Durumu | Mesajlar Okunabilir mi? | Yeni Mesaj Gönderilebilir mi? | Başlık / Açıklama |
| :--- | :---: | :---: | :--- |
| `PENDING` | ✅ Evet | ✅ Evet | "Takas hakkında konuşun" |
| `ACCEPTED` | ✅ Evet | ✅ Evet | "Takas Detayları & Müzakere" |
| `REJECTED` | ✅ Evet | ❌ Hayır | "Mesaj Geçmişi (Teklif kapandı)" |
| `CANCELLED` | ✅ Evet | ❌ Hayır | "Mesaj Geçmişi (Teklif kapandı)" |
| `COMPLETED` | ✅ Evet | ❌ Hayır | "Mesaj Geçmişi (Teklif kapandı)" |

---

## 7. Tests & Quality Assurance

### Test Sonuçları:

1. **Sprint 7 Mesajlaşma Testleri (`tests/messages.test.ts`):**
   - **Toplam:** 67 test
   - **Başarılı:** 67 (0 hata)
   - Kapsanan Alanlar:
     - `EMPTY_MESSAGE`: Boş ve sadece boşluk içeren mesajların reddi
     - `MAX_LENGTH`: 2000 karakter sınırının denetimi
     - `CASH_BLOCK`: 8 farklı nakit/para girişiminin engellenmesi
     - `PHONE_BLOCK`: 6 farklı telefon numarası kombinasyonunun engellenmesi
     - `EMAIL_BLOCK`: Standart ve gizlenmiş e-posta adreslerinin engellenmesi
     - `WHATSAPP_BLOCK`: 6 farklı WhatsApp yönlendirmesinin engellenmesi
     - `TELEGRAM_BLOCK`: Telegram link ve kullanıcı adı denetimi
     - `SOCIAL_CONTACT_BLOCK`: Instagram ve sosyal medya yönlendirmelerinin engellenmesi
     - `SAFE_NORMAL_TEXT`: Meşru takas ve kargo diyaloglarının sorunsuz geçmesi
     - `SAFE_PRODUCT_NUMBERS`: Yıl (2024), hafıza (128 GB, 512 GB), saat (15:30), seri no (1234) ve Hz gibi sayısal ifadelerin yanlışlıkla engellenmemesi
     - `DUPLICATE_SPAM_GUARD`: 3 saniye kuralının doğrulanması
     - `UNAUTHENTICATED`: Oturumsuz isteklerin 401 dönmesi
     - `NON_PARTICIPANT_FORBIDDEN`: 3. taraf kullanıcıların 403 alması
     - `PENDING_ALLOWED` & `ACCEPTED_ALLOWED`: İzinli durumlar
     - `REJECTED_READ_ONLY`, `CANCELLED_READ_ONLY`, `COMPLETED_READ_ONLY`: Salt okunur durumlar
     - `PRIVACY_SERIALIZATION`: E-posta ve telefonun çıktılarda kesinlikle yer almaması
     - `ORDERING`: `createdAt ASC, id ASC` deterministik sıralaması
     - `LIMIT`: 50 mesaj limit doğrulaması
     - `XSS_AS_TEXT`: HTML/Script etiketlerinin düz metin saklanması

2. **Sprint 6 Teklif Motoru Regresyon Testleri (`tests/offers.test.ts`):**
   - **Toplam:** 49 test
   - **Başarılı:** 49 (Regresyon yok)

3. **Sprint 4 JetMatch Motoru Regresyon Testleri (`tests/jetmatch.test.ts`):**
   - **Toplam:** 45 test
   - **Başarılı:** 45 (Regresyon yok)

4. **Statik Kod Analizi & Derleme:**
   - **`npx tsc --noEmit`:** ✅ Geçti (0 TypeScript derleme hatası).
   - **`npx eslint ...`:** ✅ Geçti (0 lint hatası, 0 uyarı).
   - **`npx prisma validate`:** ✅ Geçti (Prisma şeması eksiksiz ve geçerli).
   - **`npm run build`:** ✅ Geçti (Next.js 16 Turbopack production build hatasız tamamlandı, `/api/offers/[id]/messages` rotası dinamik derlendi).

---

## 8. Database Changes

- **Şema Değişikliği:** Yapılmadı (0 migration). Mevcut `TradeMessage` tablosu eksiksiz kullanıldı.

---

## 9. Known Limitations & Next Steps

- **WebSocket/Pusher:** Bilinçli olarak mimariye eklenmedi; 10 saniyelik istemci refetch/polling yaklaşımı ile sunucu kaynakları korundu.
- **Counter Offer:** Sprint 7 kapsamında yeni karşı teklif durumu eklenmedi; kullanıcılar mesaj üzerinden şartları görüşebilir, teklif kabul/ret işlemleri Sprint 6 akışıyla yönetilir.
- **Contact Reveal:** Sprint 8 kapsamında değerlendirilecek olup, `contactRevealed` bu sprintte tavizsiz `false` tutuldu.

---

## 10. Git Status

```text
 M src/app/offers/[id]/offer-detail-client.tsx
 M src/app/page.tsx
 M src/components/trade-offer-modal.tsx
 M src/components/user-sanction-banner.tsx
 M src/data/mockReports.ts
 M src/lib/cashFilter.ts
?? docs/sprints/SPRINT_07_REPORT.md
?? md/SPRINT_07_NEGOTIATION_MESSAGING.md
?? src/app/api/offers/[id]/messages/
?? src/components/messages/
?? src/lib/contactFilter.ts
?? src/lib/messages/
?? tests/messages.test.ts
```
