# 🔄 JetSwap - Küresel Nakitsiz Takas Platformu (Zero-Money Barter Platform)

JetSwap, geleneksel para ve komisyon trafiğini tamamen ortadan kaldıran, insanların sahip oldukları eşyaları doğrudan diğer eşyalarla takas edebileceği küresel bir takas ekosistemidir.

---

## 🌟 Temel Özellikler

1. **%100 Para Dışı Sistem (Cash-Free Barter):**
   - Platform üzerinde kesinlikle nakit, kredi kartı veya para transferi kabul edilmez.
2. **Kişisel Takas Portföyü:**
   - Her üyenin kendine ait bir envanteri vardır.
   - İlan eklerken "Ne tür eşyalarla takas etmek istersin?" kriterleri seçilir.
3. **Akıllı Çift Taraflı Eşleştirme Motoru (Mutual Matching Engine):**
   - A kullanıcısının elindeki eşya B'nin aradığı listede ise ve B'nin elindeki eşya A'nın aradığı listede ise sistem anında "Mükemmel Eşleşme" bildirimi üretir.
4. **Güvenli İletişim Bariyeri (Contact Reveal Gate):**
   - Telefon ve iletişim bilgileri, her iki taraf teklifi karşılıklı onaylayana kadar sistem tarafından gizli tutulur. Onay anında iletişim kartı açılır.
5. **Küresel Yapı (Global & Multi-Region):**
   - Çoklu dil (TR / EN) ve konuma dayalı takas filtreleri (Şehir içi elden takas, kargo ile takas, uluslararası).
6. **Ahlak & Güvenlik Filtresi:**
   - Genel ahlaka aykırı ve yasadışı ürünlerin engellendiği güvenli pazar alanı.

---

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 15+ (App Router, TypeScript, Turbopack)
- **Stil & Arayüz:** Tailwind CSS v4, Lucide Icons
- **Veritabanı & ORM:** PostgreSQL + Prisma ORM
- **Konteynerizasyon:** Docker (Multi-stage Standalone build) + Docker Compose
- **Sunucu & Dağıtım:** Hostinger VPS + Coolify PaaS

---

## 🚀 Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı şemasını derle
npx prisma generate

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresini açarak inceleyebilirsiniz.

---

## 📦 Dağıtım (Deployment)

Hostinger VPS üzerindeki Coolify ile kurulum adımları için [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md) rehberini inceleyebilirsiniz.
