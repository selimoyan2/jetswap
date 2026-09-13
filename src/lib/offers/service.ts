import { prisma } from '@/lib/prisma'
import { ItemStatus, Prisma } from '@prisma/client'
import { validateCreateOffer, validateCounterOffer } from './validation'
import { serializeTradeOffer, TradeOfferWithRelations } from './serialization'
import {
  CreateOfferInput,
  CreateCounterOfferInput,
  SerializedTradeOffer,
  ListOffersFilter,
  OfferRevisionSummary,
} from './types'

const offerInclude = {
  sender: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
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
      email: true,
      phone: true,
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
 * Traverses a TradeOffer's linear revision chain from root to leaf
 * and returns the chronological history.
 */
export async function getOfferRevisionChain(offerId: string): Promise<OfferRevisionSummary[]> {
  try {
    // 1. Walk up to root
    let currentId = offerId
    const visited = new Set<string>()
    while (true) {
      visited.add(currentId)
      const parent = await prisma.tradeOffer.findUnique({
        where: { id: currentId },
        select: { id: true, parentOfferId: true },
      })
      if (!parent || !parent.parentOfferId || visited.has(parent.parentOfferId)) {
        break
      }
      currentId = parent.parentOfferId
    }
    const rootId = currentId

    // 2. Walk down from root
    const chain: OfferRevisionSummary[] = []
    let nextId: string | null = rootId
    const downVisited = new Set<string>()

    while (nextId && !downVisited.has(nextId)) {
      downVisited.add(nextId)
      const currentTargetId: string = nextId
      const node = await prisma.tradeOffer.findUnique({
        where: { id: currentTargetId },
        include: {
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
          counterOffers: {
            select: { id: true },
            take: 1,
          },
        },
      })
      if (!node) break

      chain.push({
        id: node.id,
        revision: node.revision,
        status: node.status,
        createdAt: node.createdAt.toISOString(),
        sender: {
          id: node.sender.id,
          name: node.sender.name,
          avatar: node.sender.avatar,
          city: node.sender.city,
          country: node.sender.country,
          rating: node.sender.rating,
          reviewCount: node.sender.reviewCount,
        },
      })

      const childId: string | null = node.counterOffers[0]?.id ?? null
      nextId = childId
    }

    return chain
  } catch (err) {
    console.error('Error fetching offer revision chain:', err)
    return []
  }
}

/**
 * Creates a structured counter-offer (revision) in a transaction.
 * - Parent offer transitions to COUNTER_OFFERED.
 * - New child offer created with status PENDING, revision = parent.revision + 1.
 * - Items remain AVAILABLE until accepted.
 * - Concurrency protection: guarantees only 1 child per parent.
 */
export async function createCounterOffer(
  input: CreateCounterOfferInput
): Promise<ServiceResult<SerializedTradeOffer>> {
  const validation = await validateCounterOffer(input)
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const { parentOffer, newSenderId, newReceiverId, offeredItemIds, requestedItemIds, note } = validation.data

  try {
    const createdChild = await prisma.$transaction(async (tx) => {
      // 1. Re-verify parent offer inside transaction
      const freshParent = await tx.tradeOffer.findUnique({
        where: { id: parentOffer.id },
        include: { counterOffers: { select: { id: true } } },
      })

      if (!freshParent) {
        throw { code: 'OFFER_NOT_FOUND', message: 'Orijinal teklif bulunamadı.', status: 404 }
      }

      if (freshParent.status === 'COUNTER_OFFERED' || freshParent.counterOffers.length > 0) {
        throw { code: 'OFFER_ALREADY_REVISED', message: 'Bu teklife zaten bir karşı teklif oluşturulmuş.', status: 409 }
      }

      if (freshParent.status !== 'PENDING') {
        throw { code: 'OFFER_NOT_PENDING', message: 'Yalnızca bekleyen tekliflere karşı teklif yapılabilir.', status: 400 }
      }

      // 2. Re-verify all participating items are still AVAILABLE
      const allItemIds = [...offeredItemIds, ...requestedItemIds]
      const items = await tx.item.findMany({
        where: { id: { in: allItemIds } },
        select: { id: true, status: true, title: true },
      })

      const unavailable = items.find((i) => i.status !== 'AVAILABLE')
      if (unavailable) {
        throw {
          code: 'ITEM_NOT_AVAILABLE',
          message: `"${unavailable.title}" şu anda takasa uygun durumda değildir.`,
          status: 400,
        }
      }

      // 3. Mark parent as COUNTER_OFFERED
      await tx.tradeOffer.update({
        where: { id: parentOffer.id },
        data: {
          status: 'COUNTER_OFFERED',
        },
      })

      // 4. Create child revision
      const newOffer = await tx.tradeOffer.create({
        data: {
          senderId: newSenderId,
          receiverId: newReceiverId,
          parentOfferId: parentOffer.id,
          revision: (freshParent.revision || 1) + 1,
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

      return newOffer
    })

    const history = await getOfferRevisionChain(createdChild.id)

    return {
      success: true,
      data: serializeTradeOffer(createdChild as TradeOfferWithRelations, newSenderId, history),
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; status?: number }

    // Catch Prisma Unique Constraint Violation (P2002 on parentOfferId)
    if (err && err.code === 'P2002') {
      return {
        success: false,
        error: {
          code: 'OFFER_ALREADY_REVISED',
          message: 'Bu teklife zaten bir karşı teklif oluşturulmuş. Yalnızca en güncel bekleyen teklif üzerinden işlem yapabilirsiniz.',
          status: 409,
        },
      }
    }

    if (err && err.code && err.status) {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message || 'Hata oluştu.',
          status: err.status,
        },
      }
    }
    console.error('Error in createCounterOffer:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Karşı teklif oluşturulurken bir hata oluştu.',
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

  const history = await getOfferRevisionChain(offerId)

  return {
    success: true,
    data: serializeTradeOffer(offer as TradeOfferWithRelations, userId, history),
  }
}

/**
 * Lists user's offers (sent, received, or all) with optional status filter.
 * Only returns the latest revision of any offer chain (counterOffers: { none: {} }).
 */
export async function listUserOffers(
  filter: ListOffersFilter
): Promise<ServiceResult<SerializedTradeOffer[]>> {
  const { userId, type = 'all', status } = filter

  const where: Prisma.TradeOfferWhereInput = {
    counterOffers: { none: {} },
  }

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

/**
 * Approves contact sharing for an ACCEPTED TradeOffer.
 * Core Rules (Sprint 9):
 * 1. Only ACCEPTED offers are eligible.
 * 2. Only sender or receiver can approve.
 * 3. Idempotent: repeated approval from same user is safe and doesn't change timestamps.
 * 4. Mutual approval unlocks contact:
 *    - Both senderContactApprovedAt and receiverContactApprovedAt must exist.
 *    - Sets contactRevealed = true, contactRevealedAt = now() (only set once).
 * 5. Historical COUNTER_OFFERED revisions cannot approve/reveal contact.
 */
export async function approveContactReveal(
  offerId: string,
  userId: string
): Promise<ServiceResult<SerializedTradeOffer>> {
  if (!userId) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Bu işlemi gerçekleştirmek için giriş yapmalısınız.',
        status: 401,
      },
    }
  }

  // 1. Initial check
  const offer = await prisma.tradeOffer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      status: true,
    },
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

  // Participant check
  if (offer.senderId !== userId && offer.receiverId !== userId) {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Bu teklif üzerinde iletişim paylaşımı onaylama yetkiniz bulunmamaktadır.',
        status: 403,
      },
    }
  }

  // Offer status must be ACCEPTED
  if (offer.status !== 'ACCEPTED') {
    return {
      success: false,
      error: {
        code: 'OFFER_NOT_ACCEPTED',
        message: 'İletişim paylaşımı yalnızca kabul edilmiş (ACCEPTED) takas tekliflerinde onaylanabilir.',
        status: 400,
      },
    }
  }

  try {
    const updatedOffer = await prisma.$transaction(async (tx) => {
      // Re-fetch inside transaction for strict race condition safety
      const freshOffer = await tx.tradeOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          status: true,
          senderContactApprovedAt: true,
          receiverContactApprovedAt: true,
          contactRevealed: true,
          contactRevealedAt: true,
        },
      })

      if (!freshOffer) {
        throw { code: 'OFFER_NOT_FOUND', message: 'Teklif bulunamadı.', status: 404 }
      }

      if (freshOffer.status !== 'ACCEPTED') {
        throw {
          code: 'OFFER_NOT_ACCEPTED',
          message: 'İletişim paylaşımı yalnızca kabul edilmiş takas tekliflerinde onaylanabilir.',
          status: 400,
        }
      }

      const isSender = userId === freshOffer.senderId
      const now = new Date()

      // Calculate new approval timestamps (preserve existing for idempotency)
      const senderApprovedAt = isSender
        ? freshOffer.senderContactApprovedAt || now
        : freshOffer.senderContactApprovedAt

      const receiverApprovedAt = !isSender
        ? freshOffer.receiverContactApprovedAt || now
        : freshOffer.receiverContactApprovedAt

      const isMutual = Boolean(senderApprovedAt && receiverApprovedAt)

      // Set contactRevealedAt only once
      const contactRevealedAt = isMutual
        ? freshOffer.contactRevealedAt || now
        : freshOffer.contactRevealedAt

      const updated = await tx.tradeOffer.update({
        where: { id: offerId },
        data: {
          senderContactApprovedAt: senderApprovedAt,
          receiverContactApprovedAt: receiverApprovedAt,
          contactRevealed: isMutual,
          contactRevealedAt,
        },
        include: offerInclude,
      })

      return updated
    })

    const history = await getOfferRevisionChain(offerId)

    return {
      success: true,
      data: serializeTradeOffer(updatedOffer as TradeOfferWithRelations, userId, history),
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; status?: number }
    if (err && err.code && err.status) {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message || 'Hata oluştu.',
          status: err.status,
        },
      }
    }
    console.error('Error in approveContactReveal:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'İletişim paylaşımı onaylanırken bir hata oluştu.',
        status: 500,
      },
    }
  }
}

