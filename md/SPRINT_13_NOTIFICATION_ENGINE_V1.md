# JetSwap Sprint 13 — Notification Engine V1

## Kapsam ve Genel Bakış
Sprint 13, JetSwap platformu üzerinde gerçekleşen takas teklifi oluşturma, karşı teklif sunma, kabul, red, takas mesajı gönderimi, karşılıklı iletişim açma (contact reveal), takas tamamlama onayı ve değerlendirme (review) olaylarını anlık olarak kullanıcılara bildiren güvenli, deterministik ve kurum içi (in-app) bir bildirim motorunu hayata geçirmiştir.

---

## 1. Mimari Prensipler ve Güvenlik Sınırları

1. **Yalnızca In-App (Uygulama İçi):**
   - E-posta, SMS, push notification, harici webhook, WebSocket, SSE veya Socket.io entegrasyonu içermez.
   - Arka plan kuyruğu (BullMQ, Redis, RabbitMQ vb.) ya da cron mekanizması gerektirmez.
2. **Deterministik ve Güvenli Şablonlar:**
   - Bildirim başlık ve metinleri yalnızca sunucu tarafında tanımlı Türkçe deterministik şablonlardan üretilir (`renderNotificationTemplate`).
   - Kullanıcıların yazdığı mesaj içerikleri veya değerlendirme yorumları bildirim gövdesine asla kopyalanmaz. Böylece XSS ve enjeksiyon riskleri tamamen bertaraf edilmiştir.
3. **Mükerrer Bildirim Koruması (Deduplication):**
   - Veritabanında `dedupeKey String? @unique` kısıtı kullanılmıştır.
   - Her olay tekil bir belirteç üretir (örn. `offer:{offerId}:new:{receiverId}`, `offer:{offerId}:accepted:{senderId}`).
   - Tekrarlanan olaylar veritabanında yeni satır oluşturmaz; var olan bildirim güvenle döndürülür.
4. **İstemci Tarafından Sahte Bildirim Üretilemez:**
   - İstemcilerin rastgele bildirim oluşturmasını sağlayan `POST /api/notifications` uç noktası kesinlikle engellenmiş ve 405 Method Not Allowed olarak yapılandırılmıştır.
5. **IDOR Koruması ve Yetkilendirme:**
   - Bildirim listesi, okunmamış sayısı, tekil okundu ve toplu okundu API'leri oturum kontrolünden (`requireUser`) geçer.
   - Kullanıcı yalnızca kendisine ait olan bildirimleri görebilir ve güncelleyebilir; başkasına ait bildirim güncellenmeye çalışıldığında 403/404 yanıtı verilir.

---

## 2. Veri Modeli

### `NotificationType` Enum
```prisma
enum NotificationType {
  NEW_OFFER
  COUNTER_OFFER
  OFFER_ACCEPTED
  OFFER_REJECTED
  NEW_MESSAGE
  CONTACT_REVEALED
  TRADE_COMPLETION_REQUEST
  TRADE_COMPLETED
  NEW_REVIEW
}
```

### `Notification` Modeli
```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  href      String
  dedupeKey String?          @unique
  readAt    DateTime?
  createdAt DateTime         @default(now())

  @@index([userId, createdAt])
  @@index([userId, readAt])
}
```

---

## 3. Tetiklenen Olaylar ve Alıcılar

| Olay Tipi | Tetikleyici Nokta | Alıcı(lar) | Deduplication Formatı |
|---|---|---|---|
| `NEW_OFFER` | Yeni teklif oluşturulduğunda (`createTradeOffer`) | `receiverId` | `offer:{offerId}:new:{receiverId}` |
| `COUNTER_OFFER` | Karşı teklif oluşturulduğunda (`createCounterOffer`) | Karşı taraf (`newReceiverId`) | `offer:{newOfferId}:counter:{newReceiverId}` |
| `OFFER_ACCEPTED` | Teklif kabul edildiğinde (`acceptTradeOffer`) | Teklifi sunan (`senderId`) | `offer:{offerId}:accepted:{senderId}` |
| `OFFER_REJECTED` | Teklif reddedildiğinde (`rejectTradeOffer`) | Teklifi sunan (`senderId`) | `offer:{offerId}:rejected:{senderId}` |
| `NEW_MESSAGE` | Takas mesajı gönderildiğinde (`createTradeMessage`) | Mesajın muhatabı (karşı taraf) | `message:{messageId}:new:{recipientId}` |
| `CONTACT_REVEALED` | İki taraf da iletişim paylaşımını onayladığında (`approveContactReveal`) | İki taraf da (`senderId` & `receiverId`) | `offer:{offerId}:contact_revealed:{userId}` |
| `TRADE_COMPLETION_REQUEST` | Bir taraf tamamlama onayı verdiğinde (`confirmTradeCompletion`) | Henüz onay vermemiş olan karşı taraf | `offer:{offerId}:completion_request:{counterpartyId}` |
| `TRADE_COMPLETED` | İki taraf da onay verip takas tamamlandığında (`confirmTradeCompletion`) | İki taraf da (`senderId` & `receiverId`) | `offer:{offerId}:completed:{userId}` |
| `NEW_REVIEW` | Değerlendirme kaydedildiğinde (`createOfferReview`) | Değerlendirilen taraf (`targetUserId`) | `review:{reviewId}:new:{targetUserId}` |

---

## 4. API Uç Noktaları

- `GET /api/notifications`: Kullanıcının bildirimlerini en yeniden eskiye doğru sayfalanmış olarak döner (`page`, `limit`, `unreadOnly`).
- `GET /api/notifications/unread-count`: Kullanıcının okunmamış bildirim sayısını döner (`{ unreadCount: number }`).
- `PATCH /api/notifications/[id]/read`: Belirtilen bildirimi okundu olarak işaretler (`readAt = new Date()`).
- `POST /api/notifications/read-all`: Kullanıcının tüm okunmamış bildirimlerini okundu olarak günceller.
- `POST /api/notifications`: İstemciden doğrudan bildirim üretilmesini engeller (405 Method Not Allowed).

---

## 5. Arayüz Entegrasyonu

1. **Gezinme Çubuğu (Navbar):**
   - Masaüstü görünümünde JetTrust rozetinin yanında Bildirim Zili (`Bell`) ikonu yer alır.
   - Mobil menü başlığında ve çekmecesinde (drawer) bildirim zili ve bağlantısı mevcuttur.
   - Okunmamış bildirim olduğunda kırmızı badge ile okunmamış sayısı (örn. `3`, `99+`) gösterilir.
2. **Bildirim Merkezi (`/notifications`):**
   - Bildirimleri filtreleme seçenekleri: "Tümü" ve "Okunmamış".
   - "Tümünü Okundu İşaretle" butonu.
   - Her bildirim kartında olay tipine özel ikon ve renk, deterministik başlık ve açıklama, zaman damgası, "Okundu Yap" ve derin bağlantı ("Görüntüle") butonu bulunur.
