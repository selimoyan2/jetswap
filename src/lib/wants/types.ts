import { ItemCondition } from '@prisma/client'

export interface StructuredWantInput {
  id?: string
  categoryId?: string | null
  brand?: string | null
  model?: string | null
  minimumCondition?: ItemCondition | null
  country?: string | null
  city?: string | null
  maxDistanceKm?: number | null
  keywords?: string | null
  note?: string | null
  priority?: number
  isFlexible?: boolean
}

export interface NormalizedWant {
  categoryId: string | null
  brand: string | null
  model: string | null
  minimumCondition: ItemCondition | null
  country: string | null
  city: string | null
  maxDistanceKm: number | null
  keywords: string | null
  note: string | null
  priority: number
  isFlexible: boolean
}

export interface StructuredWantOutput {
  id: string
  itemId: string
  categoryId?: string | null
  category?: {
    id: string
    slug: string
    nameTr: string
    nameEn: string
    icon?: string | null
  } | null
  brand?: string | null
  model?: string | null
  minimumCondition?: ItemCondition | null
  country?: string | null
  city?: string | null
  maxDistanceKm?: number | null
  keywords?: string | null
  note?: string | null
  priority: number
  isFlexible: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
