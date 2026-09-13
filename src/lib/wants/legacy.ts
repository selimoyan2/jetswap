import { StructuredWantInput } from './types'

/**
 * Converts legacy targetCategories and targetDescription into structured want input records.
 */
export function convertLegacyToWants(
  targetCategories?: string[] | null,
  targetDescription?: string | null
): StructuredWantInput[] {
  const cats = Array.isArray(targetCategories)
    ? targetCategories.filter(c => typeof c === 'string' && c.trim().length > 0)
    : []

  if (cats.length === 0) {
    if (targetDescription && targetDescription.trim().length > 0) {
      return [
        {
          categoryId: null,
          note: targetDescription.trim(),
          priority: 0,
          isFlexible: true,
        }
      ]
    }
    return []
  }

  return cats.map((catSlug, index) => ({
    categoryId: catSlug.trim(),
    note: index === 0 && targetDescription ? targetDescription.trim() : null,
    priority: index,
    isFlexible: true,
  }))
}

/**
 * Derives legacy targetCategories and targetDescription from structured wants
 * so legacy UI components and database fields remain backward-compatible.
 */
export function syncLegacyFromWants(
  wants?: StructuredWantInput[] | null,
  fallbackDescription?: string | null
): { targetCategories: string[]; targetDescription: string } {
  if (!Array.isArray(wants) || wants.length === 0) {
    return {
      targetCategories: [],
      targetDescription: fallbackDescription && fallbackDescription.trim().length > 0
        ? fallbackDescription.trim()
        : 'Her türlü mantıklı takas teklifine açığım'
    }
  }

  const targetCategories: string[] = []
  const descParts: string[] = []

  wants.forEach((w) => {
    if (w.categoryId && !targetCategories.includes(w.categoryId)) {
      targetCategories.push(w.categoryId)
    }

    const wantDetails = [
      w.brand,
      w.model,
      w.minimumCondition ? `(En az ${w.minimumCondition})` : null,
      w.note
    ].filter(Boolean).join(' ')

    if (wantDetails) {
      descParts.push(wantDetails)
    }
  })

  let targetDescription = descParts.join(' | ')
  if (!targetDescription) {
    targetDescription = fallbackDescription && fallbackDescription.trim().length > 0
      ? fallbackDescription.trim()
      : 'Her türlü mantıklı takas teklifine açığım'
  }

  return {
    targetCategories,
    targetDescription
  }
}
