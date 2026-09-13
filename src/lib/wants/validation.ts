import { ItemCondition } from '@prisma/client'

export const MAX_WANTS_PER_ITEM = 10
const VALID_CONDITIONS: ItemCondition[] = ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR']

export interface WantValidationError {
  index: number
  field: string
  message: string
}

export function validateWants(wants: unknown): { isValid: boolean; errors: WantValidationError[] } {
  const errors: WantValidationError[] = []

  if (!wants) {
    return { isValid: true, errors: [] }
  }

  if (!Array.isArray(wants)) {
    return {
      isValid: false,
      errors: [{ index: -1, field: 'wants', message: 'Wants alanı bir dizi (array) olmalıdır.' }]
    }
  }

  if (wants.length > MAX_WANTS_PER_ITEM) {
    return {
      isValid: false,
      errors: [{ index: -1, field: 'wants', message: `Bir ilana en fazla ${MAX_WANTS_PER_ITEM} takas isteği eklenebilir.` }]
    }
  }

  wants.forEach((wantItem: unknown, index: number) => {
    if (typeof wantItem !== 'object' || wantItem === null) {
      errors.push({ index, field: 'item', message: 'Geçersiz istek nesnesi.' })
      return
    }

    const want = wantItem as Record<string, unknown>

    if (want.brand && typeof want.brand === 'string' && want.brand.length > 80) {
      errors.push({ index, field: 'brand', message: 'Marka en fazla 80 karakter olabilir.' })
    }

    if (want.model && typeof want.model === 'string' && want.model.length > 120) {
      errors.push({ index, field: 'model', message: 'Model en fazla 120 karakter olabilir.' })
    }

    if (want.keywords && typeof want.keywords === 'string' && want.keywords.length > 500) {
      errors.push({ index, field: 'keywords', message: 'Anahtar kelimeler en fazla 500 karakter olabilir.' })
    }

    if (want.note && typeof want.note === 'string' && want.note.length > 1000) {
      errors.push({ index, field: 'note', message: 'İstek notu en fazla 1000 karakter olabilir.' })
    }

    if (want.minimumCondition && !VALID_CONDITIONS.includes(want.minimumCondition as ItemCondition)) {
      errors.push({ index, field: 'minimumCondition', message: 'Geçersiz minimum ürün durumu seçildi.' })
    }

    if (want.maxDistanceKm !== undefined && want.maxDistanceKm !== null) {
      const distance = Number(want.maxDistanceKm)
      if (isNaN(distance) || distance < 0 || distance > 1000) {
        errors.push({ index, field: 'maxDistanceKm', message: 'Maksimum mesafe 0 ile 1000 km arasında olmalıdır.' })
      }
    }

    if (want.priority !== undefined && want.priority !== null) {
      const p = Number(want.priority)
      if (isNaN(p) || p < 0 || p > 100) {
        errors.push({ index, field: 'priority', message: 'Öncelik değeri 0 ile 100 arasında olmalıdır.' })
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}
