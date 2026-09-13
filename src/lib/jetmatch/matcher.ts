import { prisma } from '@/lib/prisma'
import { ItemCondition } from '@prisma/client'
import {
  JetMatchResult,
  JetMatchCandidateItem,
  JetMatchItemResult,
  MatcherOptions,
} from './types'
import {
  isConditionSatisfied,
  checkCategoryMatch,
  checkLocationSignals,
  analyzeReciprocity,
} from './compatibility'
import { calculateScoreBreakdown, getMatchLabel } from './score'
import { buildMatchReasons } from './explanations'
import { discoverCandidateItems } from './candidate'

export interface SourceItemWithWants {
  id: string
  userId: string
  title: string
  categoryId: string
  condition: ItemCondition
  city: string
  country: string
  status: string
  wants: Array<{
    id: string
    categoryId?: string | null
    brand?: string | null
    model?: string | null
    minimumCondition?: ItemCondition | null
    country?: string | null
    city?: string | null
    isFlexible: boolean
    priority: number
    note?: string | null
    category?: {
      id: string
      nameTr: string
      nameEn: string
    } | null
  }>
}

/**
 * Pure function to evaluate a single source item + want against a candidate item.
 * Returns null if hard constraints fail (e.g. condition not satisfied or incompatible category).
 */
export function evaluateCandidateMatch(
  sourceItem: {
    id: string
    categoryId: string
    condition: ItemCondition
    city: string
    country: string
  },
  want: {
    id: string
    categoryId?: string | null
    minimumCondition?: ItemCondition | null
    country?: string | null
    city?: string | null
    isFlexible: boolean
    priority: number
    category?: { nameTr: string } | null
  },
  candidateItem: JetMatchCandidateItem
): JetMatchResult | null {
  // 1. Category check
  const isCategoryMatched = checkCategoryMatch(want.categoryId, candidateItem.categoryId)
  if (!isCategoryMatched && !want.isFlexible) {
    return null
  }

  // 2. Hard constraint: Condition check
  // If user requested minimumCondition, candidate must satisfy it
  if (!isConditionSatisfied(want.minimumCondition, candidateItem.condition)) {
    return null
  }

  // 3. Reciprocal Analysis (HAVE ↔ WANT)
  const reciprocity = analyzeReciprocity(sourceItem, candidateItem)
  const matchType = reciprocity.isMutual ? 'MUTUAL' : 'ONE_WAY'

  // If candidate is not mutual and not one-way compatible (has specific contradictory wants), discard
  if (!reciprocity.isMutual && !reciprocity.isOneWayCompatible) {
    return null
  }

  // 4. Location signals
  const locationSignals = checkLocationSignals(
    { country: want.country, city: want.city },
    { country: sourceItem.country, city: sourceItem.city },
    { country: candidateItem.country, city: candidateItem.city }
  )

  // 5. Score calculation
  const breakdown = calculateScoreBreakdown({
    isMutual: reciprocity.isMutual,
    isCategoryMatched,
    isConditionSatisfied: isConditionSatisfied(want.minimumCondition, candidateItem.condition),
    sameCity: locationSignals.sameCity,
    sameCountry: locationSignals.sameCountry,
    wantPriority: want.priority,
  })

  // 6. Label & Reasons
  const label = getMatchLabel(breakdown.normalizedScore, matchType)
  const reasons = buildMatchReasons({
    matchType,
    breakdown,
    categoryName: want.category?.nameTr,
    isFlexible: want.isFlexible || reciprocity.isOneWayCompatible,
    wantPriority: want.priority,
  })

  return {
    candidateItem,
    matchType,
    score: breakdown.normalizedScore,
    label,
    reasons,
    breakdown,
    matchedWantId: want.id,
    reciprocalWantId: reciprocity.reciprocalWantId,
    canOffer: true,
  }
}

/**
 * Finds all matching candidates for a given source item with structured wants.
 * Applies deduplication, deterministic sorting, and pagination limit.
 */
export async function findMatchesForItem(
  sourceItem: SourceItemWithWants,
  options: MatcherOptions = {}
): Promise<JetMatchResult[]> {
  const limit = Math.min(50, Math.max(1, options.limit || 20))
  const minScore = options.minScore || 0

  if (!sourceItem.wants || sourceItem.wants.length === 0) {
    return []
  }

  // Collect target categories from source wants
  const targetCategoryIds = sourceItem.wants
    .map(w => w.categoryId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  if (targetCategoryIds.length === 0) {
    return []
  }

  // Discover candidate pool from database
  const candidates = await discoverCandidateItems({
    sourceItemId: sourceItem.id,
    sourceUserId: sourceItem.userId,
    targetCategoryIds,
    limit: 100,
  })

  // In-memory map to eliminate duplicate candidate items, retaining the highest scoring match
  const candidateBestMatch = new Map<string, JetMatchResult>()

  for (const candidate of candidates) {
    // A user cannot match with their own item
    if (candidate.userId === sourceItem.userId) continue
    if (candidate.status !== 'AVAILABLE') continue

    for (const want of sourceItem.wants) {
      const match = evaluateCandidateMatch(sourceItem, want, candidate)
      if (!match) continue
      if (match.score < minScore) continue

      const existing = candidateBestMatch.get(candidate.id)
      if (!existing || match.score > existing.score) {
        candidateBestMatch.set(candidate.id, match)
      }
    }
  }

  const results = Array.from(candidateBestMatch.values())

  // Deterministic sorting:
  // 1. Score DESC
  // 2. MUTUAL before ONE_WAY
  // 3. Candidate createdAt DESC
  // 4. Candidate ID ASC
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    if (a.matchType !== b.matchType) {
      return a.matchType === 'MUTUAL' ? -1 : 1
    }
    const timeA = new Date(a.candidateItem.createdAt).getTime()
    const timeB = new Date(b.candidateItem.createdAt).getTime()
    if (timeB !== timeA) {
      return timeB - timeA
    }
    return a.candidateItem.id.localeCompare(b.candidateItem.id)
  })

  return results.slice(0, limit)
}

/**
 * Finds all JetMatch matches for all AVAILABLE items belonging to a user.
 */
export async function findMatchesForUser(
  userId: string,
  options: MatcherOptions = {}
): Promise<JetMatchItemResult[]> {
  const userItems = await prisma.item.findMany({
    where: {
      userId,
      status: 'AVAILABLE',
    },
    select: {
      id: true,
      userId: true,
      title: true,
      categoryId: true,
      condition: true,
      city: true,
      country: true,
      status: true,
      images: true,
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        },
      },
      wants: {
        select: {
          id: true,
          categoryId: true,
          brand: true,
          model: true,
          minimumCondition: true,
          country: true,
          city: true,
          isFlexible: true,
          priority: true,
          note: true,
          category: {
            select: {
              id: true,
              nameTr: true,
              nameEn: true,
            }
          }
        },
        orderBy: {
          priority: 'asc',
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  const results: JetMatchItemResult[] = []

  for (const item of userItems) {
    const matches = await findMatchesForItem(item as unknown as SourceItemWithWants, options)
    results.push({
      sourceItem: {
        id: item.id,
        title: item.title,
        categoryId: item.categoryId,
        category: item.category,
        images: item.images,
        status: item.status,
        city: item.city,
        country: item.country,
      },
      matches,
      totalMatches: matches.length,
      code: item.wants.length === 0 ? 'NO_WANTS' : undefined,
    })
  }

  return results
}
