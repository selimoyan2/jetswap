# JetSwap Sprint 12 — Item Favorites & Saved Searches

## Genel Bakış

Sprint 12 kapsamında JetSwap platformuna iki temel keşif ve kullanıcı deneyimi özelliği kazandırılmıştır:
1. **Item Favorites (İlan Favorileri)**: Kullanıcıların ilgilendikleri ilanları kalıcı olarak kaydetmeleri, listelemeleri ve yönetmeleri.
2. **Saved Searches (Kayıtlı Aramalar)**: Kullanıcıların sık kullandıkları arama ve filtreleme kriterlerini isimlendirip kaydetmeleri ve tek tıkla yeniden çalıştırmaları.

Bu sprint, ileride gelecek bildirim sistemi için veri modelleme altyapısını hazırlamış; ancak **bildirimler, e-posta/SMS gönderimi, cron job veya arka plan işçileri kesinlikle bu sprinte dahil edilmemiştir**.

---

## 1. Veri Modeli ve PostgreSQL Şeması

### 1.1 `Favorite` Modeli

```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, itemId])
  @@index([userId])
  @@index([itemId])
}
```

- **Veritabanı Düzeyinde Tekillik**: `@@unique([userId, itemId])` sayesinde aynı ilanın aynı kullanıcı tarafından birden fazla favorilenmesi engellenir.
- **Performans İndeksleri**: `userId` (kullanıcının favorilerini çekmek) ve `itemId` (ürünün favori sayısını/durumunu kontrol etmek) için B-tree indeksleri mevcuttur.
- **Kademeli Temizlik (Cascade Delete)**: İlan silindiğinde veya kullanıcı hesabı silindiğinde favori kayıtları veritabanı seviyesinde otomatik temizlenir.

### 1.2 `SavedSearch` Modeli

```prisma
model SavedSearch {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  query       String?
  categoryId  String?
  category    Category?      @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  condition   ItemCondition?
  tradeMethod TradeMethod?
  country     String?        @default("TR")
  city        String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
  @@index([categoryId])
}
```

- **Yapılandırılmış ve Tipli Kriterler**: Opaque JSON yerine PostgreSQL'de doğrudan indekslenebilir ve sorgulanabilir tipli alanlar (`query`, `categoryId`, `condition`, `tradeMethod`, `country`, `city`) tercih edilmiştir.
- **Geleceğe Hazır**: İleride yeni bir ilan eklendiğinde, hangi kayıtlı aramalarla eşleştiği SQL düzeyinde yüksek verimlilikle tespit edilebilir.

---

## 2. İş Kuralları ve Politikalar

### 2.1 Favori Kuralları
- Favoriye ekleme/çıkarma işlemleri tamamen **idempotent**tir. Zaten favoride olan bir ürün tekrar eklenmek istendiğinde hata verilmez (200 OK ile mevcut durum dönülür). Çıkarılmak istendiğinde de silinmiş durum güvenle onaylanır.
- Kullanıcıların Favorite ID'si bilmesine gerek yoktur; REST uç noktaları doğrudan `itemId` ile çalışır (`/api/favorites/[itemId]`).
- Favorileme eylemi JetMatch puanını, JetTrust puanını veya ilan statüsünü değiştirmez.

### 2.2 Kayıtlı Arama ve Deterministik Tekillik Politikası
- **Farklı İsim, Aynı Kriterler**: Kullanıcı aynı kriterleri farklı bağlamlar veya isimlerle (örneğin "İstanbul Kamp" ve "Çadır Arayışı") saklayabilir.
- **Aynı İsim ve Aynı Kriterler (Accidental Duplicate)**: Kullanıcının hem normalize edilmiş adı (`toLocaleLowerCase('tr-TR')`) hem de tüm kriterleri birebir eşleşen ikinci bir kayıt oluşturması engellenir (HTTP 409 `DUPLICATE_SAVED_SEARCH`).
- **Girdi Sınırları**: Arama adı 1–80 karakter, arama metni en fazla 100 karakter, şehir adı en fazla 50 karakter ile sınırlandırılmıştır.

---

## 3. REST API Spesifikasyonu

| Metot | Yol | Açıklama | Yetkilendirme | Başarı Kodu |
|---|---|---|---|---|
| `GET` | `/api/favorites` | Giriş yapmış kullanıcının favorilerini listeler | Zorunlu (401) | 200 OK |
| `GET` | `/api/favorites/[itemId]` | İlanın favori durumunu sorgular | Zorunlu (401) | 200 OK |
| `POST` | `/api/favorites/[itemId]` | İlanı favorilere ekler (idempotent) | Zorunlu (401) | 201 Created / 200 OK |
| `DELETE` | `/api/favorites/[itemId]` | İlanı favorilerden çıkarır (idempotent) | Zorunlu (401) | 200 OK |
| `GET` | `/api/saved-searches` | Kullanıcının kayıtlı aramalarını listeler | Zorunlu (401) | 200 OK |
| `POST` | `/api/saved-searches` | Yeni arama kriteri kaydeder | Zorunlu (401) | 201 Created |
| `GET` | `/api/saved-searches/[id]` | Tekil kayıtlı aramayı getirir (IDOR korumalı) | Zorunlu (401) | 200 OK (veya 404) |
| `PATCH` | `/api/saved-searches/[id]` | Kayıtlı aramanın adını/kriterini günceller | Zorunlu (401) | 200 OK (veya 404) |
| `DELETE` | `/api/saved-searches/[id]` | Kayıtlı aramayı siler | Zorunlu (401) | 200 OK (veya 404) |

---

## 4. Kullanıcı Arayüzü Entegrasyonu

1. **`ItemCard` (`src/components/item-card.tsx`)**:
   - Kalp ikonu doğrudan favori API'sine bağlandı.
   - İyimser durum güncellemesi (optimistic UI) ve hata/401 durumunda geri alma (rollback) mekanizması eklendi.
   - Giriş yapmamış ziyaretçiler tıkladığında doğrudan giriş modalı açılır.
   - Erişilebilirlik için `aria-label`, `aria-pressed` ve klavye etkileşimi sağlandı.

2. **İlan Detay Sayfası (`src/app/items/[id]/page.tsx`)**:
   - `ItemDetailFavoriteButton` bileşeni ile ilanın favori durumu detay sayfasında canlı olarak gösterilir ve yönetilebilir.

3. **Favorilerim Sayfası (`/favorites`)**:
   - Kullanıcının kaydettiği ilanları grid formatında gösterir.
   - Hızlı favoriden çıkarma, ilan detayına gitme ve boş durum (empty state) yönlendirmesi içerir.

4. **Kayıtlı Aramalarım Sayfası (`/saved-searches`)**:
   - Kayıtlı arama kartları, kriter rozetleri (kelime, kategori, şehir, kondisyon, teslimat).
   - "Aramayı Aç" butonu ile vitrine kanonik URL parametreleri ile yönlendirme.
   - Yeniden adlandırma ve silme aksiyonları.

5. **"Aramayı Kaydet" Butonu ve Modalı (`src/components/save-search-modal.tsx`)**:
   - Vitrinde aktif olan filtreleri otomatik derleyerek kullanıcının kısa bir isimle kaydetmesini sağlar.
