/**
 * Sprint 11 — JetTrust V1 Test Suite
 * Comprehensive test suite covering pure scoring formulas,
 * signal gathering, revision chain deduplication, levels,
 * explanations, and privacy guarantees.
 */

import {
  calculateJetTrust,
  scoreAccountFoundation,
  scoreProfileCompleteness,
  scoreCompletedTrades,
  scoreReviewReputation,
  scoreTradeReliability,
  determineJetTrustLevel,
  resolveRevisionChainOutcomes,
  TradeOfferChainItem,
  JetTrustSignals,
  JETTRUST_DISCLAIMER,
} from '../src/lib/jettrust'
import { TradeOfferStatus } from '@prisma/client'

let totalTests = 0
let passedTests = 0

function assert(condition: boolean, testName: string) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ PASS: ${testName}`)
  } else {
    console.error(`  ❌ FAIL: ${testName}`)
    throw new Error(`Test failed: ${testName}`)
  }
}

console.log('\n🚀 Starting Sprint 11 — JetTrust V1 Test Suite...\n')

// -------------------------------------------------------------
// Test Helpers & Mock Data
// -------------------------------------------------------------
function createBaseSignals(overrides: Partial<JetTrustSignals> = {}): JetTrustSignals {
  return {
    accountAgeDays: 1,
    profile: {
      hasName: true,
      hasEmail: false,
      hasPhone: false,
      hasAvatar: false,
      hasBio: false,
      hasCountry: false,
      hasCity: false,
    },
    completedTrades: 0,
    reviews: {
      count: 0,
      average: null,
    },
    reliability: {
      completed: 0,
      cancelled: 0,
    },
    ...overrides,
  }
}

// -------------------------------------------------------------
// 1. Account Foundation (0–15)
// -------------------------------------------------------------
console.log('--- 1. Account Foundation Scoring ---')

assert(scoreAccountFoundation(0) === 2, 'ACCOUNT_0_TO_6_DAYS: 0 days scores 2')
assert(scoreAccountFoundation(6) === 2, 'ACCOUNT_0_TO_6_DAYS: 6 days scores 2')
assert(scoreAccountFoundation(7) === 5, 'ACCOUNT_7_TO_29: 7 days scores 5')
assert(scoreAccountFoundation(29) === 5, 'ACCOUNT_7_TO_29: 29 days scores 5')
assert(scoreAccountFoundation(30) === 8, 'ACCOUNT_30_TO_89: 30 days scores 8')
assert(scoreAccountFoundation(89) === 8, 'ACCOUNT_30_TO_89: 89 days scores 8')
assert(scoreAccountFoundation(90) === 11, 'ACCOUNT_90_TO_179: 90 days scores 11')
assert(scoreAccountFoundation(179) === 11, 'ACCOUNT_90_TO_179: 179 days scores 11')
assert(scoreAccountFoundation(180) === 15, 'ACCOUNT_180_PLUS: 180 days scores 15')
assert(scoreAccountFoundation(365) === 15, 'ACCOUNT_180_PLUS: 365 days scores 15')

// -------------------------------------------------------------
// 2. Profile Completeness (0–10)
// -------------------------------------------------------------
console.log('\n--- 2. Profile Completeness Scoring ---')

const emptyProfile = {
  hasName: false,
  hasEmail: false,
  hasPhone: false,
  hasAvatar: false,
  hasBio: false,
  hasCountry: false,
  hasCity: false,
}
assert(scoreProfileCompleteness(emptyProfile) === 0, 'PROFILE_EMPTY: All missing scores 0')

const partialProfile = {
  ...emptyProfile,
  hasName: true,   // +1
  hasEmail: true,  // +2
  hasCity: true,   // +1
}
assert(scoreProfileCompleteness(partialProfile) === 4, 'PROFILE_PARTIAL: Name + Email + City scores 4 (1 + 2 + 1)')

const fullProfile = {
  hasName: true,     // +1
  hasEmail: true,    // +2
  hasPhone: true,    // +2
  hasAvatar: true,   // +2
  hasBio: true,      // +1
  hasCountry: true,  // +1
  hasCity: true,     // +1
}
assert(scoreProfileCompleteness(fullProfile) === 10, 'PROFILE_COMPLETE: Full profile scores exactly 10')

// -------------------------------------------------------------
// 3. Completed Trades (0–35, Diminishing Returns Curve)
// -------------------------------------------------------------
console.log('\n--- 3. Completed Trades Curve ---')

assert(scoreCompletedTrades(0) === 0, 'COMPLETED_0: 0 trades scores 0')
assert(scoreCompletedTrades(1) === 10, 'COMPLETED_1: 1 trade scores 10')
assert(scoreCompletedTrades(2) === 16, 'COMPLETED_2: 2 trades scores 16')
assert(scoreCompletedTrades(3) === 22, 'COMPLETED_3: 3 trades scores 22')
assert(scoreCompletedTrades(4) === 22, 'COMPLETED_4: 4 trades scores 22')
assert(scoreCompletedTrades(5) === 27, 'COMPLETED_5: 5 trades scores 27')
assert(scoreCompletedTrades(7) === 27, 'COMPLETED_7: 7 trades scores 27')
assert(scoreCompletedTrades(8) === 31, 'COMPLETED_8: 8 trades scores 31')
assert(scoreCompletedTrades(14) === 31, 'COMPLETED_14: 14 trades scores 31')
assert(scoreCompletedTrades(15) === 35, 'COMPLETED_15_PLUS: 15 trades scores 35')
assert(scoreCompletedTrades(50) === 35, 'COMPLETED_15_PLUS: 50 trades capped at 35')

// -------------------------------------------------------------
// 4. Review Reputation (0–30: Quality max 22 + Confidence max 8)
// -------------------------------------------------------------
console.log('\n--- 4. Review Reputation Scoring ---')

// No reviews
assert(scoreReviewReputation({ count: 0, average: null }) === 0, 'REVIEWS_NONE: 0 reviews scores 0')
assert(scoreReviewReputation({ count: 0, average: 5.0 }) === 0, 'DEFAULT_USER_RATING_NOT_USED_WITH_ZERO_REVIEWS: Default 5.0 placeholder with 0 reviews scores 0')

// Quality brackets with 10 reviews (full confidence = 8)
assert(scoreReviewReputation({ count: 10, average: 1.5 }) === 8, 'REVIEWS_LOW: < 2.0 has 0 quality + 8 confidence = 8')
assert(scoreReviewReputation({ count: 10, average: 2.2 }) === 12, 'REVIEWS_QUALITY_2_2: 2.0–2.49 has 4 quality + 8 confidence = 12')
assert(scoreReviewReputation({ count: 10, average: 2.8 }) === 16, 'REVIEWS_QUALITY_2_8: 2.5–2.99 has 8 quality + 8 confidence = 16')
assert(scoreReviewReputation({ count: 10, average: 3.2 }) === 20, 'REVIEWS_MEDIUM: 3.0–3.49 has 12 quality + 8 confidence = 20')
assert(scoreReviewReputation({ count: 10, average: 3.8 }) === 24, 'REVIEWS_QUALITY_3_8: 3.5–3.99 has 16 quality + 8 confidence = 24')
assert(scoreReviewReputation({ count: 10, average: 4.2 }) === 27, 'REVIEWS_QUALITY_4_2: 4.0–4.49 has 19 quality + 8 confidence = 27')
assert(scoreReviewReputation({ count: 10, average: 4.9 }) === 30, 'REVIEWS_HIGH: 4.5–5.0 has 22 quality + 8 confidence = 30')

// Confidence brackets with 5.0 average (full quality = 22)
assert(scoreReviewReputation({ count: 1, average: 5.0 }) === 24, 'REVIEWS_ONE_FIVE_STAR: 1 five-star review scores 24 (22 quality + 2 confidence), NOT 30')
assert(scoreReviewReputation({ count: 2, average: 5.0 }) === 25, 'REVIEW_CONFIDENCE_2: 2 reviews scores 25 (22 + 3)')
assert(scoreReviewReputation({ count: 3, average: 5.0 }) === 27, 'REVIEW_CONFIDENCE_3: 3 reviews scores 27 (22 + 5)')
assert(scoreReviewReputation({ count: 5, average: 5.0 }) === 29, 'REVIEW_CONFIDENCE_5: 5 reviews scores 29 (22 + 7)')
assert(scoreReviewReputation({ count: 10, average: 5.0 }) === 30, 'REVIEW_CONFIDENCE_10: 10 reviews scores 30 (22 + 8)')

// -------------------------------------------------------------
// 5. Trade Reliability (0–10: Completed vs Cancelled)
// -------------------------------------------------------------
console.log('\n--- 5. Trade Reliability Scoring ---')

assert(scoreTradeReliability({ completed: 0, cancelled: 0 }) === 5, 'RELIABILITY_NO_HISTORY_NEUTRAL: 0 attempts scores neutral 5')
assert(scoreTradeReliability({ completed: 10, cancelled: 0 }) === 10, 'RELIABILITY_100_PERCENT: 100% completed scores 10')
assert(scoreTradeReliability({ completed: 9, cancelled: 1 }) === 10, 'RELIABILITY_90_PERCENT: 90% completed scores 10')
assert(scoreTradeReliability({ completed: 8, cancelled: 2 }) === 8, 'RELIABILITY_75_PERCENT: 80% completed scores 8 (>= 0.75)')
assert(scoreTradeReliability({ completed: 6, cancelled: 4 }) === 6, 'RELIABILITY_60_PERCENT: 60% completed scores 6 (>= 0.60)')
assert(scoreTradeReliability({ completed: 4, cancelled: 6 }) === 4, 'RELIABILITY_40_PERCENT: 40% completed scores 4 (>= 0.40)')
assert(scoreTradeReliability({ completed: 1, cancelled: 9 }) === 2, 'RELIABILITY_LOW: 10% completed scores 2 (< 0.40)')

// -------------------------------------------------------------
// 6. Overall Pure Score Bounding & Integrity
// -------------------------------------------------------------
console.log('\n--- 6. Score Bounding & Data Integrity ---')

// Brand new account minimum score
const brandNewUser = calculateJetTrust(createBaseSignals())
assert(brandNewUser.score >= 0, 'SCORE_MIN_0: Minimum score is >= 0')
assert(brandNewUser.score <= 100, 'SCORE_MAX_100: Score is <= 100')
assert(Number.isInteger(brandNewUser.score), 'SCORE_INTEGER: Score is an integer')

// Maximum theoretical user
const maxUserSignals: JetTrustSignals = {
  accountAgeDays: 200,      // 15
  profile: fullProfile,     // 10
  completedTrades: 20,      // 35
  reviews: { count: 12, average: 5.0 }, // 30
  reliability: { completed: 20, cancelled: 0 }, // 10
}
const maxUserResult = calculateJetTrust(maxUserSignals)
assert(maxUserResult.score === 100, 'SCORE_MAX_100: Maximum possible signals reach exactly 100')
assert(maxUserResult.level === 'HIGH_TRUST', 'LEVEL_HIGH_TRUST: Score 100 is HIGH_TRUST')
assert(maxUserResult.label === 'Yüksek Güven', 'Level label is Yüksek Güven')

// -------------------------------------------------------------
// 7. JetTrust Level Thresholds
// -------------------------------------------------------------
console.log('\n--- 7. JetTrust Level Thresholds ---')

assert(determineJetTrustLevel(0).level === 'NEW', 'LEVEL_NEW: 0 is NEW')
assert(determineJetTrustLevel(29).level === 'NEW', 'LEVEL_NEW: 29 is NEW')
assert(determineJetTrustLevel(30).level === 'DEVELOPING', 'LEVEL_DEVELOPING: 30 is DEVELOPING')
assert(determineJetTrustLevel(49).level === 'DEVELOPING', 'LEVEL_DEVELOPING: 49 is DEVELOPING')
assert(determineJetTrustLevel(50).level === 'ESTABLISHED', 'LEVEL_ESTABLISHED: 50 is ESTABLISHED')
assert(determineJetTrustLevel(69).level === 'ESTABLISHED', 'LEVEL_ESTABLISHED: 69 is ESTABLISHED')
assert(determineJetTrustLevel(70).level === 'TRUSTED', 'LEVEL_TRUSTED: 70 is TRUSTED')
assert(determineJetTrustLevel(84).level === 'TRUSTED', 'LEVEL_TRUSTED: 84 is TRUSTED')
assert(determineJetTrustLevel(85).level === 'HIGH_TRUST', 'LEVEL_HIGH_TRUST: 85 is HIGH_TRUST')
assert(determineJetTrustLevel(100).level === 'HIGH_TRUST', 'LEVEL_HIGH_TRUST: 100 is HIGH_TRUST')

// -------------------------------------------------------------
// 8. Counter-Offer Revision Chain Deduplication
// -------------------------------------------------------------
console.log('\n--- 8. Revision Chain Deduplication ---')

// Scenario A: 3 revisions of ONE offer (Rev 1 -> Rev 2 -> Rev 3 [COMPLETED])
const multiRevisionChain: TradeOfferChainItem[] = [
  { id: 'rev-1', parentOfferId: null, status: TradeOfferStatus.COUNTER_OFFERED, revision: 1 },
  { id: 'rev-2', parentOfferId: 'rev-1', status: TradeOfferStatus.COUNTER_OFFERED, revision: 2 },
  { id: 'rev-3', parentOfferId: 'rev-2', status: TradeOfferStatus.COMPLETED, revision: 3 },
]
const outcomeA = resolveRevisionChainOutcomes(multiRevisionChain)
assert(outcomeA.completedTrades === 1, 'COUNTER_REVISIONS_NOT_DOUBLE_COUNTED: 3-step revision chain counts as 1 completed trade, NOT 3')
assert(outcomeA.cancelledTrades === 0, 'No cancelled trades in completed chain')

// Scenario B: 2 revisions ending in CANCELLED
const cancelledChain: TradeOfferChainItem[] = [
  { id: 'rev-4', parentOfferId: null, status: TradeOfferStatus.COUNTER_OFFERED, revision: 1 },
  { id: 'rev-5', parentOfferId: 'rev-4', status: TradeOfferStatus.CANCELLED, revision: 2 },
]
const outcomeB = resolveRevisionChainOutcomes(cancelledChain)
assert(outcomeB.completedTrades === 0, '0 completed in cancelled chain')
assert(outcomeB.cancelledTrades === 1, 'Counter-offered parent not counted as cancelled, only 1 cancellation recorded')

// Scenario C: Multiple distinct completed chains
const distinctChains: TradeOfferChainItem[] = [
  { id: 'root-1', parentOfferId: null, status: TradeOfferStatus.COMPLETED, revision: 1 },
  { id: 'root-2', parentOfferId: null, status: TradeOfferStatus.COMPLETED, revision: 1 },
  { id: 'root-3', parentOfferId: null, status: TradeOfferStatus.CANCELLED, revision: 1 },
]
const outcomeC = resolveRevisionChainOutcomes(distinctChains)
assert(outcomeC.completedTrades === 2, '2 distinct completed trades counted')
assert(outcomeC.cancelledTrades === 1, '1 distinct cancelled trade counted')

// Scenario D: Rejected offer does not penalize
const rejectedChain: TradeOfferChainItem[] = [
  { id: 'rej-1', parentOfferId: null, status: TradeOfferStatus.REJECTED, revision: 1 },
]
const outcomeD = resolveRevisionChainOutcomes(rejectedChain)
assert(outcomeD.completedTrades === 0, 'REJECTED_NOT_NEGATIVE: Rejected offer is not completed')
assert(outcomeD.cancelledTrades === 0, 'REJECTED_NOT_NEGATIVE: Rejected offer is NOT counted as cancellation')

// -------------------------------------------------------------
// 9. Explanations & Tone Safety
// -------------------------------------------------------------
console.log('\n--- 9. Explanations & Tone Safety ---')

const newUserSignals = createBaseSignals()
const newResult = calculateJetTrust(newUserSignals)

assert(newResult.explanations.length > 0, 'EXPLANATIONS_EXIST: Explanations list generated')
assert(newResult.disclaimer === JETTRUST_DISCLAIMER, 'Disclaimer text matches specification')

// Verify non-accusatory language
const allExplanationsText = newResult.explanations.join(' ')
assert(!allExplanationsText.includes('Güvensiz'), 'LOW_SCORE_LANGUAGE_NOT_ACCUSATORY: Does not contain "Güvensiz"')
assert(!allExplanationsText.includes('Riskli'), 'LOW_SCORE_LANGUAGE_NOT_ACCUSATORY: Does not contain "Riskli"')
assert(!allExplanationsText.includes('Şüpheli'), 'LOW_SCORE_LANGUAGE_NOT_ACCUSATORY: Does not contain "Şüpheli"')
assert(allExplanationsText.includes('Hesap henüz yeni'), 'Contains constructive framing "Hesap henüz yeni"')

// -------------------------------------------------------------
// 10. Deterministic Idempotency
// -------------------------------------------------------------
console.log('\n--- 10. Determinism & Idempotency ---')

const run1 = calculateJetTrust(maxUserSignals)
const run2 = calculateJetTrust(maxUserSignals)
assert(run1.score === run2.score, 'DETERMINISTIC_SAME_INPUT_SAME_SCORE: run1.score === run2.score')
assert(run1.level === run2.level, 'DETERMINISTIC_SAME_INPUT_SAME_SCORE: run1.level === run2.level')
assert(JSON.stringify(run1.components) === JSON.stringify(run2.components), 'DETERMINISTIC_SAME_INPUT_SAME_SCORE: Components match exactly')

// -------------------------------------------------------------
// 11. Privacy Sanitization
// -------------------------------------------------------------
console.log('\n--- 11. Privacy Sanitization ---')

// Ensure JetTrustResult type does not contain sensitive properties
assert(!('phone' in newResult), 'PRIVATE_PHONE_NOT_SERIALIZED: Result has no phone property')
assert(!('email' in newResult), 'PRIVATE_EMAIL_NOT_SERIALIZED: Result has no email property')
assert(!('password' in newResult), 'PASSWORD_NOT_SERIALIZED: Result has no password property')

console.log('\n======================================================')
console.log(`🎉 Sprint 11 JetTrust Test Suite Complete: ${passedTests}/${totalTests} tests passed!`)
console.log('======================================================\n')
