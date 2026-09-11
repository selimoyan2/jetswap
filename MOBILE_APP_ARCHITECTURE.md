# JetSwap - Mobil Uygulama Entegrasyon ve API Mimarisi

JetSwap backend ve API katmanı, gelecekte geliştirilecek **Flutter**, **React Native**, **iOS (Swift)** veya **Android (Kotlin)** mobil uygulamalarıyla doğrudan konuşacak şekilde **Headless API** standartlarına kavuşturulmuştur.

---

## 1. Mobil Uyumlu Mimari Özellikleri

1. **CORS Desteği (`next.config.ts`):**
   - Mobil uygulamaların doğrudan `https://jetswap.com.tr/api/*` rotalarına güvenli HTTP istekleri (GET, POST, OPTIONS, DELETE, PATCH) yapabilmesi için tüm CORS başlıkları açılmıştır.
2. **PWA & Mobil Web Manifest (`/manifest.json`):**
   - Mobil tarayıcılardan girildiğinde tek tıkla *"Ana Ekrana Ekle"* (Add to Home Screen) desteği.
   - iOS tam ekran (`appleWebApp: capable`) ve özel durum çubuğu görünümü.
3. **Mobil Alt Navigasyon (`MobileBottomNav`):**
   - Ekranın altındaki modern tab bar (Keşfet, JetMatch, Hızlı Ekle (+), Takaslar, Profil) mobil ergonomisine tam uyumludur.

---

## 2. Mobil Uygulamanın Kullanacağı Hazır API Uç Noktaları

Tüm API yanıtları standart JSON formatında döner:

| Uç Nokta | Metod | Açıklama |
| :--- | :--- | :--- |
| `/api/items` | `GET` | Filtrelenmiş takas ilanlarını listeler (kategori, şehir, zaman, arama). |
| `/api/items` | `POST` | Mobil kameradan çekilen resimlerle yeni takas ilanı oluşturur (%100 Para Filtresi korumalı). |
| `/api/categories` | `GET` | 10 ana kategori ve 36 alt kategori ağacını döner. |
| `/api/matches?itemId={id}` | `GET` | JetMatch çift taraflı akıllı eşleştirme ve skorlama verisi. |
| `/api/swaps?userId={id}` | `GET` | Kullanıcının gelen, giden ve aktif takas müzakerelerini listeler. |
| `/api/swaps` | `POST` | Karşı tarafa çoklu ürün takas teklifi gönderir. |
| `/api/admin/stats` | `GET` | Yönetim konsolu ve moderatör mobil kontrolleri (`x-admin-key` korumalı). |

---

## 3. Mobil Uygulama Geliştirme Önerisi (Hızlı Başlangıç)

Gelecekte mobil uygulama yazarken iki popüler yoldan birini seçebilirsiniz:

### Seçenek A: Flutter (Tavsiye Edilen)
- Tek kod tabanı ile hem iOS hem Android'de 60-120 FPS native performans.
- `http` veya `dio` paketi ile `https://jetswap.com.tr/api/items` ve `/api/swaps` çağrılarak doğrudan UI'a bağlanabilir.

### Seçenek B: React Native / Expo
- Next.js ve React mimarisiyle aynı TypeScript modellerini (`types/index.ts`) birebir paylaşabilirsiniz.
