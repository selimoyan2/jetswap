import { ItemCondition } from '@prisma/client'

const CONDITION_RANK: Record<ItemCondition, number> = {
  BRAND_NEW: 4,
  LIKE_NEW: 3,
  GOOD: 2,
  FAIR: 1,
}

/**
 * Locale-safe text normalizer (handles Turkish characters İ, ı, etc.)
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Checks whether candidate item condition satisfies the minimum condition requirement.
 * If minimum condition is undefined or null, any condition is acceptable.
 */
export function isConditionSatisfied(
  minimumCondition?: ItemCondition | null,
  candidateCondition?: ItemCondition | null
): boolean {
  if (!minimumCondition) return true
  if (!candidateCondition) return false

  const minRank = CONDITION_RANK[minimumCondition] || 1
  const candidateRank = CONDITION_RANK[candidateCondition] || 1

  return candidateRank >= minRank
}

/**
 * Checks category equivalence.
 */
export function checkCategoryMatch(
  wantCategoryId?: string | null,
  candidateCategoryId?: string | null
): boolean {
  if (!wantCategoryId || !candidateCategoryId) return false
  return wantCategoryId.trim() === candidateCategoryId.trim()
}

/**
 * Checks location alignment between want/source and candidate item.
 */
export function checkLocationSignals(
  wantLocation: { country?: string | null; city?: string | null } | null,
  sourceLocation: { country?: string | null; city?: string | null },
  candidateLocation: { country?: string | null; city?: string | null }
): { sameCity: boolean; sameCountry: boolean } {
  const targetCountry = normalizeText(wantLocation?.country || sourceLocation.country || 'TR')
  const targetCity = normalizeText(wantLocation?.city || sourceLocation.city || '')

  const candidateCountry = normalizeText(candidateLocation.country || 'TR')
  const candidateCity = normalizeText(candidateLocation.city || '')

  const sameCountry = targetCountry.length > 0 && candidateCountry.length > 0 && targetCountry === candidateCountry
  const sameCity = sameCountry && targetCity.length > 0 && candidateCity.length > 0 && targetCity === candidateCity

  return { sameCity, sameCountry }
}

export interface ReciprocityAnalysis {
  isMutual: boolean
  isOneWayCompatible: boolean
  reciprocalWantId?: string
  reciprocalNote?: string
}

/**
 * Performs reciprocal analysis:
 * Evaluates candidate's ItemWant[] against the source item.
 * - MUTUAL: Candidate explicitly requested source item's category and condition.
 * - ONE_WAY: Candidate has a flexible preference (isFlexible: true) that can accommodate the source.
 */
export function analyzeReciprocity(
  sourceItem: {
    id: string
    categoryId: string
    condition: ItemCondition
  },
  candidateItem: {
    wants?: Array<{
      id: string
      categoryId?: string | null
      minimumCondition?: ItemCondition | null
      isFlexible: boolean
      note?: string | null
    }>
  }
): ReciprocityAnalysis {
  if (!candidateItem.wants || candidateItem.wants.length === 0) {
    // If candidate has no wants defined, they might be open, but we cannot confirm reciprocity
    return {
      isMutual: false,
      isOneWayCompatible: true,
    }
  }

  // 1. Check for exact category match in candidate's wants
  for (const cWant of candidateItem.wants) {
    if (cWant.categoryId && checkCategoryMatch(cWant.categoryId, sourceItem.categoryId)) {
      // Check condition
      if (isConditionSatisfied(cWant.minimumCondition, sourceItem.condition)) {
        return {
          isMutual: true,
          isOneWayCompatible: true,
          reciprocalWantId: cWant.id,
          reciprocalNote: cWant.note || undefined,
        }
      }
    }
  }

  // 2. Check for flexible wants in candidate's preferences
  const flexibleWant = candidateItem.wants.find(w => w.isFlexible)
  if (flexibleWant) {
    return {
      isMutual: false,
      isOneWayCompatible: true,
      reciprocalWantId: flexibleWant.id,
      reciprocalNote: flexibleWant.note || undefined,
    }
  }

  // No mutual or flexible match from candidate side
  return {
    isMutual: false,
    isOneWayCompatible: false,
  }
}
