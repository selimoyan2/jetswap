export interface BlogPostFaq {
  questionTr: string
  questionEn: string
  answerTr: string
  answerEn: string
}

export interface BlogPost {
  id: string
  slug: string
  titleTr: string
  titleEn: string
  summaryTr: string
  summaryEn: string
  contentTr: string
  contentEn: string
  categoryTr: string
  categoryEn: string
  readTimeTr: string
  readTimeEn: string
  publishedAt: string
  author: string
  authorRole: string
  coverImage: string
  tags: string[]
  faqs: BlogPostFaq[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'esyadan-esyaya-takas-nasil-yapilir',
    titleTr: 'Eşyadan Eşyaya Takas Nasıl Yapılır? Sıfır Nakit Rehberi',
    titleEn: 'How Hand-to-Hand Barter Works: The Zero-Cash Guide',
    summaryTr: 'Para harcamadan elindeki kullanılmayan eşyalarla ihtiyacın olanları elde etmenin en güvenli ve pratik adımları.',
    summaryEn: 'The most secure and practical steps to acquire what you need using your idle items without spending any money.',
    categoryTr: 'Takas Rehberi',
    categoryEn: 'Barter Guide',
    readTimeTr: '4 dk okuma',
    readTimeEn: '4 min read',
    publishedAt: '2026-09-10',
    author: 'JetSwap İçerik Ekibi',
    authorRole: 'Döngüsel Ekonomi Araştırmacısı',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
    tags: ['Eşya Takası', 'Sıfır Nakit', 'Takas Rehberi', 'Barter', 'Döngüsel Ekonomi'],
    contentTr: `
## Eşyadan Eşyaya Takas Nedir?

Modern tüketim toplumunda evlerimizde, ofislerimizde veya depolarımızda bekleyen milyarlarca liralık kullanılmayan eşya bulunuyor. **Eşyadan eşyaya takas**, araya herhangi bir para, kredi kartı veya banka transferi sokmaksızın, bir kullanıcının atıl eşyasını başka bir kullanıcının ihtiyaç duyduğu eşyayla doğrudan değiş tokuş etmesidir.

### Sıfır Nakit Takasın 4 Temel Adımı

1. **Portföyünü Belirle:** Evinde kenara koyduğun gitar, yedek telefon, bisiklet veya fotoğraf makinesini JetSwap portföyüne ekle. Eşyanın kondisyonunu (sıfır, az kullanılmış, iyi) dürüstçe belirt.
2. **Ne Aradığını Tanımla:** Eşyayı yüklerken *"Ne arıyorum?"* alanına ihtiyaç duyduğun kategorileri veya spesifik ürün modellerini yaz.
3. **JetMatch Eşleşmelerini İncele:** JetSwap'ın akıllı algoritması, senin elindekini isteyen ve senin istediğin eşyaya sahip kullanıcıları otomatik olarak karşına çıkarır.
4. **Güvenli Buluşma Noktalarında Teslim Al:** Teklif karşılıklı kabul edildiğinde, sistemin önerdiği kameralı Güvenli Buluşma Noktalarından birini seçerek elden güvenle teslim al.

### Takas Yaparken Nelere Dikkat Edilmeli?

- **Asla nakit farkı talep etmeyin veya teklif etmeyin:** JetSwap %100 nakitsiz bir platformdur. Değer farkı varsa portföyünüzden 1 eşya daha ekleyerek **Adil Takas Terazisi** ile dengeyi sağlayın.
- **İletişim bilgilerini erkenden paylaşmayın:** JetSwap Gizlilik Bariyeri (Privacy Gate), iki taraf resmi onay verene kadar telefon ve e-postayı gizli tutar.
    `,
    contentEn: `
## What is Peer-to-Peer Barter?

In modern consumer societies, billions of dollars worth of usable items sit dormant in homes, offices, and storerooms. **Hand-to-hand barter** is the direct exchange of an unused item for something you genuinely need, without involving fiat currency, credit cards, or wire transfers.

### 4 Core Steps of Zero-Cash Barter

1. **Build Your Portfolio:** Add your idle guitar, spare smartphone, bicycle, or camera to your JetSwap portfolio. Accurately describe its condition.
2. **Define What You Want:** In the *"Target Items"* section, specify the categories or models you are actively seeking.
3. **Review JetMatch Pairings:** JetSwap's intelligent algorithm matches you with users who have what you want and desire what you offer.
4. **Exchange at Safe Trade Zones:** Once the offer is mutually agreed, select a verified CCTV-monitored Safe Trade Zone for a smooth hand-to-hand handover.

### Golden Tips for Successful Trading
- **Never request or offer cash top-ups:** JetSwap is strictly a cashless ecosystem. Balance value gaps by bundling an additional item using the **Fair Barter Scale**.
- **Keep personal contact private until agreement:** The JetSwap Privacy Gate safeguards your phone number and email until terms are confirmed.
    `,
    faqs: [
      {
        questionTr: 'Eşyalarımın değeri tam eşit değilse ne yapmalıyım?',
        questionEn: 'What should I do if the items are not of equal value?',
        answerTr: 'JetSwap nakit para kabul etmez. Değeri eşitlemek için portföyünüzden kulaklık, oyun kolu veya kitap gibi tamamlayıcı bir ikinci eşyayı masaya sürerek paket takas yapabilirsiniz.',
        answerEn: 'JetSwap does not allow monetary compensation. To bridge a value gap, you can bundle a complementary second item from your portfolio, such as headphones or a book.'
      },
      {
        questionTr: 'Takas teklifini geri çekebilir miyim?',
        questionEn: 'Can I retract a barter offer?',
        answerTr: 'Evet, karşı taraf henüz teklifi onaylamadığı sürece "Takaslarım" panelinden teklifinizi istediğiniz zaman iptal edebilirsiniz.',
        answerEn: 'Yes, as long as the other party has not yet accepted, you can cancel your offer anytime from the "My Swaps" panel.'
      }
    ]
  },
  {
    id: 'post-2',
    slug: 'takasta-deger-dengesi-nasil-saglanir',
    titleTr: 'Takas Ederken Değer Dengesi Nasıl Sağlanır? Adil Takas Terazisi',
    titleEn: 'How to Ensure Value Balance in Barter: The Fair Barter Scale',
    summaryTr: 'Nakit para olmadan iki eşyanın adil olup olmadığını nasıl anlarsınız? JetSwap Değer Segmenti ve Paket Takas formülü.',
    summaryEn: 'How to determine fairness between two items without money? The JetSwap Value Tier & Bundle Equalizer formula.',
    categoryTr: 'Değerleme & İpuçları',
    categoryEn: 'Valuation & Tips',
    readTimeTr: '5 dk okuma',
    readTimeEn: '5 min read',
    publishedAt: '2026-09-09',
    author: 'JetSwap Ürün Yönetimi',
    authorRole: 'Takas Algoritmaları Lideri',
    coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    tags: ['Adil Terazi', 'Değer Segmenti', 'Paket Takas', 'Adil Ticaret'],
    contentTr: `
## Nakit Olmadan Değer Nasıl Ölçülür?

Geleneksel ticarette ürünün değeri para birimiyle ölçülür. Ancak döngüsel takas ekonomisinde amaç, **ihtiyaç tatmini** ve **eşya faydası**dır. Bir kişi için çekmecede duran tablet değersizken, bir öğrenci için hayati önemde olabilir.

JetSwap, takas tekliflerinin iki taraf için de adil ve kabul edilebilir olmasını sağlamak için **Adil Takas Terazisi (Fair Barter Scale)** sistemini geliştirmiştir.

### 4 Değer Segmenti Seviyesi

1. **Temel Segment (LOW - 15 Puan):** Kitaplar, aksesuarlar, kılıflar, standart giyim ve küçük ev gereçleri.
2. **Orta Segment (MEDIUM - 35 Puan):** Kablosuz kulaklıklar, akıllı saatler, spor ekipmanları, gitarlar.
3. **Üst Segment (HIGH - 70 Puan):** Dizüstü bilgisayarlar, aynasız kameralar, elektro gitarlar, oyun konsolları.
4. **Premium / Amiral Gemisi (PREMIUM - 120 Puan):** Üst seviye akıllı telefonlar, profesyonel ses/görüntü ekipmanları, nadir koleksiyon parçaları.

### Akıllı Paket Eşitleyici ile Kabul Oranını Artırma

Eğer karşı tarafın eşyası Üst Segment (70 Puan) ve senin teklif ettiğin eşya Orta Segment (35 Puan) ise terazi eğilir ve sistem sana şunu önerir:
> *"Portföyünüzden 1 eşya daha eklerseniz teklifinizin kabul edilme şansı %85 artacaktır."*

Böylece para pazarlığı yerine **eşyaların birleştiği zengin bir takas masası** kurulur.
    `,
    contentEn: `
## How is Value Measured Without Money?

In traditional commerce, value is indexed to fluctuating fiat currencies. In a circular barter economy, however, the true metric is **functional utility** and **mutual need fulfillment**.

To ensure proposals are fair and transparent, JetSwap pioneered the **Fair Barter Scale & Bundle Equalizer**.

### The 4 Value Tiers

1. **Basic Segment (LOW - 15 Pts):** Books, cables, cases, everyday apparel, and small household items.
2. **Mid-Tier Segment (MEDIUM - 35 Pts):** Bluetooth headphones, smartwatches, acoustic instruments, sports gear.
3. **Upper Segment (HIGH - 70 Pts):** Laptops, mirrorless cameras, electric guitars, game consoles.
4. **Flagship / Premium (PREMIUM - 120 Pts):** Flagship smartphones, professional audio/video gear, high-end collector items.

### Boosting Acceptance with Bundle Equalization

If the requested item is Upper Segment (70 Pts) and your offering is Mid-Tier (35 Pts), the visual scale balances this gap by inviting you to bundle a second item from your portfolio, raising acceptance probability to over 85%.
    `,
    faqs: [
      {
        questionTr: 'Karşı taraf teklifimi değer farkı nedeniyle reddederse ne yapabilirim?',
        questionEn: 'What if my offer is rejected due to a perceived value difference?',
        answerTr: 'Canlı Müzakere Masası üzerinden teklifinizi revize edebilir, portföyünüzden ek bir ürün sürerek karşı teklif iletebilirsiniz.',
        answerEn: 'You can access the Live Negotiation Desk to revise your offer and bundle an extra item from your portfolio on the fly.'
      }
    ]
  },
  {
    id: 'post-3',
    slug: 'guvenli-elden-takas-icin-5-altin-kural',
    titleTr: 'Güvenli Elden Takas İçin 5 Altın Kural ve Doğrulanmış Güvenli Noktalar',
    titleEn: '5 Golden Rules for Safe In-Person Barter & Safe Trade Zones',
    summaryTr: 'Yüz yüze takas yaparken dolandırıcılıktan korunma, ürün deneme ve kameralı güvenli alanları seçme rehberi.',
    summaryEn: 'A comprehensive guide to avoiding scams, inspecting items, and utilizing camera-monitored safe zones during in-person trades.',
    categoryTr: 'Güvenlik & JetTrust',
    categoryEn: 'Security & JetTrust',
    readTimeTr: '4 dk okuma',
    readTimeEn: '4 min read',
    publishedAt: '2026-09-08',
    author: 'JetSwap Güvenlik Ekibi',
    authorRole: 'Topluluk Güvenliği Uzmanı',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    tags: ['Güvenli Takas', 'Güvenli Noktalar', 'JetTrust', 'Elden Teslimat'],
    contentTr: `
## Elden Takasta Güvenlik Neden Önemlidir?

Eşyadan eşyaya takasın en keyifli yanı, iki tarafın buluşup eşyaları inceleyerek el sıkışmasıdır. Ancak her pazar yerinde olduğu gibi fiziksel buluşmalarda temel güvenlik kurallarına uymak esastır.

### Güvenli Takasın 5 Altın Kuralı

1. **Doğrulanmış Güvenli Buluşma Noktalarını Seçin:** Tenha yerlerde, evlerde veya ıssız sokaklarda asla buluşmayın. JetSwap'ın sisteminde yer alan AVM güvenlik girişleri, metro meydanları ve zabıta/emniyet yakınındaki kameralı noktaları tercih edin.
2. **JetTrust Skorunu İnceleyin:** Takas yapacağınız kişinin profilindeki JetTrust puanını (0-100) ve başarıyla tamamladığı geçmiş takas değerlendirmelerini mutlaka kontrol edin.
3. **Eşyayı Yerinde Test Edin:** Elektronik ürünlerde batarya sağlığı, ekran dokunmatiği ve bağlantıları çalıştırarak kontrol edin.
4. **Nakit Para Israrlarına Boyun Eğmeyin:** Karşı taraf buluşmada "Bana şu kadar da nakit ver" derse derhal işlemi iptal edin ve JetSwap üzerinden şikayet bildirin.
5. **Platform Üzerinden Onaylayın:** Eşyaları karşılıklı teslim aldıktan sonra "Takaslarım" ekranından takası onaylayarak JetTrust puanınızı yükseltin ve Eko-Etki Karnenizi alın.
    `,
    contentEn: `
## Why Safety Comes First in Barter

The most rewarding moment in pure barter is when both parties meet, test the goods, and shake hands. To protect our community, adhering to simple verified guidelines ensures total peace of mind.

### 5 Golden Rules for In-Person Barter

1. **Always Choose Verified Safe Trade Zones:** Avoid secluded alleys or private residences. Use JetSwap's verified CCTV-equipped locations at central shopping mall entrances or metro concourses.
2. **Examine JetTrust Reputation:** Check your partner's JetTrust score (0-100) and verified swap history.
3. **Test Items on the Spot:** Ensure electronic devices power on, ports function, and condition matches listing photos.
4. **Never Yield to Cash Demands:** If a user asks for cash top-ups at the meetup, decline immediately and report them via the platform.
5. **Mark Completed on JetSwap:** Confirm the exchange in your dashboard to earn positive peer reviews and unlock your Eco-Impact Scorecard.
    `,
    faqs: [
      {
        questionTr: 'Güvenli buluşma noktasında karşı taraf gelmezse ne olur?',
        questionEn: 'What happens if the other party fails to arrive at the safe zone?',
        answerTr: 'Teklif detayından takası iptal edebilir ve kullanıcı hakkında "Gelmedi / Cevap vermedi" bildirimi bırakabilirsiniz. Bu durum karşı tarafın JetTrust güven puanına yansıtılır.',
        answerEn: 'You can cancel the swap and log an attendance issue, which directly impacts the offending user\'s JetTrust score.'
      }
    ]
  },
  {
    id: 'post-4',
    slug: 'dongusel-ekonomi-ve-sifir-atik',
    titleTr: 'Döngüsel Ekonomi ve Sıfır Atık: Kullanmadığın Eşyayı Neden Satmamalısın?',
    titleEn: 'Circular Economy and Zero-Waste: Why You Shouldn\'t Just Sell Unused Items',
    summaryTr: 'Her yeni üretim devasa bir karbon salınımı yaratır. Eşyaları takaslayarak doğaya nasıl binlerce kilogram CO₂ tasarrufu sağlarsınız?',
    summaryEn: 'Every newly manufactured product generates huge carbon emissions. How trading idle items prevents thousands of kilograms of CO₂.',
    categoryTr: 'Sürdürülebilirlik',
    categoryEn: 'Sustainability',
    readTimeTr: '4 dk okuma',
    readTimeEn: '4 min read',
    publishedAt: '2026-09-07',
    author: 'Eko-Döngü Enstitüsü',
    authorRole: 'Sürdürülebilirlik Danışmanı',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    tags: ['Sıfır Atık', 'Döngüsel Ekonomi', 'Karbon Tasarrufu', 'Eko Karne'],
    contentTr: `
## Doğrusal Ekonomiden Döngüsel Ekonomiye

Geleneksel "Al - Kullan - At" modeli gezegenimizin doğal kaynaklarını hızla tüketmektedir. Yeni bir akıllı telefonun üretimi yaklaşık 70-80 kg CO₂ salınımına ve nadir toprak elementlerinin madenciliğine neden olur.

Eşyadan eşyaya takas, **ürünlerin yaşam döngüsünü 3 ila 5 kat uzatarak** yeni üretim ihtiyacını ve ambalaj atıklarını sıfırlar.

### Takasın Çevresel Kazanımları
- **Önlenen Karbon Salınımı:** İkinci el bir elektronik eşyayı çöpe atmak veya atıl tutmak yerine takaslamak ortalama 14.5 kg CO₂ salınımını önler.
- **Kurtarılan Katı Atık:** Her takas, şehir çöplüklerine giden katı atık miktarını doğrudan azaltır.
- **Sosyal Dayanışma:** Paranın satın alma gücünün düştüğü dönemlerde toplumun her kesiminin ihtiyaçlarına eşit şartlarda ulaşmasını sağlar.
    `,
    contentEn: `
## Moving from Linear to Circular

The traditional "Take - Make - Dispose" model depletes planetary resources at an unsustainable pace. Manufacturing a single new smartphone generates between 70 to 80 kg of CO₂ and extracts rare earth minerals.

Peer-to-peer barter **extends product lifespans by 3 to 5 times**, completely neutralizing the carbon cost of new manufacturing and plastic packaging.

### Key Environmental Dividends
- **CO₂ Prevention:** Bartering an existing gadget averts an estimated 14.5 kg of atmospheric greenhouse gases.
- **Landfill Diversion:** Idle hardware is diverted from landfills directly into active second lives.
- **Community Resilience:** Decouples essential quality-of-life upgrades from fiat currency depreciation.
    `,
    faqs: [
      {
        questionTr: 'Eko-Etki Karnemi nasıl alabilirim?',
        questionEn: 'How do I generate my Eco-Impact Scorecard?',
        answerTr: 'Başarıyla tamamlanan her takasın ardından "Takaslarım" ekranından tek tıkla Eko-Takas Karnenizi açabilir ve sosyal medyada paylaşabilirsiniz.',
        answerEn: 'Upon confirming any completed trade, access your Eco-Impact Scorecard directly from the "My Swaps" panel and share your badge.'
      }
    ]
  },
  {
    id: 'post-5',
    slug: 'takas-siteleri-guvenli-mi',
    titleTr: 'Takas Siteleri Güvenli mi? Dolandırıcılıkları Önleme Yolları',
    titleEn: 'Are Barter Platforms Safe? How to Avoid Common Scams',
    summaryTr: 'Online takas platformlarında güvenliğinizi sağlayacak teknolojik bariyerler ve JetSwap\'ın 3 aşamalı koruma kalkanı.',
    summaryEn: 'Technological safeguards that guarantee security on barter platforms and JetSwap\'s 3-tier protection shield.',
    categoryTr: 'Güvenlik & Rehber',
    categoryEn: 'Security & Guide',
    readTimeTr: '3 dk okuma',
    readTimeEn: '3 min read',
    publishedAt: '2026-09-06',
    author: 'JetSwap Güvenlik Ekibi',
    authorRole: 'Siber Güvenlik Direktörü',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    tags: ['Güvenli Platform', 'Siber Güvenlik', 'Gizlilik Bariyeri', 'Sıfır Dolandırıcılık'],
    contentTr: `
## Takas Sitelerinde En Çok Karşılaşılan Riskler

Pek çok geleneksel ilan sitesinde "Takas olur" yazan ilanların altında nakit para talep edenler, sahte ürün gönderenler veya kişisel telefon numaralarını spam listelerine dağıtan kötü niyetli kişiler bulunabilir.

JetSwap, bu riskleri **mimari düzeyde sıfırlamak** üzere tasarlanmıştır:

### JetSwap\'ın 3 Aşamalı Koruma Kalkanı
1. **Yapay Zeka Destekli Nakit Engelleme Filtresi:** İlan açıklamasında, teklif notunda veya sohbet mesajlarında para/fiyat sözcükleri geçtiği anda sistem mesajı engeller.
2. **Kriptolu Gizlilik Bariyeri (Privacy Gate):** Telefon numaranız ve e-postanız asla halka açık sergilenmez. Yalnızca karşılıklı teklif onaylandığında diğer tarafa gösterilir.
3. **JetTrust Şeffaf İtibar Puanı:** Sadece doğrulanmış, gerçek kullanıcılar yüksek puana ulaşabilir; hileli hesaplar derhal sistemden uzaklaştırılır.
    `,
    contentEn: `
## Common Risks on Legacy Classifieds

On generic classified websites, "open to trades" tags often conceal cash demands, counterfeit items, or phone number harvesting for spam lists.

JetSwap was engineered from the ground up to **structurally eradicate** these vulnerabilities:

### JetSwap\'s 3-Tier Protection Shield
1. **AI-Powered Cash Keyword Firewall:** Monetary references in descriptions, offer notes, or chat messages are blocked in real-time.
2. **Encrypted Privacy Gate:** Phone numbers and email addresses are shielded until both parties formally accept the barter.
3. **JetTrust Reputation Metric:** Only verified swappers who uphold community standards retain high trust ratings.
    `,
    faqs: [
      {
        questionTr: 'Şüpheli bir kullanıcıyı nasıl bildirebilirim?',
        questionEn: 'How can I report a suspicious user or listing?',
        answerTr: 'İlan kartlarında bulunan "Şikayet Et" butonuna tıklayarak Para Talebi, Sahte Ürün veya Yasaklı Eşya seçeneklerinden biriyle anında moderasyona iletebilirsiniz.',
        answerEn: 'Click the "Report" button on any item card to immediately alert moderation regarding cash demands, counterfeits, or prohibited items.'
      }
    ]
  }
]
