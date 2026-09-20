import { prisma } from '@/lib/prisma'

export interface PublicFavoriteItem {
  id: string
  itemId: string
  createdAt: Date
  item: {
    id: string
    title: string
    description: string
    condition: string
    tradeMethod: string
    images: string[]
    country: string
    city: string
    status: string
    valueTier: string | null
    viewCount: number
    createdAt: Date
    category: {
      id: string
      slug: string
      nameTr: string
      nameEn: string
      icon: string | null
    }
    user: {
      id: string
      name: string
      avatar: string | null
      city: string
      country: string
      rating: number
      reviewCount: number
    }
  }
}

/**
 * Fetch all favorites for a user, sorted by most recent first.
 * Never exposes sensitive user credentials (email, phone, password).
 */
export async function getUserFavorites(userId: string): Promise<PublicFavoriteItem[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      itemId: true,
      createdAt: true,
      item: {
        select: {
          id: true,
          title: true,
          description: true,
          condition: true,
          tradeMethod: true,
          images: true,
          country: true,
          city: true,
          status: true,
          valueTier: true,
          viewCount: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              slug: true,
              nameTr: true,
              nameEn: true,
              icon: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              city: true,
              country: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
      },
    },
  })

  return favorites as PublicFavoriteItem[]
}

/**
 * Check if a specific item is favorited by a user.
 */
export async function isItemFavorited(userId: string, itemId: string): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    select: { id: true },
  })

  return Boolean(favorite)
}

/**
 * Get a set/array of all item IDs favorited by a user (for bulk UI status).
 */
export async function getUserFavoriteItemIds(userId: string): Promise<string[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { itemId: true },
  })

  return favorites.map(f => f.itemId)
}

export type AddFavoriteResult =
  | { success: true; isFavorite: true; alreadyExisted: boolean }
  | { success: false; error: 'ITEM_NOT_FOUND' | 'UNAUTHORIZED' }

/**
 * Add an item to favorites idempotently.
 * Fails with ITEM_NOT_FOUND if the item does not exist.
 * If already favorited, safely returns success without error or duplicate rows.
 */
export async function addFavorite(userId: string, itemId: string): Promise<AddFavoriteResult> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true },
  })

  if (!item) {
    return { success: false, error: 'ITEM_NOT_FOUND' }
  }

  // Idempotent upsert
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    select: { id: true },
  })

  if (existing) {
    return { success: true, isFavorite: true, alreadyExisted: true }
  }

  await prisma.favorite.create({
    data: {
      userId,
      itemId,
    },
  })

  return { success: true, isFavorite: true, alreadyExisted: false }
}

export type RemoveFavoriteResult = { success: true; isFavorite: false }

/**
 * Remove an item from favorites idempotently.
 * If the item was not favorited, safely succeeds without error.
 */
export async function removeFavorite(userId: string, itemId: string): Promise<RemoveFavoriteResult> {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      itemId,
    },
  })

  return { success: true, isFavorite: false }
}
