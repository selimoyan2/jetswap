export type ItemCondition = 
  | 'BRAND_NEW'      // Sıfır / Kutusunda
  | 'LIKE_NEW'       // Sıfıra Yakın
  | 'VERY_GOOD'      // Çok İyi
  | 'GOOD'           // İyi Durumda
  | 'FAIR'           // Kullanılmış
  | 'REPAIR_NEEDED'  // Onarım Gerekli

export type ItemStatus = 'ACTIVE' | 'IN_SWAP' | 'SWAPPED' | 'PASSIVE'
export type TradeMethod = 'HAND_TO_HAND' | 'CARGO_ONLY' | 'BOTH'

// PRD Madde 16 - Teklif Durumları
export type TradeOfferStatus = 
  | 'SUBMITTED'         // Gönderildi
  | 'SEEN'              // Görüldü
  | 'NEGOTIATING'       // Görüşülüyor
  | 'COUNTER_OFFERED'   // Karşı Teklif
  | 'PRE_AGREEMENT'     // Ön Anlaşma
  | 'CONTACT_REVEALED'  // İletişim Açıldı
  | 'COMPLETED'         // Takas Tamamlandı
  | 'REJECTED'          // Reddedildi
  | 'CANCELLED'         // İptal Edildi

export type ReportReason = 
  | 'CASH_DEMAND'       // Para / Satış Talebi
  | 'FAKE_PRODUCT'      // Sahte / Taklit Ürün
  | 'FORBIDDEN_ITEM'    // Yasaklı / Ahlaka Aykırı Ürün
  | 'WRONG_CATEGORY'    // Yanlış Kategori
  | 'SPAM'              // Spam / Yanıltıcı
  | 'OTHER'             // Diğer

export type TimeFilterScope = 'all' | 'today' | 'yesterday' | '7days' | '30days'
export type LocationFilterScope = 'all' | 'nearby' | 'city' | 'country'

export interface User {
  id: string
  name: string
  avatar: string
  country: string
  city: string
  district?: string      // Semt / İlçe (örn: "Kadıköy", "Mitte")
  phone?: string
  email?: string
  jetTrust: number       // PRD Madde 22: JetTrust Skoru (0 - 100)
  verifiedSwapper: boolean // PRD Madde 23: Doğrulanmış Profil (Verified Swapper)
  completedSwaps: number // Başarıyla tamamlanan takas sayısı
  rating: number         // 1 - 5 yıldız
  reviewCount: number
}

// Alt Kategori Yapısı (PRD Madde 7 & 9)
export interface SubCategory {
  id: string
  slug: string
  nameTr: string
  nameEn: string
  count?: number
}

export interface Category {
  id: string
  slug: string
  nameTr: string
  nameEn: string
  icon: string
  count: number
  subCategories: SubCategory[]
}

export interface TradeItem {
  id: string
  title: string
  description: string
  category: string
  subCategory?: string    // Alt Kategori (örn: "aynasiz-kamera", "elektro-gitar")
  brand?: string         // Marka (PRD Madde 7)
  modelName?: string     // Model (PRD Madde 7)
  condition: ItemCondition
  tradeMethod: TradeMethod
  images: string[]
  country: string
  city: string
  district?: string      // Semt / İlçe (örn: "Kadıköy", "Kreuzberg", "Camden")
  targetCategories: string[]
  targetSubCategories?: string[] // İstenen Alt Kategoriler
  targetDescription: string
  openToOffers: boolean  // PRD Madde 8: "Tekliflere Açığım"
  matchScore?: number    // PRD Madde 11: JetMatch Uyumu (%95 Match vb.)
  valueTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'PREMIUM'
  user: User
  createdAt: string
  daysAgo: number        // 0: Bugün, 1: Dün, 2-7: Son 7 gün, 8-30: Son 30 gün
  status: ItemStatus
  isFavorite?: boolean
  likesCount?: number
}

export interface TradeOffer {
  id: string
  sender: User
  receiver: User
  offeredItems: TradeItem[]
  requestedItems: TradeItem[]
  status: TradeOfferStatus
  note?: string
  contactRevealed: boolean
  createdAt: string
}

// PRD Madde 12: 3'lü Zincir Takas (Swap Chain / Triangular Trade)
export interface SwapChainNode {
  user: User
  givesItem: TradeItem
  receivesItem: TradeItem
}

export interface SwapChain {
  id: string
  matchScore: number
  description: string
  status: 'PROPOSED' | 'CONFIRMED' | 'EXECUTING' | 'COMPLETED'
  nodes: [SwapChainNode, SwapChainNode, SwapChainNode] // A -> B -> C -> A
}

