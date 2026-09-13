import { prisma } from '@/lib/prisma'
import { ItemStatus, Prisma } from '@prisma/client'
import { validateCreateOffer } from './validation'
import { serializeTradeOffer, TradeOfferWithRelations } from './serialization'
import { CreateOfferInput, SerializedTradeOffer, ListOffersFilter } from './types'

const offerInclude = {
  sender: {
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
  receiver: {
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
  items: {
    include: {
      item: {
        include: {
          category: {
            select: {
              id: true,
              nameTr: true,
              nameEn: true,
            },
          },
        },
      },
    },
  },
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    status: number
  }
}

/**
 * Creates a new TradeOffer in a transaction.
 */
export async function createTradeOffer(
  input: CreateOfferInput
): Promise<ServiceResult<SerializedTradeOffer>> {
  const validation = await validateCreateOffer(input)
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const { senderId, receiverId, offeredItemIds, requestedItemIds, note } = validation.data

  try {
    const createdOffer = await prisma.$transaction(async (tx) => {
      // Create the TradeOffer record
      const offer = await tx.tradeOffer.create({
        data: {
          senderId,
          receiverId,
          note,
          status: 'PENDING',
          contactRevealed: false,
          items: {
            create: [
              ...offeredItemIds.map((itemId) => ({
                itemId,
                role: 'OFFERED' as const,
              })),
              ...requestedItemIds.map((itemId) => ({
                itemId,
                role: 'REQUESTED' as const,
              })),
            ],
          },
        },
        include: offerInclude,
      })

      return offer
    })

    return {
      success: true,
      data: serializeTradeOffer(createdOffer as TradeOfferWithRelations, senderId),
    }
  } catch (error: unknown) {
    console.error('Error in createTradeOffer:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Teklif oluşturulurken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

/**
 * Accepts a TradeOffer in a transaction.
 * Re-validates that all participating items are still AVAILABLE.
 * Transitions offer to ACCEPTED.
 * Transitions all participating items to PENDING_TRADE.
 * Auto-cancels conflicting pending offers containing any of the participating items.
 */
export async function acceptTradeOffer(
  offerId: string,
  userId: string
): Promise<ServiceResult<SerializedTradeOffer>> {
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: offerId },
    include: offerInclude,
  })

  if (!offer) {
    return {
      success: false,
      error: {
        code: 'OFFER_NOT_FOUND',
        message: 'Teklif bulunamadı.',
        status: 404,
      },
    }
  }

  if (offer.receiverId !== userId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED_RECEIVER',
        message: 'Yalnızca teklifi alan taraf teklifi kabul edebilir.',
        status: 403,
      },
    }
  }

  if (offer.status !== 'PENDING') {
    return {
      success: false,
      error: {
        code: 'INVALID_STATUS_TRANSITION',
        message: `Bu teklif artık beklemede değil (${offer.status}). Kabul edilemez.`,
        status: 400,
      },
    }
  }

  const allItemIds = offer.items.map((i) => i.itemId)

  try {
    const updatedOffer = await prisma.$transaction(async (tx) => {
      // 1. Re-check all items are still AVAILABLE
      const currentItems = await tx.item.findMany({
        where: { id: { in: allItemIds } },
        select: { id: true, title: true, status: true },
      })

      for (const item of currentItems) {
        if (item.status !== 'AVAILABLE') {
          throw new Error(`ITEM_NOT_AVAILABLE:${item.title}`)
        }
      }

      // 2. Update offer status to ACCEPTED
      const accepted = await tx.tradeOffer.update({
        where: { id: offerId },
        data: {
          status: 'ACCEPTED',
          contactRevealed: false, // Strict Zero Contact Reveal
        },
        include: offerInclude,
      })

      // 3. Mark all items as PENDING_TRADE
      await tx.item.updateMany({
        where: { id: { in: allItemIds } },
        data: {
          status: ItemStatus.PENDING_TRADE,
        },
      })

      // 4. Find and auto-cancel conflicting pending offers
      const conflictingOffers = await tx.tradeOffer.findMany({
        where: {
          id: { not: offerId },
          status: 'PENDING',
          items: {
            some: {
              itemId: { in: allItemIds },
            },
          },
        },
        select: { id: true },
      })

      if (conflictingOffers.length > 0) {
        const conflictingIds = conflictingOffers.map((o) => o.id)
        await tx.tradeOffer.updateMany({
          where: { id: { in: conflictingIds } },
          data: {
            status: 'CANCELLED',
          },
        })
      }

      return accepted
    })

    return {
      success: true,
      data: serializeTradeOffer(updatedOffer as TradeOfferWithRelations, userId),
    }
  } catch (error: unknown) {
    const err = error as Error
    if (err.message && err.message.startsWith('ITEM_NOT_AVAILABLE:')) {
      const itemTitle = err.message.replace('ITEM_NOT_AVAILABLE:', '')
      return {
        success: false,
        error: {
          code: 'ITEM_NOT_AVAILABLE',
          message: `"${itemTitle}" artık takasa uygun durumda değil. Teklif kabul edilemez.`,
          status: 400,
        },
      }
    }

    console.error('Error in acceptTradeOffer:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Teklif kabul edilirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

/**
 * Rejects a TradeOffer. Only receiver can reject. Items remain AVAILABLE.
 */
export async function rejectTradeOffer(
  offerId: string,
  userId: string
): Promise<ServiceResult<SerializedTradeOffer>> {
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: offerId },
    include: offerInclude,
  })

  if (!offer) {
    return {
      success: false,
      error: {
        code: 'OFFER_NOT_FOUND',
        message: 'Teklif bulunamadı.',
        status: 404,
      },
    }
  }

  if (offer.receiverId !== userId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED_RECEIVER',
        message: 'Yalnızca teklifi alan taraf teklifi reddedebilir.',
        status: 403,
      },
    }
  }

  if (offer.status !== 'PENDING') {
    return {
      success: false,
      error: {
        code: 'INVALID_STATUS_TRANSITION',
        message: `Bu teklif artık beklemede değil (${offer.status}). Reddedilemez.`,
        status: 400,
      },
    }
  }

  try {
    const updatedOffer = await prisma.tradeOffer.update({
      where: { id: offerId },
      data: {
        status: 'REJECTED',
      },
      include: offerInclude,
    })

    return {
      success: true,
      data: serializeTradeOffer(updatedOffer as TradeOfferWithRelations, userId),
    }
  } catch (error: unknown) {
    console.error('Error in rejectTradeOffer:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Teklif reddedilirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

/**
 * Cancels a TradeOffer. Only sender can cancel. Items remain AVAILABLE.
 */
export async function cancelTradeOffer(
  offerId: string,
  userId: string
): Promise<ServiceResult<SerializedTradeOffer>> {
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: offerId },
    include: offerInclude,
  })

  if (!offer) {
    return {
      success: false,
      error: {
        code: 'OFFER_NOT_FOUND',
        message: 'Teklif bulunamadı.',
        status: 404,
      },
    }
  }

  if (offer.senderId !== userId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED_SENDER',
        message: 'Yalnızca teklifi gönderen taraf teklifi iptal edebilir.',
        status: 403,
      },
    }
  }

  if (offer.status !== 'PENDING') {
    return {
      success: false,
      error: {
        code: 'INVALID_STATUS_TRANSITION',
        message: `Bu teklif artık beklemede değil (${offer.status}). İptal edilemez.`,
        status: 400,
      },
    }
  }

  try {
    const updatedOffer = await prisma.tradeOffer.update({
      where: { id: offerId },
      data: {
        status: 'CANCELLED',
      },
      include: offerInclude,
    })

    return {
      success: true,
      data: serializeTradeOffer(updatedOffer as TradeOfferWithRelations, userId),
    }
  } catch (error: unknown) {
    console.error('Error in cancelTradeOffer:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Teklif iptal edilirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

/**
 * Retrieves a single TradeOffer detail by ID. Ensures user is participant.
 */
export async function getTradeOfferDetail(
  offerId: string,
  userId: string
): Promise<ServiceResult<SerializedTradeOffer>> {
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: offerId },
    include: offerInclude,
  })

  if (!offer) {
    return {
      success: false,
      error: {
        code: 'OFFER_NOT_FOUND',
        message: 'Teklif bulunamadı.',
        status: 404,
      },
    }
  }

  if (offer.senderId !== userId && offer.receiverId !== userId) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bu teklifi görüntüleme yetkiniz yok.',
        status: 403,
      },
    }
  }

  return {
    success: true,
    data: serializeTradeOffer(offer as TradeOfferWithRelations, userId),
  }
}

/**
 * Lists user's offers (sent, received, or all) with optional status filter.
 */
export async function listUserOffers(
  filter: ListOffersFilter
): Promise<ServiceResult<SerializedTradeOffer[]>> {
  const { userId, type = 'all', status } = filter

  const where: Prisma.TradeOfferWhereInput = {}

  if (status) {
    where.status = status
  }

  if (type === 'received') {
    where.receiverId = userId
  } else if (type === 'sent') {
    where.senderId = userId
  } else {
    where.OR = [{ receiverId: userId }, { senderId: userId }]
  }

  try {
    const offers = await prisma.tradeOffer.findMany({
      where,
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    })

    const serialized = offers.map((o) =>
      serializeTradeOffer(o as TradeOfferWithRelations, userId)
    )

    return {
      success: true,
      data: serialized,
    }
  } catch (error: unknown) {
    console.error('Error in listUserOffers:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Teklifler yüklenirken bir hata oluştu.',
        status: 500,
      },
    }
  }
}
