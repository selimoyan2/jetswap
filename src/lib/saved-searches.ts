import { prisma } from '@/lib/prisma'
import { ItemCondition, TradeMethod } from '@prisma/client'

export interface SavedSearchCriteria {
  query?: string | null
  categoryId?: string | null
  condition?: ItemCondition | null
  tradeMethod?: TradeMethod | null
  country?: string | null
  city?: string | null
}

export interface CreateSavedSearchInput extends SavedSearchCriteria {
  name: string
}

export interface UpdateSavedSearchInput {
  name?: string
  query?: string | null
  categoryId?: string | null
  condition?: ItemCondition | null
  tradeMethod?: TradeMethod | null
  country?: string | null
  city?: string | null
}

export interface PublicSavedSearch {
  id: string
  userId: string
  name: string
  query: string | null
  categoryId: string | null
  category?: {
    id: string
    slug: string
    nameTr: string
    nameEn: string
    icon: string | null
  } | null
  condition: ItemCondition | null
  tradeMethod: TradeMethod | null
  country: string | null
  city: string | null
  createdAt: Date
  updatedAt: Date
  searchUrl: string
}

const VALID_CONDITIONS: ItemCondition[] = ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR']
const VALID_TRADE_METHODS: TradeMethod[] = ['HAND_TO_HAND', 'CARGO_ONLY', 'BOTH']

/**
 * Builds canonical search URL from saved search criteria.
 */
export function buildSearchUrl(criteria: {
  query?: string | null
  categoryId?: string | null
  categorySlug?: string | null
  condition?: ItemCondition | null
  tradeMethod?: TradeMethod | null
  city?: string | null
}): string {
  const params = new URLSearchParams()

  if (criteria.query && criteria.query.trim()) {
    params.set('search', criteria.query.trim())
  }
  if (criteria.categorySlug) {
    params.set('category', criteria.categorySlug)
  } else if (criteria.categoryId) {
    params.set('category', criteria.categoryId)
  }
  if (criteria.city && criteria.city.trim() && criteria.city !== 'all') {
    params.set('city', criteria.city.trim())
  }
  if (criteria.condition) {
    params.set('condition', criteria.condition)
  }
  if (criteria.tradeMethod) {
    params.set('tradeMethod', criteria.tradeMethod)
  }

  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}

/**
 * List all saved searches for a given user.
 */
export async function getUserSavedSearches(userId: string): Promise<PublicSavedSearch[]> {
  const records = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        },
      },
    },
  })

  return records.map(r => ({
    ...r,
    searchUrl: buildSearchUrl({
      query: r.query,
      categoryId: r.categoryId,
      categorySlug: r.category?.slug,
      condition: r.condition,
      tradeMethod: r.tradeMethod,
      city: r.city,
    }),
  }))
}

/**
 * Read a single saved search by ID with strict ownership verification.
 */
export async function getSavedSearchById(id: string, userId: string): Promise<PublicSavedSearch | null> {
  const record = await prisma.savedSearch.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        },
      },
    },
  })

  if (!record) return null

  return {
    ...record,
    searchUrl: buildSearchUrl({
      query: record.query,
      categoryId: record.categoryId,
      categorySlug: record.category?.slug,
      condition: record.condition,
      tradeMethod: record.tradeMethod,
      city: record.city,
    }),
  }
}

export type CreateSavedSearchResult =
  | { success: true; data: PublicSavedSearch }
  | {
      success: false
      error:
        | 'INVALID_NAME'
        | 'INVALID_QUERY'
        | 'INVALID_CATEGORY'
        | 'INVALID_CONDITION'
        | 'INVALID_TRADE_METHOD'
        | 'INVALID_CITY'
        | 'DUPLICATE_SAVED_SEARCH'
      message: string
    }

/**
 * Validates and creates a new saved search for the user.
 * Prevents exact duplicate records where both normalized name and normalized criteria match.
 */
export async function createSavedSearch(
  userId: string,
  input: CreateSavedSearchInput
): Promise<CreateSavedSearchResult> {
  // Validate name
  const name = input.name?.trim()
  if (!name || name.length < 1 || name.length > 80) {
    return {
      success: false,
      error: 'INVALID_NAME',
      message: 'Arama adı 1 ile 80 karakter arasında olmalıdır.',
    }
  }

  // Validate query
  const query = input.query ? input.query.trim() : null
  if (query && query.length > 100) {
    return {
      success: false,
      error: 'INVALID_QUERY',
      message: 'Arama terimi en fazla 100 karakter olabilir.',
    }
  }

  // Validate category if supplied
  let categoryId = input.categoryId ? input.categoryId.trim() : null
  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    })
    if (!categoryExists) {
      // Try resolving by slug as fallback
      const catBySlug = await prisma.category.findUnique({
        where: { slug: categoryId },
        select: { id: true },
      })
      if (catBySlug) {
        categoryId = catBySlug.id
      } else {
        return {
          success: false,
          error: 'INVALID_CATEGORY',
          message: 'Belirtilen kategori bulunamadı.',
        }
      }
    }
  }

  // Validate condition
  const condition = input.condition || null
  if (condition && !VALID_CONDITIONS.includes(condition)) {
    return {
      success: false,
      error: 'INVALID_CONDITION',
      message: 'Geçersiz ürün kondisyonu.',
    }
  }

  // Validate tradeMethod
  const tradeMethod = input.tradeMethod || null
  if (tradeMethod && !VALID_TRADE_METHODS.includes(tradeMethod)) {
    return {
      success: false,
      error: 'INVALID_TRADE_METHOD',
      message: 'Geçersiz takas teslimat yöntemi.',
    }
  }

  // Validate city
  const city = input.city ? input.city.trim() : null
  if (city && city.length > 50) {
    return {
      success: false,
      error: 'INVALID_CITY',
      message: 'Şehir adı en fazla 50 karakter olabilir.',
    }
  }

  const country = input.country ? input.country.trim().toUpperCase() : 'TR'

  // Normalization for duplicate checking (with Turkish locale support)
  const normName = name.toLocaleLowerCase('tr-TR')
  const normQuery = query ? query.toLocaleLowerCase('tr-TR') : null
  const normCity = city ? city.toLocaleLowerCase('tr-TR') : null

  // Check duplicate: BOTH normalized name AND normalized criteria match
  const userSearches = await prisma.savedSearch.findMany({
    where: { userId },
  })

  const isDuplicate = userSearches.some(existing => {
    const existingNormName = existing.name.trim().toLocaleLowerCase('tr-TR')
    if (existingNormName !== normName) return false

    const existingNormQuery = existing.query ? existing.query.trim().toLocaleLowerCase('tr-TR') : null
    const existingNormCity = existing.city ? existing.city.trim().toLocaleLowerCase('tr-TR') : null
    const existingNormCountry = (existing.country || 'TR').trim().toUpperCase()

    return (
      existingNormQuery === normQuery &&
      (existing.categoryId || null) === categoryId &&
      (existing.condition || null) === condition &&
      (existing.tradeMethod || null) === tradeMethod &&
      existingNormCity === normCity &&
      existingNormCountry === country
    )
  })

  if (isDuplicate) {
    return {
      success: false,
      error: 'DUPLICATE_SAVED_SEARCH',
      message: 'Aynı isim ve kriterlere sahip kayıtlı bir aramanız zaten mevcut.',
    }
  }

  const record = await prisma.savedSearch.create({
    data: {
      userId,
      name,
      query,
      categoryId,
      condition,
      tradeMethod,
      country,
      city,
    },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        },
      },
    },
  })

  return {
    success: true,
    data: {
      ...record,
      searchUrl: buildSearchUrl({
        query: record.query,
        categoryId: record.categoryId,
        categorySlug: record.category?.slug,
        condition: record.condition,
        tradeMethod: record.tradeMethod,
        city: record.city,
      }),
    },
  }
}

export type UpdateSavedSearchResult =
  | { success: true; data: PublicSavedSearch }
  | {
      success: false
      error:
        | 'NOT_FOUND'
        | 'INVALID_NAME'
        | 'INVALID_QUERY'
        | 'INVALID_CATEGORY'
        | 'INVALID_CONDITION'
        | 'INVALID_TRADE_METHOD'
        | 'INVALID_CITY'
      message: string
    }

/**
 * Update an existing saved search with strict ownership verification.
 */
export async function updateSavedSearch(
  id: string,
  userId: string,
  input: UpdateSavedSearchInput
): Promise<UpdateSavedSearchResult> {
  const existing = await prisma.savedSearch.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Kayıtlı arama bulunamadı.',
    }
  }

  const dataToUpdate: any = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (!name || name.length < 1 || name.length > 80) {
      return {
        success: false,
        error: 'INVALID_NAME',
        message: 'Arama adı 1 ile 80 karakter arasında olmalıdır.',
      }
    }
    dataToUpdate.name = name
  }

  if (input.query !== undefined) {
    const query = input.query ? input.query.trim() : null
    if (query && query.length > 100) {
      return {
        success: false,
        error: 'INVALID_QUERY',
        message: 'Arama terimi en fazla 100 karakter olabilir.',
      }
    }
    dataToUpdate.query = query
  }

  if (input.categoryId !== undefined) {
    let categoryId = input.categoryId ? input.categoryId.trim() : null
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      if (!categoryExists) {
        const catBySlug = await prisma.category.findUnique({
          where: { slug: categoryId },
          select: { id: true },
        })
        if (catBySlug) {
          categoryId = catBySlug.id
        } else {
          return {
            success: false,
            error: 'INVALID_CATEGORY',
            message: 'Belirtilen kategori bulunamadı.',
          }
        }
      }
    }
    dataToUpdate.categoryId = categoryId
  }

  if (input.condition !== undefined) {
    if (input.condition && !VALID_CONDITIONS.includes(input.condition)) {
      return {
        success: false,
        error: 'INVALID_CONDITION',
        message: 'Geçersiz ürün kondisyonu.',
      }
    }
    dataToUpdate.condition = input.condition
  }

  if (input.tradeMethod !== undefined) {
    if (input.tradeMethod && !VALID_TRADE_METHODS.includes(input.tradeMethod)) {
      return {
        success: false,
        error: 'INVALID_TRADE_METHOD',
        message: 'Geçersiz takas teslimat yöntemi.',
      }
    }
    dataToUpdate.tradeMethod = input.tradeMethod
  }

  if (input.city !== undefined) {
    const city = input.city ? input.city.trim() : null
    if (city && city.length > 50) {
      return {
        success: false,
        error: 'INVALID_CITY',
        message: 'Şehir adı en fazla 50 karakter olabilir.',
      }
    }
    dataToUpdate.city = city
  }

  if (input.country !== undefined) {
    dataToUpdate.country = input.country ? input.country.trim().toUpperCase() : 'TR'
  }

  const updated = await prisma.savedSearch.update({
    where: { id },
    data: dataToUpdate,
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        },
      },
    },
  })

  return {
    success: true,
    data: {
      ...updated,
      searchUrl: buildSearchUrl({
        query: updated.query,
        categoryId: updated.categoryId,
        categorySlug: updated.category?.slug,
        condition: updated.condition,
        tradeMethod: updated.tradeMethod,
        city: updated.city,
      }),
    },
  }
}

export type DeleteSavedSearchResult =
  | { success: true }
  | { success: false; error: 'NOT_FOUND'; message: string }

/**
 * Delete an existing saved search with strict ownership verification.
 */
export async function deleteSavedSearch(
  id: string,
  userId: string
): Promise<DeleteSavedSearchResult> {
  const existing = await prisma.savedSearch.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Kayıtlı arama bulunamadı.',
    }
  }

  await prisma.savedSearch.delete({
    where: { id },
  })

  return { success: true }
}
