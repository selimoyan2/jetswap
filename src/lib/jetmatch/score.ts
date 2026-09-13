import { JetMatchType, MatchLabel, ScoreBreakdown } from './types'

export const WEIGHTS = {
  RECIPROCAL_WANT: 40,
  CATEGORY: 15,
  BRAND: 10,       // 0 in V1 if structured brand missing on Item
  MODEL: 10,       // 0 in V1 if structured model missing on Item
  CONDITION: 5,
  LOCATION_CITY: 10,
  LOCATION_COUNTRY: 5,
  DISTANCE: 5,     // 0 in V1 (no geospatial coordinates)
  TRUST: 5,        // 0 in V1 (no JetTrust engine yet)
} as const

// Total theoretical maximum is 100
export const THEORETICAL_MAX_SCORE = 100

// In V1, the maximum available signals without faking data:
// Reciprocal (40) + Category (15) + Condition (5) + City (10) + Priority Bonus (5) = 75
export const V1_MAX_AVAILABLE_SCORE = 75

export interface ScoringInput {
  isMutual: boolean
  isCategoryMatched: boolean
  isConditionSatisfied: boolean
  sameCity: boolean
  sameCountry: boolean
  wantPriority: number
}

export function calculateScoreBreakdown(input: ScoringInput): ScoreBreakdown {
  let reciprocityPoints = 0
  if (input.isMutual) {
    reciprocityPoints = WEIGHTS.RECIPROCAL_WANT // +40 for MUTUAL
  }

  const categoryPoints = input.isCategoryMatched ? WEIGHTS.CATEGORY : 0
  const conditionPoints = input.isConditionSatisfied ? WEIGHTS.CONDITION : 0

  let locationPoints = 0
  if (input.sameCity) {
    locationPoints = WEIGHTS.LOCATION_CITY
  } else if (input.sameCountry) {
    locationPoints = WEIGHTS.LOCATION_COUNTRY
  }

  // Priority bonus (derived from want.priority order)
  let priorityBonus = 0
  if (input.wantPriority === 0) {
    priorityBonus = 5
  } else if (input.wantPriority === 1) {
    priorityBonus = 3
  } else if (input.wantPriority === 2) {
    priorityBonus = 1
  }

  const rawScore = reciprocityPoints + categoryPoints + conditionPoints + locationPoints
  const totalEarned = rawScore + priorityBonus

  // Normalization formula
  let normalizedScore = Math.round((totalEarned / V1_MAX_AVAILABLE_SCORE) * 100)
  normalizedScore = Math.min(100, Math.max(0, normalizedScore))

  // Non-reciprocal (ONE_WAY) matches must never receive the reciprocity floor advantage,
  // and cannot exceed 74 to prevent false "Mükemmel Takas" / "Güçlü Eşleşme" claims.
  if (!input.isMutual) {
    normalizedScore = Math.min(74, normalizedScore)
  }

  return {
    rawScore,
    maxAvailableScore: V1_MAX_AVAILABLE_SCORE,
    normalizedScore,
    reciprocityPoints,
    categoryPoints,
    conditionPoints,
    locationPoints,
    priorityBonus,
  }
}

export function getMatchLabel(score: number, matchType: JetMatchType): MatchLabel {
  if (matchType === 'MUTUAL' && score >= 90) {
    return 'Mükemmel Takas'
  }
  if (matchType === 'MUTUAL' && score >= 75) {
    return 'Güçlü Eşleşme'
  }
  if (score >= 60) {
    return 'Uygun Takas'
  }
  return 'Keşfet'
}
