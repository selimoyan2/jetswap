import {
  JetTrustComponents,
  JetTrustLevel,
  JetTrustResult,
  JetTrustSignals,
  ProfileSignals,
  ReliabilitySignals,
  ReviewSignals,
} from './types'
import { generateExplanations, JETTRUST_DISCLAIMER } from './explanations'

export function scoreAccountFoundation(accountAgeDays: number): number {
  if (accountAgeDays < 7) return 2
  if (accountAgeDays <= 29) return 5
  if (accountAgeDays <= 89) return 8
  if (accountAgeDays <= 179) return 11
  return 15
}

export function scoreProfileCompleteness(profile: ProfileSignals): number {
  let score = 0
  if (profile.hasName) score += 1
  if (profile.hasEmail) score += 2
  if (profile.hasPhone) score += 2
  if (profile.hasAvatar) score += 2
  if (profile.hasBio) score += 1
  if (profile.hasCountry) score += 1
  if (profile.hasCity) score += 1
  return Math.min(10, score)
}

export function scoreCompletedTrades(completedTrades: number): number {
  if (completedTrades <= 0) return 0
  if (completedTrades === 1) return 10
  if (completedTrades === 2) return 16
  if (completedTrades <= 4) return 22
  if (completedTrades <= 7) return 27
  if (completedTrades <= 14) return 31
  return 35
}

export function scoreReviewReputation(reviews: ReviewSignals): number {
  if (reviews.count <= 0 || reviews.average === null) {
    return 0
  }

  // 1. Quality component (max 22)
  let quality = 0
  const avg = reviews.average
  if (avg < 2.0) {
    quality = 0
  } else if (avg < 2.5) {
    quality = 4
  } else if (avg < 3.0) {
    quality = 8
  } else if (avg < 3.5) {
    quality = 12
  } else if (avg < 4.0) {
    quality = 16
  } else if (avg < 4.5) {
    quality = 19
  } else {
    quality = 22
  }

  // 2. Confidence component (max 8)
  let confidence = 0
  const count = reviews.count
  if (count === 1) {
    confidence = 2
  } else if (count === 2) {
    confidence = 3
  } else if (count <= 4) {
    confidence = 5
  } else if (count <= 9) {
    confidence = 7
  } else {
    confidence = 8
  }

  return quality + confidence
}

export function scoreTradeReliability(reliability: ReliabilitySignals): number {
  const total = reliability.completed + reliability.cancelled
  if (total === 0) {
    return 5 // Neutral baseline when no history exists
  }

  const ratio = reliability.completed / total
  if (ratio >= 0.9) return 10
  if (ratio >= 0.75) return 8
  if (ratio >= 0.6) return 6
  if (ratio >= 0.4) return 4
  return 2
}

export function determineJetTrustLevel(score: number): {
  level: JetTrustLevel
  label: string
} {
  if (score >= 85) {
    return { level: 'HIGH_TRUST', label: 'Yüksek Güven' }
  }
  if (score >= 70) {
    return { level: 'TRUSTED', label: 'Güvenilir' }
  }
  if (score >= 50) {
    return { level: 'ESTABLISHED', label: 'Yerleşik' }
  }
  if (score >= 30) {
    return { level: 'DEVELOPING', label: 'Gelişiyor' }
  }
  return { level: 'NEW', label: 'Yeni' }
}

/**
 * Pure deterministic JetTrust V1 calculator.
 * Strictly bounded between 0 and 100.
 */
export function calculateJetTrust(signals: JetTrustSignals): JetTrustResult {
  const accountFoundation = scoreAccountFoundation(signals.accountAgeDays)
  const profileCompleteness = scoreProfileCompleteness(signals.profile)
  const completedTrades = scoreCompletedTrades(signals.completedTrades)
  const reviewReputation = scoreReviewReputation(signals.reviews)
  const tradeReliability = scoreTradeReliability(signals.reliability)

  const rawScore =
    accountFoundation +
    profileCompleteness +
    completedTrades +
    reviewReputation +
    tradeReliability

  const score = Math.max(0, Math.min(100, Math.round(rawScore)))
  const { level, label } = determineJetTrustLevel(score)

  const components: JetTrustComponents = {
    accountFoundation,
    profileCompleteness,
    completedTrades,
    reviewReputation,
    tradeReliability,
  }

  const totalAttempts = signals.reliability.completed + signals.reliability.cancelled
  const reliabilityRatio =
    totalAttempts > 0
      ? Math.round((signals.reliability.completed / totalAttempts) * 100) / 100
      : null

  const explanations = generateExplanations(components, signals)

  return {
    score,
    level,
    label,
    components,
    signals: {
      accountAgeDays: signals.accountAgeDays,
      completedTrades: signals.completedTrades,
      reviewCount: signals.reviews.count,
      reviewAverage: signals.reviews.average,
      reliabilityRatio,
    },
    explanations,
    disclaimer: JETTRUST_DISCLAIMER,
  }
}
