# JetSwap - Hostinger VPS + Coolify Kurulum & Sıfır Veri Kaybı Dağıtım Rehberi

Bu proje, Hostinger VPS üzerindeki **Coolify** PaaS paneliyle tam uyumlu olacak şekilde **Next.js Standalone Docker** ve **Kalıcı PostgreSQL** mimarisinde hazırlanmıştır.

---

## 1. Mimari İlke: Backend ve Frontend Ayrımı & Sıfır Veri Kaybı

Projeye yeni versiyonlar ve özellikler yüklendikçe veritabanının sıfırlanmaması ve kayıt olan üyelerin kaybolmaması için sistem iki katmana ayrılmıştır:

1. **Bağımsız PostgreSQL Katmanı (Coolify Persistent Database):**
   - Veritabanı uygulamanın Docker container'ının dışında, Coolify'ın kendi kalıcı disk biriminde (persistent volume) çalışır.
   - Uygulama yeniden derlense veya güncellense dahi veritabanı asla etkilenmez.
2. **Korumalı Veritabanı Migrasyonu (`prisma migrate deploy`):**
   - Dağıtım sırasında veritabanını sıfırlayan veya tabloları silen (`db push --force-reset` gibi) yıkıcı komutlar **KESİNLİKLE** kullanılmaz.
   - Sadece şemadaki yeni alanları ekleyen güvenli `prisma migrate deploy` ve `prisma db seed` komutları çalışır.
3. **Ön Yüz ve Yönetim Panelinin İzolasyonu:**
   - Ziyaretçilerin gördüğü ön yüz ile `/admin` yönetim konsolu birbirinden ayrılmıştır.
   - `/admin` dizini için arama motoru botları engellenmiş (`noindex, nofollow`), hassas yönetim işlemleri API katmanına taşınmıştır.

---

## 2. Coolify Üzerinde PostgreSQL Veritabanı Oluşturma

1. Coolify panelinize giriş yapın (`https://vps-ip-adresiniz:8000`).
2. **Projects** > **Environment** içerisine gidin.
3. **+ New Resource** butonuna tıklayın ve **Databases** > **PostgreSQL** seçeneğini seçin.
4. Veritabanı Adı: `jetswap_db` olarak belirleyin ve **Start** diyerek başlatın.
5. Oluşan veritabanının ayarlar sayfasındaki **Internal Connection String** (İç Ağ Bağlantı Adresi) değerini kopyalayın (Örn: `postgresql://postgres:SIFRENIZ@postgres:5432/jetswap_db?schema=public`).

---

## 3. Projeyi Coolify'a Ekleme (Git Push-to-Deploy)

1. Bu projeyi kendi GitHub veya GitLab hesabınızdaki bir depoya (repository) push edin:
   ```bash
   git init
   git add .
   git commit -m "feat: production ready zero-cash barter platform"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/jetswap.git
   git push -u origin main
   ```
2. Coolify panelinizde **+ New Resource** > **Public / Private Repository (GitHub)** seçin.
3. Projenizi seçtiğinizde Coolify projedeki `Dockerfile` dosyasını otomatik olarak algılayacaktır.
   - **Build Pack:** Dockerfile
   - **Port:** 3000

---

## 4. Ortam Değişkenleri (Environment Variables)

Coolify'daki projenizin **Environment Variables** sekmesine aşağıdaki değerleri ekleyin:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL=postgresql://postgres:SIFRENIZ@postgres-servis-adi:5432/jetswap_db?schema=public
NEXTAUTH_SECRET=guclu-rastgele-32-karakterli-gizli-anahtar
NEXTAUTH_URL=https://jetswap.com.tr
ADMIN_USERNAME=admin
ADMIN_PASSWORD=JetSwap2026!Admin
ADMIN_SECRET_KEY=jetswap_admin_access_key_9988
NEXT_PUBLIC_APP_NAME=JetSwap
NEXT_PUBLIC_APP_URL=https://jetswap.com.tr
```

---

## 5. Alan Adı (Domain) ve Otomatik SSL Yapılandırması

1. Hostinger veya domain sağlayıcınızın DNS yönetiminden:
   - `jetswap.com.tr` -> `A Kaydı` -> `Hostinger VPS IP Adresiniz`
   - `www.jetswap.com.tr` -> `CNAME` -> `jetswap.com.tr`
2. Coolify proje ayarlarındaki **Domains** kutusuna:
   - `https://jetswap.com.tr, https://www.jetswap.com.tr` yazın ve kaydedin.
3. Coolify, Let's Encrypt aracılığıyla ücretsiz SSL sertifikanızı otomatik tanımlayacaktır.

---

## 6. Canlıya Alma ve Gelecek Güncellemeler (Sıfır Kesinti)

1. Coolify üzerinde **Deploy** butonuna tıklayın.
2. Gelecekte projede yaptığınız her yeni geliştirme için:
   - Sadece `git commit` ve `git push` yapmanız yeterlidir.
   - Coolify yeni versiyonu otomatik derleyip yayına alır.
   - PostgreSQL veritabanındaki kullanıcılar, takaslar, mesajlar ve puanlar **kesintisiz korunur**.

