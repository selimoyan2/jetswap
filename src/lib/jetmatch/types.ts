import { ItemCondition, ItemStatus, TradeMethod } from '@prisma/client'

export type JetMatchType = 'MUTUAL' | 'ONE_WAY'

export type MatchLabel = 'Mükemmel Takas' | 'Güçlü Eşleşme' | 'Uygun Takas' | 'Keşfet'

export type ReasonCode =
  | 'MUTUAL_WANT'
  | 'CATEGORY_MATCH'
  | 'CONDITION_MATCH'
  | 'SAME_CITY'
  | 'SAME_COUNTRY'
  | 'FLEXIBLE_WANT'
  | 'PRIORITY_WANT'

export interface MatchReason {
  code: ReasonCode
  message: string
  points?: number
}

export interface ScoreBreakdown {
  rawScore: number
  maxAvailableScore: number
  normalizedScore: number
  reciprocityPoints: number
  categoryPoints: number
  conditionPoints: number
  locationPoints: number
  priorityBonus: number
}

export interface CandidatePublicUser {
  id: string
  name: string
  avatar: string | null
  city: string
  country: string
  rating: number
  reviewCount: number
}

export interface JetMatchCandidateItem {
  id: string
  userId: string
  title: string
  description: string
  categoryId: string
  category?: {
    id: string
    slug: string
    nameTr: string
    nameEn: string
    icon?: string | null
  } | null
  condition: ItemCondition
  tradeMethod: TradeMethod
  images: string[]
  country: string
  city: string
  status: ItemStatus
  createdAt: Date | string
  user: CandidatePublicUser
  wants?: Array<{
    id: string
    itemId: string
    categoryId?: string | null
    brand?: string | null
    model?: string | null
    minimumCondition?: ItemCondition | null
    country?: string | null
    city?: string | null
    maxDistanceKm?: number | null
    keywords?: string | null
    note?: string | null
    priority: number
    isFlexible: boolean
  }>
}

export interface JetMatchResult {
  candidateItem: JetMatchCandidateItem
  matchType: JetMatchType
  score: number
  label: MatchLabel
  reasons: MatchReason[]
  breakdown: ScoreBreakdown
  matchedWantId?: string
  reciprocalWantId?: string
  canOffer: boolean
}

export interface JetMatchItemResult {
  sourceItem: {
    id: string
    title: string
    categoryId: string
    category?: {
      id: string
      slug?: string
      nameTr: string
      nameEn: string
      icon?: string | null
    } | null
    images?: string[]
    status?: ItemStatus
    city: string
    country: string
  }
  matches: JetMatchResult[]
  totalMatches: number
  code?: string
}

export interface MatcherOptions {
  limit?: number
  minScore?: number
}
