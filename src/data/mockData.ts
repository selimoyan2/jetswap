import { Category, TradeItem, User, SwapChain } from '@/types'

export const mockCurrentUser: User = {
  id: 'usr_me',
  name: 'Selim Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 4.9,
  reviewCount: 14,
  jetTrust: 94,
  verifiedSwapper: true,
  completedSwaps: 27,
  country: 'TR',
  city: 'İstanbul',
  district: 'Kadıköy',
  phone: '+90 532 000 00 00',
  email: 'selim@jetswap.com.tr'
}

// Hiyerarşik Kategori & Alt Kategori Ağacı
export const categories: Category[] = [
  { 
    id: '1', 
    slug: 'telefon', 
    nameTr: 'Telefon & Mobil', 
    nameEn: 'Phones & Mobile', 
    icon: 'Smartphone', 
    count: 1840,
    subCategories: [
      { id: '1-1', slug: 'akilli-telefon', nameTr: 'Akıllı Telefonlar', nameEn: 'Smartphones', count: 1210 },
      { id: '1-2', slug: 'tablet', nameTr: 'Tabletler (iPad / Android)', nameEn: 'Tablets', count: 320 },
      { id: '1-3', slug: 'akilli-saat-bileklik', nameTr: 'Akıllı Saat & Bileklik', nameEn: 'Smartwatches', count: 180 },
      { id: '1-4', slug: 'kulaklik-mobil-ses', nameTr: 'Kablosuz Kulaklık & Mobil Ses', nameEn: 'Wireless Earphones', count: 130 },
    ]
  },
  { 
    id: '2', 
    slug: 'bilgisayar', 
    nameTr: 'Bilgisayar & Donanım', 
    nameEn: 'Computers & Tech', 
    icon: 'Laptop', 
    count: 1420,
    subCategories: [
      { id: '2-1', slug: 'dizustu-laptop', nameTr: 'Dizüstü Bilgisayar (Laptop / MacBook)', nameEn: 'Laptops / MacBooks', count: 760 },
      { id: '2-2', slug: 'oyuncu-pc-masaustu', nameTr: 'Masaüstü & Oyuncu PC', nameEn: 'Desktops & Gaming PCs', count: 340 },
      { id: '2-3', slug: 'monitor-ekran', nameTr: 'Monitör & Ekranlar', nameEn: 'Monitors', count: 190 },
      { id: '2-4', slug: 'ekran-karti-donanim', nameTr: 'Ekran Kartı & Parçalar', nameEn: 'Components & GPUs', count: 130 },
    ]
  },
  { 
    id: '3', 
    slug: 'fotograf-kamera', 
    nameTr: 'Fotoğraf, Video & Drone', 
    nameEn: 'Cameras & Drones', 
    icon: 'Camera', 
    count: 680,
    subCategories: [
      { id: '3-1', slug: 'aynasiz-dslr', nameTr: 'Aynasız & DSLR Gövdeler', nameEn: 'Mirrorless & DSLR Bodies', count: 290 },
      { id: '3-2', slug: 'kamera-lensleri', nameTr: 'Kamera Lensleri & Filtreler', nameEn: 'Camera Lenses', count: 210 },
      { id: '3-3', slug: 'drone-aksiyon', nameTr: 'Drone & Aksiyon Kameraları', nameEn: 'Drones & Action Cams', count: 120 },
      { id: '3-4', slug: 'tripod-gimbal-isik', nameTr: 'Gimbal, Tripod & Stüdyo Işığı', nameEn: 'Gimbals & Studio Lights', count: 60 },
    ]
  },
  { 
    id: '4', 
    slug: 'oyun-konsolu', 
    nameTr: 'Oyun Konsolu & Hobi', 
    nameEn: 'Gaming & Consoles', 
    icon: 'Gamepad2', 
    count: 890,
    subCategories: [
      { id: '4-1', slug: 'konsol-cihazlari', nameTr: 'Oyun Konsolları (PS5, Xbox, Switch)', nameEn: 'Game Consoles', count: 480 },
      { id: '4-2', slug: 'kutulu-oyunlar', nameTr: 'Kutulu Fiziksel Oyunlar', nameEn: 'Boxed Games', count: 260 },
      { id: '4-3', slug: 'konsol-aksesuar-kol', nameTr: 'Kollar, Direksiyon & VR Gözlük', nameEn: 'Controllers & VR', count: 150 },
    ]
  },
  { 
    id: '5', 
    slug: 'muzik-aletleri', 
    nameTr: 'Müzik Aletleri & Stüdyo', 
    nameEn: 'Musical Instruments', 
    icon: 'Guitar', 
    count: 530,
    subCategories: [
      { id: '5-1', slug: 'elektro-akustik-gitar', nameTr: 'Elektro & Akustik Gitarlar', nameEn: 'Electric & Acoustic Guitars', count: 220 },
      { id: '5-2', slug: 'piyano-klavye', nameTr: 'Piyano, Org & Synthesizer', nameEn: 'Keyboards & Pianos', count: 140 },
      { id: '5-3', slug: 'studyo-dj-ses', nameTr: 'Stüdyo, DJ Ekipmanı & Mikser', nameEn: 'Studio & DJ Gear', count: 110 },
      { id: '5-4', slug: 'davul-perkusyon', nameTr: 'Davul & Perküsyon', nameEn: 'Drums & Percussion', count: 60 },
    ]
  },
  { 
    id: '6', 
    slug: 'bisiklet-surus', 
    nameTr: 'Bisiklet & Kişisel Taşıt', 
    nameEn: 'Bikes & Rides', 
    icon: 'Bike', 
    count: 720,
    subCategories: [
      { id: '6-1', slug: 'dag-yol-bisikleti', nameTr: 'Dağ & Yol / Gravel Bisikletleri', nameEn: 'Mountain & Road Bikes', count: 350 },
      { id: '6-2', slug: 'katlanir-sehir', nameTr: 'Katlanır & Şehir Bisikletleri', nameEn: 'Folding & City Bikes', count: 210 },
      { id: '6-3', slug: 'elektrikli-scooter-e-bike', nameTr: 'Elektrikli Scooter & E-Bike', nameEn: 'Electric Bikes & Scooters', count: 160 },
    ]
  },
  { 
    id: '7', 
    slug: 'saat-koleksiyon', 
    nameTr: 'Saat, Antika & Koleksiyon', 
    nameEn: 'Watches & Collectibles', 
    icon: 'Watch', 
    count: 460,
    subCategories: [
      { id: '7-1', slug: 'mekanik-otomatik-saat', nameTr: 'Mekanik & Otomatik Kol Saatleri', nameEn: 'Automatic Watches', count: 210 },
      { id: '7-2', slug: 'vintage-antika', nameTr: 'Vintage & Antika Eşyalar', nameEn: 'Antiques & Vintage', count: 150 },
      { id: '7-3', slug: 'koleksiyon-cizgi-roman', nameTr: 'Koleksiyon Kartları, Para & Çizgi Roman', nameEn: 'Comics & Cards', count: 100 },
    ]
  },
  { 
    id: '8', 
    slug: 'ev-mobilya', 
    nameTr: 'Ev, Mobilya & Yaşam', 
    nameEn: 'Home & Living', 
    icon: 'Home', 
    count: 910,
    subCategories: [
      { id: '8-1', slug: 'kahve-mutfak', nameTr: 'Kahve Makineleri & Mutfak', nameEn: 'Coffee & Kitchen', count: 380 },
      { id: '8-2', slug: 'calisma-masasi-ergonomik', nameTr: 'Çalışma Masası & Ergonomik Koltuk', nameEn: 'Desks & Ergonomic Chairs', count: 320 },
      { id: '8-3', slug: 'aydinlatma-dekorasyon', nameTr: 'Tasarım Aydınlatma & Dekorasyon', nameEn: 'Lighting & Decor', count: 210 },
    ]
  },
  { 
    id: '9', 
    slug: 'spor-outdoor', 
    nameTr: 'Spor, Kamp & Outdoor', 
    nameEn: 'Sports & Outdoors', 
    icon: 'Compass', 
    count: 640,
    subCategories: [
      { id: '9-1', slug: 'cadir-kamp-malzemeleri', nameTr: 'Çadır, Uyku Tulumu & Kamp', nameEn: 'Tents & Camping', count: 290 },
      { id: '9-2', slug: 'fitness-agirlik', nameTr: 'Fitness & Ağırlık Ekipmanı', nameEn: 'Fitness & Gym', count: 210 },
      { id: '9-3', slug: 'kis-su-sporlari', nameTr: 'Kayak, Snowboard & Su Sporları', nameEn: 'Winter & Water Sports', count: 140 },
    ]
  },
  { 
    id: '10', 
    slug: 'arac-vasita', 
    nameTr: 'Motosiklet & Araç', 
    nameEn: 'Vehicles & Motors', 
    icon: 'Car', 
    count: 320,
    subCategories: [
      { id: '10-1', slug: 'motosiklet-scooter', nameTr: 'Motosiklet & Maxi Scooter', nameEn: 'Motorcycles', count: 160 },
      { id: '10-2', slug: 'karavan-romork', nameTr: 'Çekme Karavan & Kamp Römorku', nameEn: 'Caravans & Trailers', count: 90 },
      { id: '10-3', slug: 'tekne-deniz-araclari', nameTr: 'Tekne & Deniz Araçları', nameEn: 'Boats & Marine', count: 70 },
    ]
  },
]

export const mockMyPortfolio: TradeItem[] = [
  {
    id: 'my-1',
    title: 'Sony WH-1000XM4 Kablosuz ANC Kulaklık',
    description: 'Kutusu ve tüm aksesuarları tam, garantisi devam ediyor. Aktif gürültü engelleme kusursuz.',
    category: 'telefon',
    subCategory: 'kulaklik-mobil-ses',
    brand: 'Sony',
    modelName: 'WH-1000XM4',
    condition: 'LIKE_NEW',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'İstanbul',
    district: 'Kadıköy',
    targetCategories: ['muzik-aletleri', 'fotograf-kamera'],
    targetSubCategories: ['elektro-akustik-gitar', 'aynasiz-dslr'],
    targetDescription: 'Elektro & akustik gitar veya aynasız kamera gövdesi arıyorum.',
    openToOffers: true,
    matchScore: 98,
    valueTier: 'HIGH',
    user: mockCurrentUser,
    createdAt: 'Bugün',
    daysAgo: 0,
    status: 'ACTIVE',
    likesCount: 12
  },
  {
    id: 'my-2',
    title: 'iPad Air 5. Nesil (M1 Çip, 64GB Uzay Grisi)',
    description: 'Ekran koruyucu ile kullanıldı, çiziksiz. Manyetik kılıf hediye.',
    category: 'telefon',
    subCategory: 'tablet',
    brand: 'Apple',
    modelName: 'iPad Air 5th Gen M1',
    condition: 'LIKE_NEW',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'İstanbul',
    district: 'Kadıköy',
    targetCategories: ['bilgisayar', 'telefon'],
    targetSubCategories: ['dizustu-laptop', 'akilli-telefon'],
    targetDescription: 'Mac Mini M2 veya iPhone 15 Pro ile takas düşünebilirim.',
    openToOffers: false,
    matchScore: 92,
    valueTier: 'PREMIUM',
    user: mockCurrentUser,
    createdAt: '2 gün önce',
    daysAgo: 2,
    status: 'ACTIVE',
    likesCount: 19
  }
]

export const mockItems: TradeItem[] = [
  {
    id: 'item-1',
    title: 'Fender Player Stratocaster Elektro Gitar (Sunburst)',
    description: 'Meksika yapımı, perdeleri sıfır ayarında, sap ayarı yeni yapıldı. Orijinal soft case ile teslim.',
    category: 'muzik-aletleri',
    subCategory: 'elektro-akustik-gitar',
    brand: 'Fender',
    modelName: 'Player Stratocaster HSS',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    images: [
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'İstanbul',
    district: 'Kadıköy',
    targetCategories: ['telefon', 'fotograf-kamera'],
    targetSubCategories: ['kulaklik-mobil-ses', 'aynasiz-dslr'],
    targetDescription: 'Sony XM4/XM5 kulaklık veya MacBook Air ile takas değerlendirilir.',
    openToOffers: true,
    matchScore: 98,
    valueTier: 'HIGH',
    user: {
      id: 'usr-1',
      name: 'Caner Demir',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 23,
      jetTrust: 96,
      verifiedSwapper: true,
      completedSwaps: 18,
      country: 'TR',
      city: 'İstanbul',
      district: 'Kadıköy',
      phone: '+90 533 111 22 33'
    },
    createdAt: 'Bugün',
    daysAgo: 0,
    status: 'ACTIVE',
    likesCount: 34
  },
  {
    id: 'item-2',
    title: 'Sony Alpha A7 III Full-Frame Aynasız Kamera Gövdesi',
    description: 'Shutter sayısı 8.200, sensörü pırıl pırıl. 2 adet orijinal batarya ve şarj aleti yanında.',
    category: 'fotograf-kamera',
    subCategory: 'aynasiz-dslr',
    brand: 'Sony',
    modelName: 'Alpha A7 III (ILCE-7M3)',
    condition: 'VERY_GOOD',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'İstanbul',
    district: 'Beşiktaş',
    targetCategories: ['bilgisayar', 'telefon'],
    targetSubCategories: ['dizustu-laptop', 'akilli-telefon'],
    targetDescription: 'MacBook Pro M2/M3 veya iPhone 15 Pro Max ile takas.',
    openToOffers: false,
    matchScore: 92,
    valueTier: 'PREMIUM',
    user: {
      id: 'usr-2',
      name: 'Elif Kaya',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 9,
      jetTrust: 91,
      verifiedSwapper: true,
      completedSwaps: 12,
      country: 'TR',
      city: 'İstanbul',
      district: 'Beşiktaş',
      phone: '+90 542 333 44 55'
    },
    createdAt: 'Dün',
    daysAgo: 1,
    status: 'ACTIVE',
    likesCount: 47
  },
  {
    id: 'item-3',
    title: 'PlayStation 5 Dijital Sürüm + 2 DualSense Kol',
    description: 'Kutulu, faturalı, sorunsuz cihaz. Şarj istasyonu ve 2 adet beyaz kol ile birlikte.',
    category: 'oyun-konsolu',
    subCategory: 'konsol-cihazlari',
    brand: 'Sony',
    modelName: 'PlayStation 5 Digital Edition',
    condition: 'LIKE_NEW',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'İzmir',
    district: 'Alsancak',
    targetCategories: ['telefon', 'bisiklet-surus'],
    targetSubCategories: ['akilli-telefon', 'katlanir-sehir'],
    targetDescription: 'iPhone 14/15 veya katlanır elektrikli bisiklet ile takas.',
    openToOffers: true,
    matchScore: 89,
    valueTier: 'HIGH',
    user: {
      id: 'usr-3',
      name: 'Mehmet Eren',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 15,
      jetTrust: 93,
      verifiedSwapper: true,
      completedSwaps: 14,
      country: 'TR',
      city: 'İzmir',
      district: 'Alsancak',
      phone: '+90 530 444 55 66'
    },
    createdAt: '3 gün önce',
    daysAgo: 3,
    status: 'ACTIVE',
    likesCount: 52
  },
  {
    id: 'item-4',
    title: 'Trek Marlin 7 Dağ Bisikleti (L Kadro, 29 Jant)',
    description: 'RockShox kilitli maşa, Shimano Deore 1x10 vites grubu, hidrolik disk frenler.',
    category: 'bisiklet-surus',
    subCategory: 'dag-yol-bisikleti',
    brand: 'Trek',
    modelName: 'Marlin 7 Gen 3',
    condition: 'LIKE_NEW',
    tradeMethod: 'HAND_TO_HAND',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'TR',
    city: 'Ankara',
    district: 'Çankaya',
    targetCategories: ['oyun-konsolu', 'bilgisayar'],
    targetSubCategories: ['konsol-cihazlari', 'dizustu-laptop'],
    targetDescription: 'PlayStation 5 veya güçlü oyun monitörü + iPad ile takas.',
    openToOffers: true,
    matchScore: 86,
    valueTier: 'HIGH',
    user: {
      id: 'usr-4',
      name: 'Bora Aktaş',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 17,
      jetTrust: 97,
      verifiedSwapper: true,
      completedSwaps: 21,
      country: 'TR',
      city: 'Ankara',
      district: 'Çankaya',
      phone: '+90 535 777 88 99'
    },
    createdAt: '5 gün önce',
    daysAgo: 5,
    status: 'ACTIVE',
    likesCount: 28
  },
  {
    id: 'item-5',
    title: 'Vintage Seiko 5 Otomatik Saat (1984 Japon Üretim)',
    description: 'Orijinal kadran, paslanmaz çelik kasa, günlük sapması çok iyi durumda koleksiyonluk saat.',
    category: 'saat-koleksiyon',
    subCategory: 'mekanik-otomatik-saat',
    brand: 'Seiko',
    modelName: 'Seiko 5 7S26',
    condition: 'GOOD',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'DE',
    city: 'Berlin',
    district: 'Kreuzberg',
    targetCategories: ['fotograf-kamera', 'saat-koleksiyon'],
    targetSubCategories: ['kamera-lensleri', 'vintage-antika'],
    targetDescription: 'Analog lensler (Helios 44-2, Canon FD) veya retro fotoğraf makinesi ile takas.',
    openToOffers: true,
    matchScore: 84,
    valueTier: 'MEDIUM',
    user: {
      id: 'usr-5',
      name: 'Markus Schmidt',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 31,
      jetTrust: 95,
      verifiedSwapper: true,
      completedSwaps: 29,
      country: 'DE',
      city: 'Berlin',
      district: 'Kreuzberg',
      phone: '+49 170 1234567'
    },
    createdAt: '12 gün önce',
    daysAgo: 12,
    status: 'ACTIVE',
    likesCount: 16
  },
  {
    id: 'item-6',
    title: 'DJI Mini 3 Pro Drone + Fly More Combo Plus',
    description: 'DJI RC ekranlı kumanda, 3 adet batarya, şarj istasyonu ve orijinal taşıma çantası.',
    category: 'fotograf-kamera',
    subCategory: 'drone-aksiyon',
    brand: 'DJI',
    modelName: 'Mini 3 Pro',
    condition: 'LIKE_NEW',
    tradeMethod: 'BOTH',
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80'
    ],
    country: 'UK',
    city: 'Londra',
    district: 'Camden',
    targetCategories: ['bilgisayar', 'telefon'],
    targetSubCategories: ['dizustu-laptop', 'akilli-telefon'],
    targetDescription: 'MacBook Air M2 veya iPhone 15 Pro ile takas.',
    openToOffers: false,
    matchScore: 91,
    valueTier: 'PREMIUM',
    user: {
      id: 'usr-6',
      name: 'Oliver Green',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 11,
      jetTrust: 98,
      verifiedSwapper: true,
      completedSwaps: 16,
      country: 'UK',
      city: 'Londra',
      district: 'Camden',
      phone: '+44 7700 900077'
    },
    createdAt: '24 gün önce',
    daysAgo: 24,
    status: 'ACTIVE',
    likesCount: 39
  }
]

// PRD Madde 12: 3'lü Eşleşme Zinciri (Swap Chain Örneği)
// Selim (iPad Air verir) -> Elif (Sony A7 verir) -> Bora (Trek Bisiklet verir) -> Selim
export const mockSwapChains: SwapChain[] = [
  {
    id: 'chain-1',
    matchScore: 99,
    description: "3'lü Akıllı Takas Döngüsü: Herkes tam olarak istediği ürüne kavuşur!",
    status: 'PROPOSED',
    nodes: [
      {
        user: mockCurrentUser, // Selim
        givesItem: mockMyPortfolio[1], // iPad Air 5
        receivesItem: mockItems[3],    // Trek Marlin 7 Bisiklet (Bora'dan)
      },
      {
        user: mockItems[1].user, // Elif Kaya
        givesItem: mockItems[1], // Sony Alpha A7 III
        receivesItem: mockMyPortfolio[1], // iPad Air 5 (Selim'den)
      },
      {
        user: mockItems[3].user, // Bora Aktaş
        givesItem: mockItems[3], // Trek Marlin 7 Bisiklet
        receivesItem: mockItems[1], // Sony Alpha A7 III (Elif'ten)
      },
    ]
  }
]

