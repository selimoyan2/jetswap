export type JetTrustLevel =
  | 'NEW'
  | 'DEVELOPING'
  | 'ESTABLISHED'
  | 'TRUSTED'
  | 'HIGH_TRUST'

export interface ProfileSignals {
  hasName: boolean
  hasEmail: boolean
  hasPhone: boolean
  hasAvatar: boolean
  hasBio: boolean
  hasCountry: boolean
  hasCity: boolean
}

export interface ReviewSignals {
  count: number
  average: number | null
}

export interface ReliabilitySignals {
  completed: number
  cancelled: number
}

export interface JetTrustSignals {
  accountAgeDays: number
  profile: ProfileSignals
  completedTrades: number
  reviews: ReviewSignals
  reliability: ReliabilitySignals
}

export interface JetTrustComponents {
  accountFoundation: number // 0–15
  profileCompleteness: number // 0–10
  completedTrades: number // 0–35
  reviewReputation: number // 0–30
  tradeReliability: number // 0–10
}

export interface JetTrustResult {
  score: number
  level: JetTrustLevel
  label: string
  components: JetTrustComponents
  signals: {
    accountAgeDays: number
    completedTrades: number
    reviewCount: number
    reviewAverage: number | null
    reliabilityRatio: number | null
  }
  explanations: string[]
  disclaimer: string
}

export interface JetTrustPublicSummary {
  score: number
  level: JetTrustLevel
  label: string
}
