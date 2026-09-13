import { resolveCategoryId } from '@/lib/categories'
import { StructuredWantInput, NormalizedWant } from './types'

export async function normalizeWants(wants: StructuredWantInput[]): Promise<NormalizedWant[]> {
  if (!Array.isArray(wants) || wants.length === 0) {
    return []
  }

  const normalized: NormalizedWant[] = []

  for (let i = 0; i < wants.length; i++) {
    const want = wants[i]

    let resolvedCatId: string | null = null
    if (want.categoryId) {
      resolvedCatId = await resolveCategoryId(want.categoryId)
    }

    normalized.push({
      categoryId: resolvedCatId,
      brand: typeof want.brand === 'string' && want.brand.trim().length > 0 ? want.brand.trim() : null,
      model: typeof want.model === 'string' && want.model.trim().length > 0 ? want.model.trim() : null,
      minimumCondition: want.minimumCondition || null,
      country: typeof want.country === 'string' && want.country.trim().length > 0 ? want.country.trim() : 'TR',
      city: typeof want.city === 'string' && want.city.trim().length > 0 ? want.city.trim() : null,
      maxDistanceKm: want.maxDistanceKm !== undefined && want.maxDistanceKm !== null ? Math.round(Number(want.maxDistanceKm)) : null,
      keywords: typeof want.keywords === 'string' && want.keywords.trim().length > 0 ? want.keywords.trim() : null,
      note: typeof want.note === 'string' && want.note.trim().length > 0 ? want.note.trim() : null,
      priority: typeof want.priority === 'number' && !isNaN(want.priority) ? want.priority : i,
      isFlexible: Boolean(want.isFlexible),
    })
  }

  return normalized
}
