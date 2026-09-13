import { prisma } from '@/lib/prisma'
import { JetMatchCandidateItem } from './types'

export interface CandidateDiscoveryParams {
  sourceItemId: string
  sourceUserId: string
  targetCategoryIds: string[]
  limit?: number
}

/**
 * Discovers candidate items from the database based on category requirements,
 * strictly excluding the source user's items and non-AVAILABLE items.
 * Guarantees privacy: No email, phone, or password is ever selected.
 */
export async function discoverCandidateItems(
  params: CandidateDiscoveryParams
): Promise<JetMatchCandidateItem[]> {
  const { sourceItemId, sourceUserId, targetCategoryIds, limit = 100 } = params

  if (targetCategoryIds.length === 0) {
    return []
  }

  const items = await prisma.item.findMany({
    where: {
      status: 'AVAILABLE',
      userId: { not: sourceUserId },
      id: { not: sourceItemId },
      categoryId: { in: targetCategoryIds },
    },
    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameTr: true,
          nameEn: true,
          icon: true,
        }
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
          // CRITICAL: NEVER select email, phone, password, or role
        }
      },
      wants: {
        select: {
          id: true,
          itemId: true,
          categoryId: true,
          brand: true,
          model: true,
          minimumCondition: true,
          country: true,
          city: true,
          maxDistanceKm: true,
          keywords: true,
          note: true,
          priority: true,
          isFlexible: true,
        },
        orderBy: {
          priority: 'asc',
        }
      }
    },
    take: limit,
  })

  return items as unknown as JetMatchCandidateItem[]
}
